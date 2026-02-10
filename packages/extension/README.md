# @skillkit/extension

Chrome extension to save any webpage as an AI agent skill. No server needed.

## Install

```bash
pnpm --filter @skillkit/extension build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist/`

## Usage

- Click the extension icon → **Save as Skill**
- Right-click any page → **Save page as Skill**
- Select text → right-click → **Save selection as Skill**

Skills download to `Downloads/skillkit-skills/{name}/SKILL.md`.

To make available to all 44 agents:

```bash
skillkit install ~/Downloads/skillkit-skills/my-skill
```

## How It Works

Everything runs in the browser:

1. **Content script** converts page HTML to markdown via Turndown
2. **Background worker** generates SKILL.md with YAML frontmatter and auto-tags
3. **Downloads API** saves the file — no server calls

## Build

```bash
pnpm --filter @skillkit/extension build
```

Output: `dist/` with manifest, JS bundles (IIFE), popup UI, and icons.
