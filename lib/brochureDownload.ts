export const sanitizeBrochureNameBase = (raw: string) =>
  raw
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

/** Label name from Loggia "Brochure name" field only — never derived from the file URL. */
export const resolveBrochureDisplayName = (source: Record<string, unknown> | null | undefined): string | null => {
  if (!source) return null;

  const fromField = source.brochureName;
  if (typeof fromField === "string" && fromField.trim()) {
    return fromField.trim();
  }

  const nested = (source.brochure as { name?: string } | undefined)?.name;
  if (typeof nested === "string" && nested.trim()) {
    return nested.trim();
  }

  return null;
};

export const formatBrochureViewButtonLabel = (displayName: string | null | undefined): string => {
  const trimmed = typeof displayName === "string" ? displayName.trim() : "";
  return trimmed ? `View ${trimmed}` : "View Brochure";
};

export const buildBrochureDownloadName = (brochureUrl: string, preferredName: string) => {
  const safeBase = sanitizeBrochureNameBase(preferredName || "brochure") || "brochure";
  const lastPart = brochureUrl.split("/").pop() || "";
  const noQuery = lastPart.split("?")[0] || "";
  const dot = noQuery.lastIndexOf(".");
  const ext = dot > -1 ? noQuery.slice(dot) : "";
  return `${safeBase}${ext}`;
};
