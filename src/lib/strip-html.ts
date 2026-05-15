/**
 * Strips HTML tags from a string, returning plain text.
 * Useful for rendering Shopify HTML descriptions as plain text.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")   // replace tags with a space
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")       // collapse multiple spaces
    .trim();
}
