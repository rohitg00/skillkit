export const RESTRICTED_PREFIXES = [
  "chrome://",
  "chrome-extension://",
  "https://chromewebstore.google.com",
  "about:",
];

export function isRestricted(url: string): boolean {
  if (!url) return true;
  return RESTRICTED_PREFIXES.some((p) => url.startsWith(p));
}
