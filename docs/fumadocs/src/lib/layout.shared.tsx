import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'SkillKit',
    },
    links: [
      {
        text: 'DeepWiki',
        url: 'https://deepwiki.com/rohitg00/skillkit',
        external: true,
      },
      {
        text: 'GitHub',
        url: 'https://github.com/rohitg00/skillkit',
        external: true,
      },
      {
        text: 'npm',
        url: 'https://www.npmjs.com/package/skillkit',
        external: true,
      },
    ],
  }
}
