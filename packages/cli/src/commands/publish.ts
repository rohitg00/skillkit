import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, basename, dirname, resolve, sep } from "node:path";
import {
  colors,
  warn,
  success,
  error,
  step,
  spinner,
  formatQualityBadge,
  getQualityGradeFromScore,
} from "../onboarding/index.js";
import { Command, Option } from "clipanion";
import {
  generateWellKnownIndex,
  type WellKnownSkill,
  SkillScanner,
  formatSummary,
  Severity,
  evaluateSkillDirectory,
  computeSkillIntegrity,
} from "@skillkit/core";
import { formatCount, timeAgo, fetchGitHubActivity } from "../helpers.js";

function sanitizeSkillName(name: string): string | null {
  if (!name || typeof name !== "string") return null;
  const base = basename(name);
  if (
    base !== name ||
    name.includes("..") ||
    name.includes("/") ||
    name.includes("\\")
  ) {
    return null;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return null;
  }
  return name;
}

interface SkillFrontmatter {
  name?: string;
  description?: string;
  tags?: string[];
  version?: string;
}

function parseSkillFrontmatter(content: string): SkillFrontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const frontmatter: SkillFrontmatter = {};
  const lines = match[1].split(/\r?\n/);
  let inTagsList = false;

  for (const line of lines) {
    if (inTagsList) {
      const tagMatch = line.match(/^\s*-\s*(.+)$/);
      if (tagMatch) {
        frontmatter.tags ??= [];
        frontmatter.tags.push(tagMatch[1].trim().replace(/^["']|["']$/g, ""));
        continue;
      }
      if (line.trim() === "") continue;
      inTagsList = false;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    switch (key) {
      case "name":
        frontmatter.name = value.replace(/^["']|["']$/g, "");
        break;
      case "description":
        frontmatter.description = value.replace(/^["']|["']$/g, "");
        break;
      case "version":
        frontmatter.version = value.replace(/^["']|["']$/g, "");
        break;
      case "tags":
        if (value.startsWith("[")) {
          frontmatter.tags = value
            .slice(1, -1)
            .split(",")
            .map((t) => t.trim().replace(/^["']|["']$/g, ""))
            .filter((t) => t.length > 0);
        } else if (value === "") {
          inTagsList = true;
          frontmatter.tags = [];
        }
        break;
    }
  }
  return frontmatter;
}

export class PublishCommand extends Command {
  static override paths = [["publish"]];

  static override usage = Command.Usage({
    description: "Generate well-known skills structure for hosting",
    details: `
      This command generates the RFC 8615 well-known URI structure for hosting skills.

      The output includes:
      - .well-known/skills/index.json - Skill manifest for auto-discovery
      - .well-known/skills/{skill-name}/SKILL.md - Individual skill files

      Users can then install skills via: skillkit add https://your-domain.com
    `,
    examples: [
      ["Generate from current directory", "$0 publish"],
      ["Generate from specific path", "$0 publish ./my-skills"],
      ["Generate to custom output directory", "$0 publish --output ./public"],
      ["Preview without writing", "$0 publish --dry-run"],
    ],
  });

  skillPath = Option.String({ required: false, name: "path" });

  output = Option.String("--output,-o", {
    description:
      "Output directory for well-known structure (default: current directory)",
  });

  dryRun = Option.Boolean("--dry-run,-n", false, {
    description: "Show what would be generated without writing files",
  });

  format = Option.String("--format", {
    description:
      'Output format: "standard" (default) or "mintlify" (.well-known/skills/default/skill.md)',
  });

  async execute(): Promise<number> {
    const basePath = this.skillPath || process.cwd();
    const outputDir = this.output || basePath;

    const s = spinner();
    s.start("Generating well-known skills structure...");

    const discoveredSkills = this.discoverSkills(basePath);

    s.stop(`Discovered ${discoveredSkills.length} skill(s)`);

    if (discoveredSkills.length === 0) {
      error("No skills found");
      console.error(
        colors.muted("Skills must contain a SKILL.md file with frontmatter"),
      );
      return 1;
    }

    console.log(colors.primary(`Found ${discoveredSkills.length} skill(s):\n`));

    const wellKnownSkills: WellKnownSkill[] = [];
    const validSkills: Array<{
      name: string;
      safeName: string;
      description?: string;
      path: string;
    }> = [];

    for (const skill of discoveredSkills) {
      const safeName = sanitizeSkillName(skill.name);
      if (!safeName) {
        warn(
          `  ${colors.warning("⚠")} Skipping "${skill.name}" (invalid name - must be alphanumeric with hyphens/underscores)`,
        );
        continue;
      }

      const files = this.getSkillFiles(skill.path);
      console.log(colors.muted(`  ${colors.success("●")} ${safeName}`));
      console.log(
        colors.muted(`    Description: ${skill.description || "No description"}`),
      );
      console.log(colors.muted(`    Files: ${files.join(", ")}`));

      validSkills.push({
        name: skill.name,
        safeName,
        description: skill.description,
        path: skill.path,
      });
      let integritySri: string | undefined;
      try {
        integritySri = computeSkillIntegrity(skill.path).sri;
      } catch {
        integritySri = undefined;
      }
      if (integritySri) {
        console.log(colors.muted(`    Integrity: ${integritySri}`));
      }

      wellKnownSkills.push({
        name: safeName,
        description: skill.description,
        files,
        integrity: integritySri,
      });
    }

    const scanner = new SkillScanner({ failOnSeverity: Severity.HIGH });
    for (const skill of validSkills) {
      const scanResult = await scanner.scan(skill.path);
      if (scanResult.verdict === "fail") {
        error(`\nSecurity scan FAILED for "${skill.safeName}"`);
        console.error(formatSummary(scanResult));
        console.error(colors.muted("Fix security issues before publishing."));
        return 1;
      }
      if (scanResult.verdict === "warn") {
        warn(
          `  Security warnings for "${skill.safeName}" (${scanResult.findings.length} findings)`,
        );
      }
    }

    if (validSkills.length === 0) {
      error("\nNo valid skills to publish");
      return 1;
    }

    console.log("");

    if (this.format === "mintlify") {
      if (this.dryRun) {
        warn("Dry run - not writing files\n");
        console.log(colors.primary("Would generate (Mintlify format):"));
        for (const skill of validSkills) {
          console.log(
            colors.muted(
              `  ${outputDir}/.well-known/skills/${skill.safeName}/skill.md`,
            ),
          );
        }
        return 0;
      }

      const resolvedOutput = resolve(outputDir);
      for (const skill of validSkills) {
        const mintlifyDir = join(
          outputDir,
          ".well-known",
          "skills",
          skill.safeName,
        );
        const resolvedDir = resolve(mintlifyDir);
        if (!resolvedDir.startsWith(resolvedOutput + sep)) {
          console.log(
            colors.error(`Skipping ${skill.safeName} (path traversal detected)`),
          );
          continue;
        }
        mkdirSync(mintlifyDir, { recursive: true });
        const skillMdPath = join(skill.path, "SKILL.md");
        if (existsSync(skillMdPath)) {
          const content = readFileSync(skillMdPath, "utf-8");
          writeFileSync(join(mintlifyDir, "skill.md"), content);
        }
      }

      success("Generated Mintlify well-known structure:\n");
      for (const skill of validSkills) {
        console.log(
          colors.muted(
            `  ${outputDir}/.well-known/skills/${skill.safeName}/skill.md`,
          ),
        );
      }
      console.log("");
      step("Next steps:");
      console.log(
        colors.muted("  1. Deploy the .well-known directory to your web server"),
      );
      console.log(
        colors.muted(
          "  2. Users can install via: skillkit install https://your-domain.com",
        ),
      );
      console.log(
        colors.muted(
          "  3. Skills auto-discovered from /.well-known/skills/{name}/skill.md",
        ),
      );
      return 0;
    }

    if (this.dryRun) {
      warn("Dry run - not writing files\n");
      console.log(colors.primary("Would generate:"));
      console.log(colors.muted(`  ${outputDir}/.well-known/skills/index.json`));
      for (const skill of wellKnownSkills) {
        for (const file of skill.files) {
          console.log(
            colors.muted(
              `  ${outputDir}/.well-known/skills/${skill.name}/${file}`,
            ),
          );
        }
      }
      console.log("");
      console.log(colors.primary("index.json preview:"));
      console.log(
        JSON.stringify(generateWellKnownIndex(wellKnownSkills), null, 2),
      );
      return 0;
    }

    const wellKnownDir = join(outputDir, ".well-known", "skills");
    mkdirSync(wellKnownDir, { recursive: true });

    for (const skill of validSkills) {
      const skillDir = join(wellKnownDir, skill.safeName);
      const resolvedSkillDir = resolve(skillDir);
      const resolvedWellKnownDir = resolve(wellKnownDir);

      if (!resolvedSkillDir.startsWith(resolvedWellKnownDir + sep)) {
        warn(`  Skipping "${skill.name}" (path traversal detected)`);
        continue;
      }

      mkdirSync(skillDir, { recursive: true });

      const files = this.getSkillFiles(skill.path);
      for (const file of files) {
        const safeFile = basename(file);
        const sourcePath = join(skill.path, file);
        const destPath = join(skillDir, safeFile);
        const content = readFileSync(sourcePath, "utf-8");
        writeFileSync(destPath, content);
      }
    }

    const index = generateWellKnownIndex(wellKnownSkills);
    writeFileSync(
      join(wellKnownDir, "index.json"),
      JSON.stringify(index, null, 2),
    );

    success("Generated well-known structure:\n");
    console.log(colors.muted(`  ${wellKnownDir}/index.json`));
    for (const skill of wellKnownSkills) {
      console.log(colors.muted(`  ${wellKnownDir}/${skill.name}/`));
    }

    console.log("");
    step("Next steps:");
    console.log(
      colors.muted("  1. Deploy the .well-known directory to your web server"),
    );
    console.log(
      colors.muted(
        "  2. Users can install via: skillkit add https://your-domain.com",
      ),
    );
    console.log(
      colors.muted(
        "  3. Skills auto-discovered from /.well-known/skills/index.json",
      ),
    );

    return 0;
  }

  private discoverSkills(
    basePath: string,
  ): Array<{ name: string; description?: string; path: string }> {
    const skills: Array<{ name: string; description?: string; path: string }> =
      [];

    const skillMdPath = join(basePath, "SKILL.md");
    if (existsSync(skillMdPath)) {
      const content = readFileSync(skillMdPath, "utf-8");
      const frontmatter = this.parseFrontmatter(content);
      skills.push({
        name: frontmatter.name || basename(basePath),
        description: frontmatter.description,
        path: basePath,
      });
      return skills;
    }

    const searchDirs = [
      basePath,
      join(basePath, "skills"),
      join(basePath, ".claude", "skills"),
    ];

    for (const searchDir of searchDirs) {
      if (!existsSync(searchDir)) continue;

      const entries = readdirSync(searchDir);
      for (const entry of entries) {
        const entryPath = join(searchDir, entry);
        if (!statSync(entryPath).isDirectory()) continue;

        const entrySkillMd = join(entryPath, "SKILL.md");
        if (existsSync(entrySkillMd)) {
          const content = readFileSync(entrySkillMd, "utf-8");
          const frontmatter = this.parseFrontmatter(content);
          skills.push({
            name: frontmatter.name || entry,
            description: frontmatter.description,
            path: entryPath,
          });
        }
      }
    }

    return skills;
  }

  private getSkillFiles(skillPath: string): string[] {
    const files: string[] = [];

    const entries = readdirSync(skillPath);
    for (const entry of entries) {
      const entryPath = join(skillPath, entry);
      if (statSync(entryPath).isFile()) {
        if (entry.startsWith(".")) continue;
        files.push(entry);
      }
    }

    if (!files.includes("SKILL.md")) {
      files.unshift("SKILL.md");
    }

    return files;
  }

  private parseFrontmatter(content: string): SkillFrontmatter {
    return parseSkillFrontmatter(content);
  }
}

export class PublishSubmitCommand extends Command {
  static override paths = [["publish", "submit"]];

  static override usage = Command.Usage({
    description: "Submit skill to SkillKit marketplace (requires review)",
    examples: [
      ["Submit skill from current directory", "$0 publish submit"],
      ["Submit with custom name", "$0 publish submit --name my-skill"],
    ],
  });

  skillPath = Option.String({ required: false, name: "path" });

  name = Option.String("--name,-n", {
    description: "Custom skill name",
  });

  dryRun = Option.Boolean("--dry-run", false, {
    description: "Show what would be submitted",
  });

  json = Option.Boolean("--json", false, {
    description: "Output as JSON",
  });

  async execute(): Promise<number> {
    const skillPath = this.skillPath || process.cwd();
    const skillMdPath = this.findSkillMd(skillPath);

    if (!skillMdPath) {
      error("No SKILL.md found");
      console.error(
        colors.muted("Run this command from a directory containing SKILL.md"),
      );
      return 1;
    }

    if (!this.json) step("Submitting skill to SkillKit marketplace...\n");

    const content = readFileSync(skillMdPath, "utf-8");
    const frontmatter = this.parseFrontmatter(content);
    const skillName =
      this.name || frontmatter.name || basename(dirname(skillMdPath));

    const repoInfo = await this.getRepoInfo(dirname(skillMdPath));
    if (!repoInfo) {
      error("Not a git repository or no remote configured");
      console.error(
        colors.muted(
          "Your skill must be in a git repository with a GitHub remote",
        ),
      );
      return 1;
    }

    const skillSlug = this.slugify(skillName);
    if (!skillSlug) {
      error("Skill name produces an empty slug.");
      console.error(colors.muted("Please pass --name with letters or numbers."));
      return 1;
    }

    const skillDir = dirname(skillMdPath);
    const quality = evaluateSkillDirectory(skillDir);
    const qualityScore = quality?.overall ?? null;
    const qualityGrade = qualityScore !== null ? getQualityGradeFromScore(qualityScore) : null;
    const qualityBadge = qualityScore !== null ? formatQualityBadge(qualityScore) : "N/A";

    const activity = await fetchGitHubActivity(repoInfo.owner, repoInfo.repo);

    const skillEntry = {
      id: `${repoInfo.owner}/${repoInfo.repo}/${skillSlug}`,
      name: this.formatName(skillName),
      description:
        frontmatter.description ||
        `Best practices for ${this.formatName(skillName)}`,
      source: `${repoInfo.owner}/${repoInfo.repo}`,
      tags: frontmatter.tags || ["general"],
    };

    if (!this.json) {
      console.log(colors.primary("Skill details:"));
      console.log(colors.muted(`  ID: ${skillEntry.id}`));
      console.log(colors.muted(`  Name: ${skillEntry.name}`));
      console.log(colors.muted(`  Description: ${skillEntry.description}`));
      console.log(colors.muted(`  Source: ${skillEntry.source}`));
      console.log(colors.muted(`  Tags: ${skillEntry.tags.join(", ")}`));
      console.log(colors.muted(`  Quality: ${qualityBadge}${qualityScore !== null ? ` (${qualityScore}/100)` : ""}`));
      if (activity) {
        const stars = formatCount(activity.stars);
        const pushed = activity.pushedAt ? timeAgo(activity.pushedAt) : "unknown";
        console.log(colors.muted(`  Stars: ${stars}`));
        console.log(colors.muted(`  Last push: ${pushed}`));
      }
      if (quality && quality.warnings.length > 0) {
        console.log(colors.warning(`  Warnings:`));
        for (const w of quality.warnings.slice(0, 3)) {
          console.log(colors.muted(`    - ${w}`));
        }
      }
      console.log();
    }

    if (this.dryRun) {
      warn("Dry run - not submitting");
      console.log(JSON.stringify(skillEntry, null, 2));
      return 0;
    }

    const issueBody = this.createIssueBody(skillEntry, {
      qualityScore,
      qualityGrade,
      warnings: quality?.warnings ?? [],
      stars: activity?.stars ?? null,
      pushedAt: activity?.pushedAt ?? null,
    });

    try {
      const { execFileSync } = await import("node:child_process");
      const result = execFileSync(
        "gh",
        [
          "issue",
          "create",
          "--repo",
          "rohitg00/skillkit",
          "--title",
          `[Publish] ${skillEntry.name}`,
          "--body",
          issueBody,
          "--label",
          "skill-submission,publish",
        ],
        {
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 15_000,
        },
      ).trim();

      if (this.json) {
        console.log(JSON.stringify({
          success: true,
          source: `${repoInfo.owner}/${repoInfo.repo}`,
          quality: qualityScore,
          issueUrl: result || "",
        }));
        return 0;
      }
      success("Submission created!");
      if (result) {
        console.log(colors.muted(`  ${result}`));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("not found") || message.includes("ENOENT")) {
        error("GitHub CLI (gh) is not installed");
        console.error(
          colors.muted("Install it from https://cli.github.com then run `gh auth login`"),
        );
      } else if (message.includes("auth") || message.includes("401")) {
        error("GitHub CLI is not authenticated");
        console.error(colors.muted("Run `gh auth login` first"));
      } else {
        error("Failed to create issue");
        console.error(colors.muted(message));
      }

      console.log();
      warn("You can submit manually instead:");
      const manualUrl = `https://github.com/rohitg00/skillkit/issues/new?title=${encodeURIComponent(`[Publish] ${skillEntry.name}`)}&labels=skill-submission,publish`;
      console.log(colors.cyan(manualUrl));
      return 1;
    }

    return 0;
  }

  private findSkillMd(basePath: string): string | null {
    if (basePath.endsWith("SKILL.md") && existsSync(basePath)) {
      return basePath;
    }

    const direct = join(basePath, "SKILL.md");
    if (existsSync(direct)) {
      return direct;
    }

    const locations = [
      join(basePath, "skills", "SKILL.md"),
      join(basePath, ".claude", "skills", "SKILL.md"),
    ];

    for (const loc of locations) {
      if (existsSync(loc)) {
        return loc;
      }
    }

    return null;
  }

  private parseFrontmatter(content: string): SkillFrontmatter {
    return parseSkillFrontmatter(content);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async getRepoInfo(
    dir: string,
  ): Promise<{ owner: string; repo: string } | null> {
    try {
      const { execFileSync } = await import("node:child_process");
      const remote = execFileSync("git", ["remote", "get-url", "origin"], {
        cwd: dir,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim();

      const match = remote.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch {
      // Not a git repo
    }

    return null;
  }

  private formatName(name: string): string {
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private createIssueBody(
    skill: {
      id: string;
      name: string;
      description: string;
      source: string;
      tags: string[];
    },
    meta: {
      qualityScore: number | null;
      qualityGrade: string | null;
      warnings: string[];
      stars: number | null;
      pushedAt: string | null;
    },
  ): string {
    const qualityLine =
      meta.qualityScore !== null
        ? `- **Quality:** ${meta.qualityGrade} (${meta.qualityScore}/100)`
        : "- **Quality:** N/A";
    const starsLine =
      typeof meta.stars === "number" ? `- **Stars:** ${formatCount(meta.stars)}` : "";
    const pushLine = meta.pushedAt
      ? `- **Last push:** ${meta.pushedAt.slice(0, 10)}`
      : "";
    const warningLines =
      meta.warnings.length > 0
        ? `\n### Warnings\n${meta.warnings.map((w) => `- ${w}`).join("\n")}`
        : "";

    return `## Publish Skill Request

### Skill Details
- **ID:** \`${skill.id}\`
- **Name:** ${skill.name}
- **Description:** ${skill.description}
- **Source:** [${skill.source}](https://github.com/${skill.source})
- **Tags:** ${skill.tags.map((t) => `\`${t}\``).join(", ")}
${qualityLine}
${starsLine}
${pushLine}
${warningLines}

### JSON Entry
\`\`\`json
${JSON.stringify(skill, null, 2)}
\`\`\`

### Checklist
- [ ] SKILL.md follows the standard format
- [ ] Skill is publicly accessible on GitHub
- [ ] Description accurately describes the skill
- [ ] Tags are appropriate

---
Submitted via \`skillkit publish submit\``;
  }
}
