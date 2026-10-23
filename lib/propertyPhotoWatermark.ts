import { API_BASE_URL } from "./api/fetcher";

/** Admin-controlled per-property flag (kennedys-loggia real-estate editor). Real estate only. */
export function shouldWatermarkImage(
  watermarkPhotos: boolean | null | undefined,
  category: string | null | undefined
): boolean {
  return category === "real-estate" && watermarkPhotos === true;
}

/**
 * Same source image, routed through kennedys-api's /media/watermark proxy so the
 * KennedysGroup mark is baked into the actual file — a "Save image as" download
 * (or any other way of grabbing the file) carries the watermark too, not just the
 * on-page CSS. Falls back to the original url/path unchanged for anything that
 * isn't a proxyable local uploads path (e.g. an external URL).
 */
export function watermarkedImageUrl(rawUrlOrPath: string | null | undefined): string {
  const raw = String(rawUrlOrPath || "").trim();
  if (!raw) return raw;
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  const uploadsMatch = raw.match(/(uploads\/.+)$/i);
  if (!uploadsMatch) return raw;
  const relative = uploadsMatch[1];
  return `${API_BASE_URL}/media/watermark?path=${encodeURIComponent(relative)}`;
}
