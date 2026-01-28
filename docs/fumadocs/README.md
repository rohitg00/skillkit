# SkillKit Documentation

Fumadocs-based documentation for SkillKit.

## Development

```bash
cd docs/fumadocs
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
```

## Structure

```text
docs/fumadocs/
├── content/docs/     # MDX documentation files
├── src/
│   ├── app/         # Next.js app router
│   ├── lib/         # Components and utilities
│   └── mdx-components.tsx
├── package.json
└── source.config.ts
```

## Adding Pages

1. Create `.mdx` file in `content/docs/`
2. Add frontmatter with `title` and `description`
3. Add page to `content/docs/meta.json`

## Custom Components

- `<Card>` - Link cards with icons
- `<Columns>` - Grid layout (2-4 columns)
