/**
 * Helper to ensure an external URL has proper protocol (http/https)
 * and is not an empty hash or placeholder.
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
