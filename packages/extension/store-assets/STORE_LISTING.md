# Chrome Web Store Listing

## Title
SkillKit - Save as Skill

## Summary (132 chars max)
Save any webpage as an AI agent skill file. One click, works across 44 coding agents.

## Description
SkillKit lets you save any webpage as a reusable AI agent skill with one click. The saved SKILL.md file works instantly across 44 coding agents including Claude Code, Cursor, Codex, Gemini CLI, Windsurf, and more.

How it works:
- Click the extension icon to save the current page as a skill
- Right-click any page and select "Save page as Skill"
- Select text, right-click, and choose "Save selection as Skill"

When you save a page, the extension sends the page URL to agenstskills.com where it is converted to clean markdown with auto-generated tags and YAML frontmatter. The resulting skill file is downloaded to your computer. No page content, browsing history, or personal data is ever sent — only the URL of the page you choose to save.

Saving selected text works entirely offline with no network requests.

After saving, run `skillkit install <path>` to make the skill available to all your AI coding agents at once.

Features:
- Converts HTML to clean markdown via server-side processing
- Auto-generates YAML frontmatter with metadata
- Smart tag detection from 50+ tech keywords (weighted 5-source analysis)
- GitHub URL support (auto-converts blob URLs to raw content)
- Context menu integration for quick saves
- Works on any webpage
- No account or API key required

Part of the SkillKit ecosystem: https://agenstskills.com

## Category
Developer Tools

## Language
English

## Website
https://agenstskills.com

## Support URL
https://github.com/rohitg00/skillkit/issues

## Privacy Policy URL
https://agenstskills.com/privacy.html

## Single Purpose
Save webpages as AI agent skill files (SKILL.md) for use with coding AI agents.

## Permissions Justification
- activeTab: Read the URL and title of the current tab when the user clicks the extension icon or context menu. Only accessed on explicit user action.
- contextMenus: Add "Save page as Skill" and "Save selection as Skill" to the right-click context menu.
- downloads: Save the generated SKILL.md file to the user's Downloads folder.

## Data Usage Disclosure (for Chrome Web Store Privacy tab)
- Does the extension use remote code? No
- Does it collect user data? No personal data. The page URL is sent to agenstskills.com when the user clicks save.
- Data type: Website content (URL only, on user action)
- Use: Required for core functionality (converting webpage to skill file)
- Transfer: Sent to agenstskills.com (our own server) over HTTPS
- Not sold to third parties
- Not used for creditworthiness or lending

## Host Permissions
None. The extension uses activeTab which grants temporary access only when the user invokes the extension.

## Assets
- promo-small-440x280.png — Small promo tile
- screenshot-1-1280x800.png — Popup UI showing save flow
- screenshot-2-1280x800.png — Context menu integration
- ../src/icons/icon128.png — Extension icon (128x128)
