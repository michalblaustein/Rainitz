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

/**
 * Robust check to determine if an article/item represents a podcast.
 */
export function isPodcastArticle(article?: any): boolean {
  if (!article) return false;
  const catId = String(article.categoryId || "").toLowerCase().trim();
  const catName = String(article.category || "").toLowerCase().trim();
  const title = String(article.title || "").toLowerCase().trim();
  const link = String(article.link || "").toLowerCase().trim();

  const isMediaPlatform = (
    link.includes("youtube.com") ||
    link.includes("youtu.be") ||
    link.includes("spotify.com") ||
    link.includes("apple.com") ||
    link.includes("podcasts") ||
    link.includes("soundcloud.com") ||
    link.includes("anchor.fm")
  );

  return (
    catId === "podcast" ||
    catId === "podcasts" ||
    catName === "פודקאסט" ||
    catName === "פודקאסטים" ||
    catName === "podcast" ||
    catName === "podcasts" ||
    title.includes("פודקאסט") ||
    title.includes("podcast") ||
    title.includes("פרק ") ||
    isMediaPlatform
  );
}

