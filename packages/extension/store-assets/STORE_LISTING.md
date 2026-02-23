# Chrome Web Store Listing

## Title
SkillKit - Save as Skill

## Summary (132 chars max)
Save any webpage as an AI agent skill file. One click, works across 44 coding agents.

## Description
SkillKit lets you save any webpage as a reusable AI agent skill with one click. The extension extracts page content directly in your browser and generates a SKILL.md file that works instantly across 44 coding agents including Claude Code, Cursor, Codex, Gemini CLI, Windsurf, and more.

How it works:
- Click the extension icon to save the current page as a skill
- Right-click any page and select "Save page as Skill"
- Select text, right-click, and choose "Save selection as Skill"

When you save a page, the extension extracts and converts page content locally in your browser — no data is sent to any server. The resulting skill file with auto-generated tags and YAML frontmatter is downloaded directly to your computer.

After saving, run `skillkit install <path>` to make the skill available to all your AI coding agents at once.

Features:
- Extracts and converts page content locally — no data sent to external servers
- Auto-generates YAML frontmatter with metadata
- Smart tag detection from 50+ tech keywords (weighted URL, heading, and body analysis)
- Context menu integration for quick saves
- Works on any webpage
- No account or API key required

Part of the SkillKit ecosystem: https://skillkit.sh

## Category
Developer Tools

## Language
English

## Website
https://skillkit.sh

## Support URL
https://github.com/rohitg00/skillkit/issues

## Privacy Policy URL
https://skillkit.sh/privacy.html

## Single Purpose
Save webpages as AI agent skill files (SKILL.md) for use with coding AI agents.

## Permissions Justification
- activeTab: Read the URL and title of the current tab when the user clicks the extension icon or context menu. Only accessed on explicit user action.
- contextMenus: Add "Save page as Skill" and "Save selection as Skill" to the right-click context menu.
- downloads: Save the generated SKILL.md file to the user's Downloads folder.
- scripting: Inject a content extraction script into the active tab to read page content (title, headings, body text) for local skill generation. Only executed on explicit user action (click or context menu).

## Data Usage Disclosure (for Chrome Web Store Privacy tab)
- Does the extension use remote code? No
- Does it collect user data? No. All processing happens locally in the browser. No data is sent to any server.
- Data type: None collected or transmitted
- Transfer: No data is transferred externally
- Not sold to third parties
- Not used for creditworthiness or lending

## Host Permissions
None. The extension uses activeTab which grants temporary access only when the user invokes the extension.

## Assets
- promo-small-440x280.png — Small promo tile
- screenshot-1-1280x800.png — Popup UI showing save flow
- screenshot-2-1280x800.png — Context menu integration
- ../src/icons/icon128.png — Extension icon (128x128)
