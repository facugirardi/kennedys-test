type RentalPropertyLike = {
  id?: string | null;
  title?: string | null;
  name?: string | null;
  agentFriendlyName?: string | null;
  agentFriendlySlug?: string | null;
  region?: string | null;
  isFriendly?: boolean | null;
};

function slugify(value?: string | null): string {
  if (!value || typeof value !== "string") return "";
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildRentalRegionSegment(property?: RentalPropertyLike | null): string {
  return slugify(property?.region) || "";
}

export function getRentalNameCandidates(
  property?: RentalPropertyLike | null,
  options: { preferAgentFriendly?: boolean } = {}
): string[] {
  if (!property) return [];

  const preferAgentFriendly = options.preferAgentFriendly === true;

  const preferred = preferAgentFriendly
    ? [
        slugify(property.agentFriendlySlug),
        slugify(property.agentFriendlyName),
        slugify(property.title),
        slugify(property.name),
      ]
    : [
        slugify(property.title),
        slugify(property.name),
        slugify(property.agentFriendlySlug),
        slugify(property.agentFriendlyName),
      ];

  return Array.from(new Set(preferred.filter(Boolean)));
}

export function buildRentalNameSegment(
  property?: RentalPropertyLike | null,
  options: { preferAgentFriendly?: boolean } = {}
): string {
  return getRentalNameCandidates(property, options)[0] || "";
}

/**
 * Canonical rental path:
 * /villas/:region/:name
 * Fallback (controlled migration): /villas/:id
 */
export function buildRentalDetailPath(property?: RentalPropertyLike | null): string {
  if (!property) return "/villas";
  const region = buildRentalRegionSegment(property);
  const name = buildRentalNameSegment(property);
  if (region && name) {
    return `/villas/${encodeURIComponent(region)}/${encodeURIComponent(name)}`;
  }
  if (property.id) {
    return `/villas/${property.id}`;
  }
  return "/villas";
}

/**
 * Canonical real-estate path:
 * /real-estate/:region/:name
 * Fallback (no region/name yet): /real-estate/:id — the id route redirects to the canonical path.
 */
export function buildRealEstateDetailPath(property?: RentalPropertyLike | null): string {
  if (!property) return "/real-estate";
  const region = buildRentalRegionSegment(property);
  const name = buildRentalNameSegment(property);
  if (region && name) {
    return `/real-estate/${encodeURIComponent(region)}/${encodeURIComponent(name)}`;
  }
  if (property.id) {
    return `/real-estate/${encodeURIComponent(String(property.id))}`;
  }
  return "/real-estate";
}

export function buildRentalDetailUrl(property?: RentalPropertyLike | null, baseUrl = ""): string {
  const normalizedBase = (baseUrl || "").replace(/\/$/, "");
  const path = buildRentalDetailPath(property);
  return normalizedBase ? `${normalizedBase}${path}` : path;
}

/**
 * Detalle público desde oferta compartida.
 * branded=false (agent-friendly) => /agent-property/:agent-friendly-slug (fallback id)
 * branded=true => /villas... o /real-estate/:id
 */
export function buildOfferPublicPropertyDetailPath(
  property: (RentalPropertyLike & { propertyId?: string | null; category?: string | null; rental?: boolean | null }) | null | undefined,
  options: { agentFriendly?: boolean } = {}
): string {
  const agentFriendly = Boolean(options.agentFriendly);
  const id = property?.propertyId ?? property?.id;
  if (!id) return "/villas";

  if (agentFriendly) {
    const agentFriendlyName = buildRentalNameSegment(property, { preferAgentFriendly: true });
    if (agentFriendlyName) {
      return `/agent-property/${encodeURIComponent(agentFriendlyName)}`;
    }
    return `/agent-property/${encodeURIComponent(String(id))}`;
  }

  const isRealEstate = property?.category === "real-estate" || property?.rental === false;
  if (isRealEstate) {
    return buildRealEstateDetailPath({ ...property, id: String(id) });
  }

  // Branded => slug por title/name. Unbranded(agent-friendly) => slug por agentFriendly.
  const region = buildRentalRegionSegment(property);
  const name = buildRentalNameSegment(property, { preferAgentFriendly: agentFriendly });
  if (region && name) {
    return `/villas/${encodeURIComponent(region)}/${encodeURIComponent(name)}`;
  }
  return buildRentalDetailPath(property);
}

export function matchesRentalRoute(property: RentalPropertyLike, regionParam: string, nameParam: string): boolean {
  const expectedRegion = buildRentalRegionSegment(property);
  const expectedNames = getRentalNameCandidates(property);
  const actualRegion = slugify(decodeURIComponent(regionParam || ""));
  const actualName = slugify(decodeURIComponent(nameParam || ""));
  return Boolean(
    expectedRegion &&
      expectedNames.length > 0 &&
      expectedRegion === actualRegion &&
      expectedNames.includes(actualName)
  );
}

/**
 * Region-agnostic match: does `nameParam` match this property's current title/name slug?
 * Used as a fallback when the region segment alone changed (so the villa itself still "is" the
 * right one, just not under the same region URL) — the caller is expected to redirect to the
 * canonical path rather than render under the stale region.
 */
export function matchesRentalName(property: RentalPropertyLike, nameParam: string): boolean {
  const expectedNames = getRentalNameCandidates(property);
  const actualName = slugify(decodeURIComponent(nameParam || ""));
  return Boolean(expectedNames.length > 0 && actualName && expectedNames.includes(actualName));
}

