import type { SaveResponse, ErrorResponse, ExtensionMessage } from "./types";
import { isRestricted } from "./constants";

const TECH_KEYWORDS: Record<string, string[]> = {
  react: ["react", "jsx", "tsx", "usestate", "useeffect", "nextjs", "next.js"],
  typescript: ["typescript", "ts", "tsx", "type-safe"],
  javascript: [
    "javascript",
    "js",
    "es6",
    "es2015",
    "ecmascript",
    "node",
    "nodejs",
    "node.js",
  ],
  python: ["python", "pip", "django", "flask", "fastapi", "pytorch", "pandas"],
  rust: ["rust", "cargo", "crate", "rustc", "tokio"],
  go: ["golang", "goroutine", "gomod"],
  docker: ["docker", "dockerfile", "container", "kubernetes", "k8s", "helm"],
  database: [
    "sql",
    "postgres",
    "mysql",
    "mongodb",
    "redis",
    "supabase",
    "prisma",
  ],
  api: ["api", "rest", "graphql", "grpc", "endpoint", "webhook"],
  testing: ["test", "jest", "vitest", "playwright", "cypress", "pytest"],
  devops: ["ci", "cd", "cicd", "pipeline", "deploy", "terraform", "ansible"],
  ai: [
    "ai",
    "llm",
    "gpt",
    "claude",
    "openai",
    "anthropic",
    "machine-learning",
    "ml",
  ],
  security: ["security", "auth", "oauth", "jwt", "encryption", "vulnerability"],
  css: ["css", "tailwind", "scss", "sass", "styled-components"],
  git: ["git", "github", "gitlab", "bitbucket", "branch", "merge"],
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-page",
    title: "Save page as Skill",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "save-selection",
    title: "Save selection as Skill",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  try {
    if (info.menuItemId === "save-page") {
      const url = tab.url ?? "";
      if (isRestricted(url)) {
        notifyTab(tab.id, { error: "Cannot save skills from this page" });
        return;
      }
      const page = await extractPageContent(tab.id);
      const result = buildPageSkill({ ...page, url });
      downloadSkill(result.name, result.skillMd);
      notifyTab(tab.id, result);
    }

    if (info.menuItemId === "save-selection" && info.selectionText) {
      const url = tab.url ?? "";
      const result = buildSelectionSkill(info.selectionText, url);
      downloadSkill(result.name, result.skillMd);
      notifyTab(tab.id, result);
    }
  } catch (err) {
    console.error("[SkillKit] Failed to save skill:", err);
    notifyTab(tab.id, { error: "Failed to save skill" });
  }
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === "SAVE_PAGE") {
      const { url, name, tabId } = message.payload;
      if (isRestricted(url)) {
        sendResponse({ error: "Cannot save skills from this page" });
        return true;
      }
      extractPageContent(tabId)
        .then((page) => {
          const result = buildPageSkill({ ...page, url }, name);
          downloadSkill(result.name, result.skillMd);
          sendResponse(result);
        })
        .catch((err) => {
          console.error("[SkillKit] Failed to extract page content:", err);
          sendResponse({ error: "Failed to extract page content" });
        });
      return true;
    }

    if (message.type === "SAVE_SELECTION") {
      const { text, url, name } = message.payload;
      const result = buildSelectionSkill(text, url, name);
      downloadSkill(result.name, result.skillMd);
      sendResponse(result);
    }

    return false;
  },
);

interface PageContent {
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
}

async function extractPageContent(tabId: number): Promise<PageContent> {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const title = document.title || "";

      const metaEl = document.querySelector('meta[name="description"]');
      const metaDescription = metaEl?.getAttribute("content") || "";

      const headings: string[] = [];
      document.querySelectorAll("h1, h2, h3").forEach((el) => {
        const text = (el as HTMLElement).innerText?.trim();
        if (text) headings.push(text);
      });

      const container =
        document.querySelector("article") ||
        document.querySelector("main") ||
        document.body;
      const clone = container.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("nav, footer, script, style, noscript, iframe, svg")
        .forEach((el) => el.remove());
      const bodyText = (clone.innerText || "").slice(0, 50000);

      return {
        title,
        metaDescription,
        headings: headings.slice(0, 30),
        bodyText,
      };
    },
  });

  if (!result?.result) {
    return { title: "", metaDescription: "", headings: [], bodyText: "" };
  }

  return result.result as PageContent;
}

function detectTags(
  url: string,
  headings: string[],
  bodyText: string,
): string[] {
  const scores: Record<string, number> = {};

  const urlLower = url.toLowerCase();
  const headingsLower = headings.join(" ").toLowerCase();
  const bodyLower = bodyText.slice(0, 5000).toLowerCase();

  for (const [tag, keywords] of Object.entries(TECH_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      if (re.test(urlLower)) score += 3;
      if (re.test(headingsLower)) score += 2;
      if (re.test(bodyLower)) score += 1;
    }
    if (score > 0) scores[tag] = score;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}

function makeDescription(metaDescription: string, bodyText: string): string {
  if (metaDescription) {
    return metaDescription.slice(0, 200);
  }
  const lines = bodyText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 20) {
      return trimmed.slice(0, 200);
    }
  }
  return "Saved webpage content";
}

function buildPageSkill(
  page: PageContent & { url: string },
  customName?: string,
): SaveResponse {
  const skillName = slugify(
    customName || deriveNameFromUrl(page.url) || page.title || "webpage",
  );
  const tags = detectTags(page.url, page.headings, page.bodyText);
  const description = makeDescription(page.metaDescription, page.bodyText);
  const savedAt = new Date().toISOString();

  let skillMd =
    `---\n` +
    `name: ${yamlEscape(skillName)}\n` +
    `description: ${yamlEscape(description)}\n` +
    `version: 1.0.0\n`;

  if (tags.length > 0) {
    skillMd += `tags: [${tags.join(", ")}]\n`;
  }

  skillMd +=
    `metadata:\n` +
    `  source: ${yamlEscape(page.url)}\n` +
    `  savedAt: ${savedAt}\n` +
    `---\n\n`;

  if (page.title) {
    skillMd += `# ${page.title}\n\n`;
  }

  if (page.headings.length > 0) {
    skillMd += page.headings.map((h) => `- ${h}`).join("\n") + "\n\n";
  }

  const content = page.bodyText.trim();
  if (content) {
    skillMd += content + "\n";
  }

  return {
    name: skillName,
    filename: `${skillName}/SKILL.md`,
    skillMd,
    tags,
  };
}

function deriveNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1]
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9-]/g, "-");
      if (last.length > 2) return last;
    }
    return parsed.hostname.replace(/^www\./, "").replace(/\.[^.]+$/, "");
  } catch {
    return "";
  }
}

function buildSelectionSkill(
  text: string,
  url: string,
  name?: string,
): SaveResponse {
  const skillName = slugify(name || "selection");
  const savedAt = new Date().toISOString();

  const skillMd =
    `---\n` +
    `name: ${yamlEscape(skillName)}\n` +
    `description: Selected text saved as skill\n` +
    `metadata:\n` +
    (url ? `  source: ${yamlEscape(url)}\n` : "") +
    `  savedAt: ${savedAt}\n` +
    `---\n\n` +
    text +
    "\n";

  return {
    name: skillName,
    filename: `${skillName}/SKILL.md`,
    skillMd,
    tags: [],
  };
}

const YAML_BARE_SCALARS = /^(true|false|yes|no|on|off|null|~)$/i;
const YAML_NUMERIC = /^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

function yamlEscape(value: string): string {
  const singleLine = value.replace(/\r?\n/g, " ").trim();
  if (
    /[:#{}[\],&*?|>!%@`]/.test(singleLine) ||
    singleLine.startsWith("'") ||
    singleLine.startsWith('"') ||
    YAML_BARE_SCALARS.test(singleLine) ||
    YAML_NUMERIC.test(singleLine)
  ) {
    return `"${singleLine.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return singleLine;
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug.slice(0, 64).replace(/-+$/, "") || "untitled-skill";
}

function downloadSkill(name: string, skillMd: string): void {
  const blob = new Blob([skillMd], { type: "text/markdown" });
  const blobUrl = URL.createObjectURL(blob);
  chrome.downloads.download(
    {
      url: blobUrl,
      filename: `skillkit-skills/${name}/SKILL.md`,
      saveAs: false,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(
          `[SkillKit] Download failed for skillkit-skills/${name}/SKILL.md:`,
          chrome.runtime.lastError.message,
        );
      }
      URL.revokeObjectURL(blobUrl);
    },
  );
}

function notifyTab(tabId: number, result: SaveResponse | ErrorResponse): void {
  const isError = "error" in result;
  chrome.action.setBadgeText({ text: isError ? "!" : "\u2713", tabId });
  chrome.action.setBadgeBackgroundColor({
    color: isError ? "#ef4444" : "#22c55e",
    tabId,
  });
  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), 3000);
}
