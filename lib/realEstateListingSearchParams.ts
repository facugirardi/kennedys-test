/** Max value of the hero search price slider (€) — matches SearchForm. */
export const REAL_ESTATE_PRICE_SLIDER_MAX = 10_000_000;

/** Bar budget presets → API uses minPrice / maxPrice (€). */
export function barBudgetLabelToMinMax(
  budget: string
): { min?: number; max?: number } | null {
  const map: Record<string, { min?: number; max?: number }> = {
    '$500K-$1M': { min: 500_000, max: 1_000_000 },
    '$1M-$5M': { min: 1_000_000, max: 5_000_000 },
    '$5M-$10M': { min: 5_000_000, max: 10_000_000 },
    '$10M+': { min: 10_000_000 },
  };
  return map[budget] ?? null;
}

/** Match URL min/max to a bar label for controlled select (optional). */
export function matchPresetBudgetFromPrices(
  min?: number | null,
  max?: number | null
): string {
  const m = min != null && min > 0 ? min : undefined;
  const x = max != null && max > 0 ? max : undefined;
  if (m === 500_000 && x === 1_000_000) return '$500K-$1M';
  if (m === 1_000_000 && x === 5_000_000) return '$1M-$5M';
  if (m === 5_000_000 && x === 10_000_000) return '$5M-$10M';
  if (m === 10_000_000 && x == null) return '$10M+';
  return '';
}

export type RealEstateFilterState = {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  /** Currency the user entered priceRange.min/max in. Properties don't carry a currency field —
   *  filtering converts each property's price into this currency before comparing (see
   *  getPropertySalePriceInCurrency in lib/utils.ts). */
  priceCurrency: 'usd' | 'eur';
  bedrooms: string;
  bathrooms: string;
  /** Minimum number of floors/levels: 'Any' | '1+' | '2+' | '3+' | '4+'. */
  floors: string;
  /** Floor an apartment sits on (0 = ground floor). */
  floorLevel: {
    min: number | null;
    max: number | null;
  };
  propertyType: string[];
  listingStatus: string[];
  squareFeet: {
    min: number | null;
    max: number | null;
  };
  lotSize: {
    min: number | null;
    max: number | null;
  };
  yearBuilt: {
    min: number | null;
    max: number | null;
  };
  listingStatusDropdown: string;
  area: string;
  outdoor: string[];
  luxuryIndoor: string[];
  location: string[];
  view: string[];
};

export type RealEstateListingHeroParams = {
  region?: string;
  area?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: number | null;
};

export type RealEstateListingBarParams = {
  type?: string;
  bedrooms?: number;
  budget?: string;
};

/**
 * Appends real-estate list query params consumed by `/real-estate/list` and the property API.
 * Geo `area` (from location tree) wins over overlay `area` (Beachfront, etc.) when both exist.
 */
export function appendRealEstateListingSearchParams(
  params: URLSearchParams,
  overlay: RealEstateFilterState,
  hero?: RealEstateListingHeroParams,
  bar?: RealEstateListingBarParams
): void {
  params.set('category', 'real-estate');
  params.set('rental', 'false');

  const region = hero?.region?.trim();
  if (region) params.set('region', region);

  const geoArea = hero?.area?.trim();
  if (geoArea) {
    params.set('area', geoArea);
  } else if (overlay.area !== 'All') {
    params.set('area', overlay.area);
  }

  let minPrice: number | null | undefined = overlay.priceRange.min ?? null;
  let maxPrice: number | null | undefined = overlay.priceRange.max ?? null;
  if (hero) {
    if (hero.minPrice != null && hero.minPrice > 0) {
      minPrice = hero.minPrice;
    }
    if (
      hero.maxPrice != null &&
      hero.maxPrice > 0 &&
      hero.maxPrice < REAL_ESTATE_PRICE_SLIDER_MAX
    ) {
      maxPrice = hero.maxPrice;
    } else if (hero.maxPrice != null && hero.maxPrice >= REAL_ESTATE_PRICE_SLIDER_MAX) {
      maxPrice = overlay.priceRange.max ?? null;
    }
  }

  if (minPrice != null && minPrice > 0) {
    params.set('minPrice', String(minPrice));
  }
  if (maxPrice != null && maxPrice > 0) {
    params.set('maxPrice', String(maxPrice));
  }
  if (overlay.priceCurrency) {
    params.set('priceCurrency', overlay.priceCurrency);
  }

  // API propertyService treats bedroomsCondition '>' as >= (gte).
  // Hero/bar "1" is UI default only — same as villas: no bedroom filter until > 1.
  if (hero?.bedrooms != null && hero.bedrooms > 1) {
    params.set('bedrooms', String(hero.bedrooms));
    params.set('bedroomsQuantity', String(hero.bedrooms));
    params.set('bedroomsCondition', '>');
  } else if (overlay.bedrooms !== 'Any') {
    const raw = overlay.bedrooms === '5+' ? '5' : overlay.bedrooms;
    params.set('bedrooms', raw);
    params.set('bedroomsQuantity', raw);
    params.set('bedroomsCondition', '>');
  } else if (bar?.bedrooms != null && bar.bedrooms > 1) {
    // Bar quick filter = cantidad exacta (no "X+"). No seteamos el param `bedrooms` legacy
    // acá: ese es el que se relee como selección del overlay, y mezclarlo pisa el overlay
    // con un valor que en realidad vino de la barra.
    params.set('bedroomsQuantity', String(bar.bedrooms));
    params.set('bedroomsCondition', '=');
  }

  if (overlay.bathrooms !== 'Any') {
    const raw = overlay.bathrooms === '5+' ? '5' : overlay.bathrooms;
    params.set('bathroomsQuantity', raw);
    params.set('bathroomsCondition', '>=');
  }

  if (overlay.propertyType.length > 0) {
    params.set('propertyType', overlay.propertyType.join(','));
  }

  const listingStatusResolved =
    overlay.listingStatusDropdown !== 'All'
      ? overlay.listingStatusDropdown
      : overlay.listingStatus.length > 0
        ? overlay.listingStatus[0]
        : null;
  if (listingStatusResolved) {
    params.set('listingStatus', listingStatusResolved);
  }

  if (overlay.squareFeet.min != null && overlay.squareFeet.min > 0) {
    params.set('minSqm', String(overlay.squareFeet.min));
  }
  if (overlay.squareFeet.max != null && overlay.squareFeet.max > 0) {
    params.set('maxSqm', String(overlay.squareFeet.max));
  }
  if (overlay.lotSize.min != null && overlay.lotSize.min > 0) {
    params.set('minLotSize', String(overlay.lotSize.min));
  }
  if (overlay.lotSize.max != null && overlay.lotSize.max > 0) {
    params.set('maxLotSize', String(overlay.lotSize.max));
  }
  if (overlay.yearBuilt.min != null && overlay.yearBuilt.min > 0) {
    params.set('minYearBuilt', String(overlay.yearBuilt.min));
  }
  if (overlay.yearBuilt.max != null && overlay.yearBuilt.max > 0) {
    params.set('maxYearBuilt', String(overlay.yearBuilt.max));
  }

  const minFloors = parseInt(overlay.floors, 10);
  if (Number.isFinite(minFloors) && minFloors > 0) {
    params.set('minFloors', String(minFloors));
  }
  if (overlay.floorLevel.min != null && overlay.floorLevel.min >= 0) {
    params.set('minFloorLevel', String(overlay.floorLevel.min));
  }
  if (overlay.floorLevel.max != null && overlay.floorLevel.max >= 0) {
    params.set('maxFloorLevel', String(overlay.floorLevel.max));
  }

  if (overlay.view.length > 0) {
    params.set('view', overlay.view.join(','));
  }
  if (overlay.outdoor.length > 0 || overlay.luxuryIndoor.length > 0) {
    params.set('amenities', [...overlay.outdoor, ...overlay.luxuryIndoor].join(','));
  }
  if (overlay.location.length > 0) {
    params.set('locationFeatures', overlay.location.join(','));
  }

  if (bar?.type?.trim()) {
    const t = bar.type.trim();
    params.set('type', t);
    if (overlay.propertyType.length === 0) {
      params.set('propertyType', t);
    }
  }

  if (
    bar?.budget &&
    bar.budget !== 'Any Price' &&
    !params.has('minPrice') &&
    !params.has('maxPrice')
  ) {
    const range = barBudgetLabelToMinMax(bar.budget);
    if (range?.min != null) params.set('minPrice', String(range.min));
    if (range?.max != null) params.set('maxPrice', String(range.max));
  }
}
