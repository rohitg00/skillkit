# SkillKit Documentation Website

Landing page for SkillKit - the universal CLI for managing AI agent skills.

**Live site:** https://rohitg00.github.io/skillkit/

## Development

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set `GEMINI_API_KEY` in `.env.local` for the skill generator feature

3. Run locally:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow is defined in `.github/workflows/deploy-docs.yml`.

## Tech Stack

- React 19
- Vite
- Tailwind CSS (via CDN)
- TypeScript
