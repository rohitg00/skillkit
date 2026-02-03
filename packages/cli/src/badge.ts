const SKILLKIT_LOGO_SVG_BASE64 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0id2hpdGUiPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjEiIHk9IjEiLz48cmVjdCB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB4PSI5IiB5PSIxIi8+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iNiIgeD0iMSIgeT0iOSIvPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHg9IjkiIHk9IjkiLz48L3N2Zz4=';

function encodeBadgeSegment(text: string): string {
  return encodeURIComponent(text).replace(/-/g, '--');
}

export function generateBadge(skills: string[]): {
  url: string;
  markdown: string;
  html: string;
} {
  const count = skills.length;

  if (count === 0) {
    const url = `https://img.shields.io/badge/SkillKit-No%20Skills-555555?style=flat-square&logo=data:image/svg+xml;base64,${SKILLKIT_LOGO_SVG_BASE64}`;
    return {
      url,
      markdown: `[![SkillKit Stack](${url})](https://agenstskills.com)`,
      html: `<a href="https://agenstskills.com"><img src="${url}" alt="SkillKit Stack" /></a>`,
    };
  }

  const maxDisplay = 5;
  const displayNames = skills.slice(0, maxDisplay);
  const suffix = count > maxDisplay ? ` +${count - maxDisplay} more` : '';
  const label = `SkillKit ${count} skills`;
  const message = displayNames.join(' | ') + suffix;
  const encodedLabel = encodeBadgeSegment(label);
  const encodedMessage = encodeBadgeSegment(message);

  const url = `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-black?style=flat-square&logo=data:image/svg+xml;base64,${SKILLKIT_LOGO_SVG_BASE64}`;

  return {
    url,
    markdown: `[![SkillKit Stack](${url})](https://agenstskills.com)`,
    html: `<a href="https://agenstskills.com"><img src="${url}" alt="SkillKit Stack" /></a>`,
  };
}
