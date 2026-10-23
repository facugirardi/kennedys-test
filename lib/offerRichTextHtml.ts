/**
 * Quill auto-appends an empty trailing paragraph that creates a visible gap when
 * rendered on offer cards — trim leading/trailing empty paragraphs only, so a
 * deliberate blank line left in the middle of the text (Enter, Enter, keep typing)
 * stays intact.
 */
export function normalizeOfferRichTextHtml(html?: string | null): string {
  if (!html) return "";
  return String(html)
    .replace(/^(?:\s*(?:<p>|<div>)\s*(?:<br\s*\/?>\s*)*(?:<\/p>|<\/div>)\s*)+/gi, "")
    .replace(/(?:\s*(?:<p>|<div>)\s*(?:<br\s*\/?>\s*)*(?:<\/p>|<\/div>)\s*)+$/gi, "")
    .trim();
}

/** Entity-encoded tags Quill produces when HTML is fed in as plain text.
 *  Matches `&lt;p&gt;` and amp-escaped `&amp;lt;p&amp;gt;`. */
const ESCAPED_RICH_TAG =
  /(?:&amp;lt;|&lt;)\/?(?:p|div|br|ul|ol|li|strong|em|b|i|u|span|a|h[1-6])\b/i;

function decodeBasicHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

/**
 * Quill sometimes treats existing HTML as plain text and re-escapes it, e.g.
 * `<p>&lt;p&gt;Note&lt;/p&gt;</p>`. Decode those fragments so cards don't show
 * raw `&lt;p&gt;` / `<p>` as text. Safe for real `&lt;` that isn't a rich-text tag.
 */
export function repairDoubleEscapedRichText(html?: string | null): string {
  let out = String(html ?? "");
  if (!out || !ESCAPED_RICH_TAG.test(out)) return out;

  for (let i = 0; i < 2; i++) {
    if (!ESCAPED_RICH_TAG.test(out)) break;
    out = decodeBasicHtmlEntities(out);
  }

  // `<p><p>Note</p></p>` → `<p>Note</p>`
  out = out.replace(/^<(p|div)>\s*(<\1>[\s\S]*<\/\1>)\s*<\/\1>$/i, "$2");
  return out;
}

export function toOfferRichTextHtml(value: unknown): string {
  const raw = repairDoubleEscapedRichText(String(value ?? "").trim());
  if (!raw) return "";

  const hasTags = /<\/?[a-z][\s\S]*>/i.test(raw);
  const html = hasTags
    ? raw
    : raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");

  return normalizeOfferRichTextHtml(html);
}

export const OFFER_RICH_TEXT_CLASS =
  "font-haas text-sm text-[#172338] leading-snug [&_p]:m-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:m-0 [&_strong]:font-semibold";
