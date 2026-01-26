import React, { useState, useCallback } from 'react';
import { Card } from './Card';

type Mode = 'upload' | 'import';

interface SkillFormData {
  slug: string;
  displayName: string;
  description: string;
  version: string;
  tags: string;
  repoOwner: string;
  repoName: string;
  skillPath: string;
  authorGithub: string;
  skillContent: string;
}

const INITIAL_FORM: SkillFormData = {
  slug: '',
  displayName: '',
  description: '',
  version: '1.0.0',
  tags: '',
  repoOwner: '',
  repoName: '',
  skillPath: '',
  authorGithub: '',
  skillContent: '',
};

const TAG_SUGGESTIONS = [
  'react', 'typescript', 'nextjs', 'python', 'rust', 'go',
  'testing', 'api', 'database', 'devops', 'security', 'mobile',
] as const;

const GITHUB_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export function SkillSubmitForm(): React.ReactElement {
  const [mode, setMode] = useState<Mode>('import');
  const [form, setForm] = useState<SkillFormData>(INITIAL_FORM);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  function updateField(field: keyof SkillFormData, value: string): void {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'displayName' && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return updated;
    });
  }

  function addTag(tag: string): void {
    const currentTags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      updateField('tags', [...currentTags, tag].join(', '));
    }
  }

  function parseSkillContent(content: string): void {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const fm = frontmatterMatch[1];
      const nameMatch = fm.match(/name:\s*["']?([^"'\n]+)["']?/);
      const descMatch = fm.match(/description:\s*["']?([^"'\n]+)["']?/);
      const tagsMatch = fm.match(/tags:\s*\[([^\]]+)\]/);
      const versionMatch = fm.match(/version:\s*["']?([^"'\n]+)["']?/);

      if (nameMatch) updateField('displayName', nameMatch[1].trim());
      if (descMatch) updateField('description', descMatch[1].trim());
      if (versionMatch) updateField('version', versionMatch[1].trim());
      if (tagsMatch) {
        const tags = tagsMatch[1].replace(/["']/g, '').split(',').map(t => t.trim()).join(', ');
        updateField('tags', tags);
      }
    }
    updateField('skillContent', content);
  }

  async function handleDetect(): Promise<void> {
    if (!githubUrl) return;

    setIsDetecting(true);
    setDetectError(null);

    try {
      const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:tree|blob)\/[^\/]+\/(.+))?/);

      if (!urlMatch) {
        throw new Error('Invalid GitHub URL');
      }

      const [, owner, repo, path = ''] = urlMatch;

      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Repository not found or not public');
      }

      const repoData = await response.json();

      updateField('repoOwner', owner);
      updateField('repoName', repo);
      updateField('authorGithub', owner);
      updateField('displayName', repoData.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));
      updateField('description', repoData.description || '');

      const slug = path ? path.split('/').filter(Boolean).pop() || repo : repo;
      updateField('slug', slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'));

      if (repoData.topics && repoData.topics.length > 0) {
        updateField('tags', repoData.topics.slice(0, 5).join(', '));
      } else {
        const inferredTags: string[] = [];
        const nameLC = (repo + ' ' + (repoData.description || '')).toLowerCase();
        if (nameLC.includes('react')) inferredTags.push('react');
        if (nameLC.includes('typescript') || nameLC.includes('ts')) inferredTags.push('typescript');
        if (nameLC.includes('python')) inferredTags.push('python');
        if (nameLC.includes('skill')) inferredTags.push('skills');
        if (inferredTags.length > 0) {
          updateField('tags', inferredTags.join(', '));
        }
      }

      updateField('skillContent', `[Linked from GitHub: ${owner}/${repo}]`);
      updateField('skillPath', path || '/');

    } catch (err) {
      setDetectError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setIsDetecting(false);
    }
  }

  const handleDragOver = useCallback(function(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(function(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processMarkdownFile = useCallback(function(file: File): void {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      parseSkillContent(event.target?.result as string);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(function(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const mdFile = files.find(f => f.name.endsWith('.md'));

    if (mdFile) {
      processMarkdownFile(mdFile);
    }
  }, [processMarkdownFile]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      processMarkdownFile(file);
    }
  }

  const validation = {
    slug: !form.slug ? 'Slug is required.' : null,
    displayName: !form.displayName ? 'Display name is required.' : null,
    content: mode === 'upload' && !form.skillContent ? 'Upload a SKILL.md file.' : null,
    repo: mode === 'import' && (!form.repoOwner || !form.repoName) ? 'Click Detect to import repo.' : null,
    tags: !form.tags ? 'Add at least one tag.' : null,
  };

  const isImported = mode === 'import' && form.repoOwner && form.repoName;
  const errors = Object.values(validation).filter(Boolean);
  const isValid = errors.length === 0;
  const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

  function generateIssueUrl(): string {
    const skillId = form.repoOwner && form.repoName
      ? `${form.repoOwner}/${form.repoName}/${form.slug}`
      : `community/${form.authorGithub || 'anonymous'}/${form.slug}`;

    const jsonEntry = JSON.stringify({
      id: skillId,
      name: form.displayName,
      description: form.description || '',
      source: `${form.repoOwner}/${form.repoName}`,
      tags: tagsArray,
      author: form.authorGithub || form.repoOwner
    }, null, 2);

    const title = isImported
      ? encodeURIComponent(`[Import] ${form.repoOwner}/${form.repoName}`)
      : encodeURIComponent(`[Skill] ${form.displayName}`);

    const bodyContent = isImported
      ? `## 📦 Import Request: ${form.repoOwner}/${form.repoName}

### Repository
🔗 https://github.com/${form.repoOwner}/${form.repoName}

### Add to \`marketplace/skills.json\`

\`\`\`json
${jsonEntry}
\`\`\`

### Checklist for Maintainer
- [ ] Verify repository is public
- [ ] Add JSON entry to \`marketplace/skills.json\`
- [ ] Add to \`marketplace/skills.json\`

---
**Submitted by:** @${form.authorGithub || 'anonymous'}
**Owner:** @${form.repoOwner} (retains all rights)`
      : `## 📤 Skill Upload: ${form.displayName}

### Add to \`marketplace/skills.json\`

\`\`\`json
${jsonEntry}
\`\`\`

### SKILL.md Content

<details>
<summary>Click to expand</summary>

\`\`\`markdown
${form.skillContent.slice(0, 4000)}${form.skillContent.length > 4000 ? '\n...(truncated)' : ''}
\`\`\`

</details>

### Checklist for Maintainer
- [ ] Review SKILL.md content
- [ ] Add JSON entry to \`marketplace/skills.json\`
- [ ] Add to \`marketplace/skills.json\`

---
**Author:** @${form.authorGithub || 'anonymous'}`;

    const body = encodeURIComponent(bodyContent);
    const labels = isImported ? 'skill-import' : 'skill-submission';
    return `https://github.com/rohitg00/skillkit/issues/new?title=${title}&body=${body}&labels=${labels}`;
  }

  function handleSubmitClick(e: React.MouseEvent): void {
    e.preventDefault();
    if (isValid) {
      const url = generateIssueUrl();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setMode('import')}
          className={`px-6 py-3 font-mono text-sm transition-colors ${
            mode === 'import'
              ? 'text-white border-b-2 border-white -mb-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Import from GitHub
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`px-6 py-3 font-mono text-sm transition-colors ${
            mode === 'upload'
              ? 'text-white border-b-2 border-white -mb-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Upload File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {mode === 'import' && (
            <Card>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-zinc-400">GitHub URL</label>
                <span className="text-xs text-zinc-600">Repo, tree path, or blob</span>
              </div>
              <div className="flex gap-3 mt-2">
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 font-mono text-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-zinc-600"
                />
                <button
                  onClick={handleDetect}
                  disabled={isDetecting || !githubUrl}
                  className={`px-5 py-2.5 font-mono text-sm transition-colors ${
                    isDetecting || !githubUrl
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isDetecting ? 'Detecting...' : 'Detect'}
                </button>
              </div>
              {detectError && (
                <p className="text-red-400 text-xs mt-2 font-mono">{detectError}</p>
              )}
              {isImported && (
                <p className="text-zinc-300 text-xs mt-2 font-mono flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Repository detected - {form.repoOwner}/{form.repoName}
                </p>
              )}
              <p className="text-zinc-600 text-xs mt-3">
                Public repos only. We link to the original - owner retains all rights.
              </p>
            </Card>
          )}

          {mode === 'upload' && (
            <Card
              className={`transition-colors ${isDragging ? 'border-white bg-zinc-900' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center py-6">
                <div className="mb-3">
                  <svg className="w-8 h-8 mx-auto text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm mb-1">
                  {fileName ? (
                    <span className="text-white">{fileName}</span>
                  ) : (
                    'Drop SKILL.md here'
                  )}
                </p>
                <p className="text-zinc-600 text-xs mb-3">or</p>
                <label className="inline-block cursor-pointer">
                  <span className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 text-sm font-mono transition-colors">
                    Choose file
                  </span>
                  <input
                    type="file"
                    accept=".md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </Card>
          )}

          <Card>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-skill"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Display name</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => updateField('displayName', e.target.value)}
                    placeholder="My Skill"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Version</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => updateField('version', e.target.value)}
                    placeholder="1.0.0"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                    placeholder="react, typescript"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 font-mono text-sm focus:ring-1 focus:ring-white focus:border-white outline-none placeholder-zinc-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TAG_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 px-2 py-0.5 border border-zinc-800 transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h4 className="text-sm text-zinc-400 mb-4">Preview</h4>
            <div className="bg-zinc-950 border border-zinc-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-white font-semibold">
                    {form.displayName || 'Skill Name'}
                  </h5>
                  <p className="text-zinc-500 text-sm mt-1">
                    {form.description || 'No description'}
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1">
                  v{form.version}
                </span>
              </div>
              {(form.repoOwner || form.authorGithub) && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mb-3">
                  {form.repoOwner && form.repoName && <span>{form.repoOwner}/{form.repoName}</span>}
                  {form.authorGithub && (
                    <>
                      {form.repoOwner && <span>•</span>}
                      <span>@{form.authorGithub}</span>
                    </>
                  )}
                </div>
              )}
              {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tagsArray.map((tag, i) => (
                    <span key={i} className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 border border-zinc-800">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {isImported ? (
            <Card className="border-blue-900/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-900/30 border border-blue-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm text-white font-medium">Linked Repository</h4>
                  <p className="text-xs text-zinc-500">Skills hosted by @{form.repoOwner}</p>
                </div>
              </div>
              <a
                href={`https://github.com/${form.repoOwner}/${form.repoName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 font-mono flex items-center gap-2"
              >
                github.com/{form.repoOwner}/{form.repoName}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </Card>
          ) : form.skillContent && !form.skillContent.startsWith('[Linked') ? (
            <Card>
              <h4 className="text-sm text-zinc-400 mb-3">SKILL.md</h4>
              <pre className="bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono text-zinc-400 max-h-48 overflow-auto">
                {form.skillContent.slice(0, 1000)}
                {form.skillContent.length > 1000 && '\n...'}
              </pre>
            </Card>
          ) : null}

          {errors.length > 0 && (
            <div className="space-y-1 text-xs font-mono text-yellow-500">
              {errors.map((error, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-yellow-600">•</span> {error}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={!isValid}
            className={`flex items-center justify-center gap-3 w-full py-4 font-mono text-sm transition-all ${
              isValid
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {GITHUB_ICON}
            {isImported ? 'Import to marketplace' : 'Publish skill'}
          </button>

          <p className="text-xs text-zinc-600 text-center font-mono">
            {isImported
              ? 'Links to original repo → Owner retains rights'
              : 'Opens GitHub issue → We review → Added to marketplace'}
          </p>
        </div>
      </div>
    </div>
  );
}
