import type { CSSProperties } from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getAllProperties } from "./api/properties"
import { getMediaBaseUrl, API_BASE_URL } from "./api/fetcher"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Escapa texto para inyección segura en HTML crudo (p.ej. templates de InfoWindow de Google Maps). */
export function escapeHtml(value: unknown): string {
  const s = value == null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDateRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const startDay = String(start.getUTCDate()).padStart(2, '0');
  const endDay = String(end.getUTCDate()).padStart(2, '0');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const startMonth = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];

  if (startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth}`;
  }

  return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
}

export function formatSingleDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getUTCMonth()];
  return `${day} ${month}`;
}

/** Joins location fields with ", ", skipping empties and duplicates (case-insensitive). */
export function joinUniqueLocationParts(...raw: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const t = typeof r === 'string' ? r.trim() : '';
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.join(', ');
}

export function formatPropertyAreaLocationCountry(property: {
  area?: string | null;
  region?: string | null;
  country?: string | null;
  location?: string | null;
  visibleLocation?: string | null;
}): string {
  const t = (v: unknown) => {
    if (v == null || v === "") return "";
    const s = String(v).trim();
    return s || "";
  };
  const parts = [t(property.area), t(property.region), t(property.country)].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return t(property.location) || t(property.visibleLocation) || "";
}

/**
 * Ubicación mostrada para una propiedad (cards y detalle): misma prioridad de campos
 * en todas partes para evitar que el listado muestre "Paros" y el detalle "Agkairia, Paros".
 */
export function getPropertyLocationLabel(property: {
  area?: string | null;
  region?: string | null;
  country?: string | null;
  location?: string | null;
  visibleLocation?: string | null;
  [key: string]: any;
}): string {
  return (
    joinUniqueLocationParts(property.area, property.region, property.country) ||
    joinUniqueLocationParts(property.location, property.region, property.country) ||
    joinUniqueLocationParts(property.visibleLocation, property.location, property.country) ||
    ''
  );
}

/**
 * Ubicación para cards de real estate: Country, Area y Location en ese orden,
 * sin repetir una parte que ya apareció (case-insensitive) — evita "Greece, Glyfada, Glyfada"
 * cuando area y location coinciden.
 */
export function getRealEstateCardLocationLabel(property: {
  area?: string | null;
  country?: string | null;
  location?: string | null;
  [key: string]: any;
}): string {
  return joinUniqueLocationParts(property.country, property.area, property.location);
}

export function formatAgentFriendlyName(code?: string | null, fallback = "Villa"): string {
  const raw = typeof code === "string" ? code.trim() : "";
  if (!raw) return fallback;
  const digits = raw.replace(/\D/g, "").slice(-3);
  if (digits) return `${fallback} ${digits}`;
  return `${fallback} ${raw}`.trim();
}

export function formatCurrency(value?: number | string | null, currencySymbol = '€ '): string {
  if (value === null || value === undefined || value === '') {
    return 'Price upon request';
  }
  const numeric = typeof value === 'string' ? parseOfferMoney(value) : value;
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 'Price upon request';
  }
  return `${currencySymbol}${numeric.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Parsea importes de ofertas: 1.240 → 1240, 4.960 → 4960 (no 4.96). */
export function parseOfferMoney(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  let s = String(value).replace(/<[^>]*>/g, '').trim().replace(/[€$]/g, '').replace(/\s/g, '');
  if (!s) return 0;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  if (hasComma) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      const n = Number(`${parts[0].replace(/\./g, '')}.${parts[1]}`);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(s.replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  if (hasDot) {
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length === 3 && /^\d+$/.test(parts[1])) {
      const n = Number(parts[0] + parts[1]);
      return Number.isFinite(n) ? n : 0;
    }
    if (parts.length > 2) {
      const n = Number(s.replace(/\./g, ''));
      return Number.isFinite(n) ? n : 0;
    }
  }

  const n = Number(s.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function isOfferPriceNote(text?: string | null): boolean {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return false;
  if (/[a-zA-Z]/.test(trimmed)) return true;
  return !(parseOfferMoney(trimmed) > 0);
}

function normalizeLocationMatchString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/**
 * USD when location text matches: Tulum, St Barts, Santa Teressa / Santa Teresa, or Papagayo.
 */
function haystackImpliesUsdResortLocations(haystackRaw: string): boolean {
  const haystack = normalizeLocationMatchString(haystackRaw).replace(/-/g, ' ');

  if (haystack.includes('tulum')) return true;
  if (haystack.includes('papagayo')) return true;

  if (
    haystack.includes('st barts') ||
    haystack.includes('st. barts') ||
    haystack.includes('saint barts') ||
    haystack.includes('saint barth') ||
    haystack.includes('barthelemy')
  ) {
    return true;
  }

  if (haystack.includes('santa teressa') || haystack.includes('santa teresa')) {
    return true;
  }

  return false;
}

/**
 * Uses area, region, country, location, visibleLocation and classification.locationCategory / visibleLocation,
 * plus optional UI hints (e.g. active list filters / region labels).
 */
export function propertyLocationUsesUsdDisplay(
  property: unknown,
  extraLocationHints?: Array<string | null | undefined>
): boolean {
  const parts: string[] = [];
  const push = (v: unknown) => {
    if (v == null || v === '') return;
    const s = String(v).trim();
    if (!s) return;
    for (const segment of s.split(/[,/|]+/)) {
      const t = segment.trim();
      if (t) parts.push(t);
    }
  };

  if (property != null && typeof property === 'object') {
    const p = property as Record<string, unknown>;
    push(p.area);
    push(p.region);
    push(p.country);
    push(p.location);
    push(p.visibleLocation);
    const cls = p.classification;
    if (cls && typeof cls === 'object') {
      const c = cls as Record<string, unknown>;
      push(c.locationCategory);
      push(c.visibleLocation);
    }
  }

  if (Array.isArray(extraLocationHints)) {
    for (const h of extraLocationHints) push(h);
  }

  return haystackImpliesUsdResortLocations(parts.join(' '));
}

export function getPropertyPriceCurrencySymbol(
  property: unknown,
  extraLocationHints?: Array<string | null | undefined>
): '$ ' | '€ ' {
  return propertyLocationUsesUsdDisplay(property, extraLocationHints) ? '$ ' : '€ ';
}

/** Sale cards: icon next to FROM (euro vs dollar). */
export function getPropertySaleListingCurrency(
  property: unknown,
  extraLocationHints?: Array<string | null | undefined>
): 'eur' | 'usd' {
  return propertyLocationUsesUsdDisplay(property, extraLocationHints) ? 'usd' : 'eur';
}

/**
 * Fixed FX rate — this system has no live exchange rate feed. Update manually as needed.
 * Source pair: 1 EUR = this many USD.
 */
export const EUR_TO_USD_RATE = 1.08;

export function convertPriceBetweenCurrencies(
  amount: number,
  from: 'usd' | 'eur',
  to: 'usd' | 'eur'
): number {
  if (from === to) return amount;
  return from === 'eur' ? amount * EUR_TO_USD_RATE : amount / EUR_TO_USD_RATE;
}

/**
 * Converts a property's sale price into `toCurrency`, starting from the currency implied
 * by its own location (`getPropertySaleListingCurrency`) — properties don't carry a currency field.
 */
export function getPropertySalePriceInCurrency(
  property: unknown,
  toCurrency: 'usd' | 'eur',
  extraLocationHints?: Array<string | null | undefined>
): number {
  const raw = Number((property as Record<string, unknown> | null)?.['sale_price']);
  if (!Number.isFinite(raw)) return 0;
  const fromCurrency = getPropertySaleListingCurrency(property, extraLocationHints);
  return convertPriceBetweenCurrencies(raw, fromCurrency, toCurrency);
}

/**
 * Extrae la parte de fecha YYYY-MM-DD de un valor (string ISO o Date).
 * Usa la fecha en UTC para que "2026-04-01T00:00:00.000Z" sea 1 abril, no 31 marzo en zonas UTC-X.
 */
function getDateOnlyString(value: string | Date): string {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (value.includes('T')) return value.split('T')[0];
    return value.slice(0, 10);
  }
  const d = value as Date;
  return d.toISOString().split('T')[0];
}

/**
 * Expands availability ranges into individual days
 * Each day gets its price and min_stay from the range it belongs to
 * Disabled dates are excluded
 */
export function expandAvailabilityRangesToDays(
  availabilityRanges: any[],
  currencySymbol: string = '€ '
): Array<{
  date: string;
  dateFormatted: string;
  price: string;
  priceNumeric: number;
  minStay: string;
}> {
  const daysMap = new Map<string, { price: number; min_stay?: number }>();

  availabilityRanges.forEach((range, index) => {
    // Solo procesar rangos disponibles (igual que en Loggia)
    if (range.is_available === false) {
      return;
    }

    // Normalizar fechas de inicio y fin
    const startRaw = range.from || range.startDate;
    const endRaw = range.to || range.endDate;

    const startDateStr = getDateOnlyString(startRaw);
    const endDateStr = getDateOnlyString(endRaw);
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

    if (!startYear || !endYear || startDateStr < '1900-01-01' || endDateStr > '2100-12-31') {
      return;
    }

    // Iterar por fechas calendario (YYYY-MM-DD) sin aplicar zona horaria
    let current = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    // Normalizar disabled_dates a formato YYYY-MM-DD (igual que en el calendario)
    const disabledDates = Array.isArray(range.disabled_dates)
      ? range.disabled_dates
          .map((d: string | Date) => {
            if (d instanceof Date) {
              return d.toISOString().split('T')[0];
            }
            if (typeof d === 'string') {
              // Si ya viene como YYYY-MM-DD lo dejamos así
              if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
                return d;
              }
              const parsed = new Date(d);
              if (!isNaN(parsed.getTime())) {
                return parsed.toISOString().split('T')[0];
              }
            }
            return null;
          })
          .filter((d: string | null): d is string => d !== null)
      : [];

    const price = range.price_per_night || 0;
    const minStay = range.min_stay;

    // Iterar por cada día del rango usando componentes de fecha explícitos
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const day = current.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // YYYY-MM-DD

      // Omitir fechas deshabilitadas
      if (!disabledDates.includes(dateStr)) {
        daysMap.set(dateStr, {
          price,
          min_stay: minStay,
        });
      }

      // Avanzar un día evitando problemas de timezone
      const nextYear = current.getFullYear();
      const nextMonth = current.getMonth();
      const nextDay = current.getDate();
      current = new Date(nextYear, nextMonth, nextDay + 1, 0, 0, 0, 0);
    }
  });
  
  // Convert to array and sort by date
  const result = Array.from(daysMap.entries())
    .map(([dateStr, data]) => ({
      date: dateStr,
      dateFormatted: formatSingleDate(dateStr),
      price: formatCurrency(data.price, currencySymbol),
      priceNumeric: data.price,
      minStay: data.min_stay ? `${data.min_stay} nights` : 'N/A'
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

/**
 * Groups consecutive days with the same price and min_stay into date ranges
 * Similar to how seasonal ranges are calculated in kennedys-loggia
 */
export function groupAvailabilityRangesByPriceAndMinStay(
  availabilityRanges: any[],
  currencySymbol: string = '€ '
): Array<{
  dateRange: string;
  dateRangeFormatted: string;
  price: string;
  priceNumeric: number;
  minStay: string;
  minStayNumeric: number | null;
}> {
  if (!Array.isArray(availabilityRanges) || availabilityRanges.length === 0) {
    return [];
  }

  // First, expand all ranges to individual days
  const allDays = expandAvailabilityRangesToDays(availabilityRanges, currencySymbol);
  
  if (allDays.length === 0) {
    return [];
  }

  // Group consecutive days with the same price and min_stay
  type GroupRange = {
    from: string;
    to: string;
    price: number;
    min_stay: number | null;
  };
  
  const groupedRanges: GroupRange[] = [];
  
  let currentGroup: GroupRange | null = null;

  allDays.forEach((day) => {
    // Extract numeric values for comparison
    const price = day.priceNumeric;
    const minStay = day.minStay === 'N/A' ? null : parseInt(day.minStay.replace(' nights', '')) || null;
    
    // Check if this day matches the current group (same price and min_stay)
    const matchesCurrentGroup = currentGroup !== null && 
      Math.abs(currentGroup.price - price) < 0.01 && // Compare prices with tolerance for floating point
      currentGroup.min_stay === minStay;

    if (currentGroup === null || !matchesCurrentGroup) {
      // Close previous group if exists
      if (currentGroup !== null) {
        groupedRanges.push({
          from: currentGroup.from,
          to: currentGroup.to,
          price: currentGroup.price,
          min_stay: currentGroup.min_stay,
        });
      }
      // Start new group
      currentGroup = {
        from: day.date,
        to: day.date,
        price: price,
        min_stay: minStay,
      };
    } else {
      // Check if consecutive
      const lastDate = new Date(currentGroup.to + 'T12:00:00');
      lastDate.setDate(lastDate.getDate() + 1);
      const nextDayStr = lastDate.toISOString().split('T')[0];
      
      if (day.date === nextDayStr) {
        // Consecutive, extend range
        currentGroup.to = day.date;
      } else {
        // Not consecutive, close previous group and start new
        groupedRanges.push({
          from: currentGroup.from,
          to: currentGroup.to,
          price: currentGroup.price,
          min_stay: currentGroup.min_stay,
        });
        currentGroup = {
          from: day.date,
          to: day.date,
          price: price,
          min_stay: minStay,
        };
      }
    }
  });

  // Add the last group
  if (currentGroup !== null) {
    const finalGroup = currentGroup as GroupRange;
    groupedRanges.push({
      from: finalGroup.from,
      to: finalGroup.to,
      price: finalGroup.price,
      min_stay: finalGroup.min_stay,
    });
  }

  // Format the grouped ranges for display
  return groupedRanges.map((range) => {
    const fromDate = formatSingleDate(range.from);
    const toDate = formatSingleDate(range.to);
    const dateRangeFormatted = range.from === range.to 
      ? fromDate 
      : `${fromDate} - ${toDate}`;
    
    return {
      dateRange: `${range.from} to ${range.to}`,
      dateRangeFormatted: dateRangeFormatted,
      price: formatCurrency(range.price, currencySymbol),
      priceNumeric: range.price,
      minStay: range.min_stay ? `${range.min_stay} nights` : 'N/A',
      minStayNumeric: range.min_stay,
    };
  });
}

type PropertyFilters = Record<string, string | number | boolean | undefined | null>;

/**
 * Gets the media base URL, ensuring it's always an absolute URL
 * Uses getMediaBaseUrl from fetcher as the primary source
 */
function getValidMediaBaseUrl(): string {
  // getMediaBaseUrl usa NEXT_PUBLIC_MEDIA_BASE_URL (solo imágenes) o deriva del API
  const mediaBase = getMediaBaseUrl?.();
  if (mediaBase) {
    // Ensure it's an absolute URL
    try {
      const url = new URL(mediaBase);
      return url.toString().replace(/\/+$/, "");
    } catch {
      // If it's not a valid URL, try to fix it
      if (mediaBase.startsWith('http://') || mediaBase.startsWith('https://')) {
        return mediaBase.replace(/\/+$/, "");
      }
    }
  }

  // Fallback: try to construct from NEXT_PUBLIC_API_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      // Remove /api from pathname if present
      let path = url.pathname.replace(/\/+$/, "");
      if (path.endsWith("/api")) {
        path = path.replace(/\/api$/, "");
      }
      url.pathname = path;
      return url.toString().replace(/\/+$/, "");
    } catch {
      // If it's a relative path, it's invalid - return empty
      if (apiUrl.startsWith('/')) {
        return "";
      }
      // Try adding https://
      try {
        const withProtocol = apiUrl.startsWith('http://') || apiUrl.startsWith('https://') 
          ? apiUrl 
          : `https://${apiUrl}`;
        const url = new URL(withProtocol);
        let path = url.pathname.replace(/\/+$/, "");
        if (path.endsWith("/api")) {
          path = path.replace(/\/api$/, "");
        }
        url.pathname = path;
        return url.toString().replace(/\/+$/, "");
      } catch {
        return "";
      }
    }
  }

  // Last fallback: NEXT_PUBLIC_BASE_URL
  const baseUrlFallback = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  if (baseUrlFallback) {
    try {
      const url = new URL(baseUrlFallback);
      return url.toString().replace(/\/+$/, "");
    } catch {
      if (baseUrlFallback.startsWith('http://') || baseUrlFallback.startsWith('https://')) {
        return baseUrlFallback.replace(/\/+$/, "");
      }
    }
  }

  return "";
}

export function resolveMediaUrl(path?: string | null) {
  if (!path) return "";
  const raw = String(path).trim();
  if (!raw) return "";

  // Mantener data URLs (headers/imágenes embebidas) y blob URLs tal cual
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  
  // If it's already an absolute URL, return it as-is
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalizedPath = raw.replace(/^\/+/, "");
  if (!normalizedPath) return "";

  // Get the validated media base URL
  const mediaBase = getValidMediaBaseUrl();
  
  if (mediaBase) {
    // Ensure we don't create double slashes
    const cleanPath = normalizedPath.replace(/^\/+/, "");
    // Many deployments expose uploads at /uploads while API base is /api.
    // If base ends with /api and media path is uploads/*, remove /api segment.
    const baseForUploads =
      /\/api$/i.test(mediaBase) && /^uploads\//i.test(cleanPath)
        ? mediaBase.replace(/\/api$/i, "")
        : mediaBase;
    return `${baseForUploads}/${cleanPath}`;
  }

  // If no valid base URL is available, log a warning in development
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️ resolveMediaUrl: No valid API base URL configured. NEXT_PUBLIC_API_URL="${process.env.NEXT_PUBLIC_API_URL || 'not set'}". Cannot resolve media path: ${path}`);
  }

  // Return empty string instead of a relative path to avoid 404s
  // Components should handle empty strings and show placeholders
  return "";
}

/**
 * Same source image, but routed through kennedys-api's /media/resize proxy at a given width.
 * Only used for the print-only owner-report page: Chrome's print pipeline embeds <img> tags at
 * their *source* resolution (villa photos are ~2048px wide), not their CSS display size, which
 * was pushing that PDF's embedded images to tens of MB. The live/interactive report keeps using
 * resolveMediaUrl unchanged — this is strictly for the PDF capture path.
 */
export function resolvePrintImageUrl(path?: string | null, width = 800): string {
  if (!path) return "";
  const raw = String(path).trim();
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  const uploadsMatch = raw.match(/(uploads\/.+)$/i);
  if (!uploadsMatch) {
    // Not an uploads-relative path we can proxy (e.g. an external URL) — fall back as-is.
    return resolveMediaUrl(raw);
  }
  const relative = uploadsMatch[1];
  return `${API_BASE_URL}/media/resize?path=${encodeURIComponent(relative)}&w=${width}`;
}

/** Experience `gallery[]` puede ser rutas string o objetos desde CMS / migraciones JSONB. */
export function coerceExperienceMediaPath(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const keys = ["url", "filename", "urlImage", "img", "path", "src"] as const;
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

export function normalizeExperienceGalleryRaw(gallery: unknown): string[] {
  if (!Array.isArray(gallery)) return [];
  const out: string[] = [];
  for (const item of gallery) {
    const p = coerceExperienceMediaPath(item);
    if (p) out.push(p);
  }
  return out;
}

/**
 * URL para hero / foto principal: sin wsrv.nl; el navegador carga el archivo tal cual (p. ej. JPG desde la API).
 * Rutas absolutas del sitio (/), data: y http(s) se devuelven sin cambio; paths relativos al storage vía resolveMediaUrl.
 */
export function heroImageDirectUrl(
  src: string | undefined | null,
  width?: number
): string {
  if (src == null || String(src).trim() === "") return "";
  const s = String(src).trim();
  let url: string;
  if (s.startsWith("data:")) url = s;
  else if (s.startsWith("/")) url = s;
  else if (/^https?:\/\//i.test(s)) url = s;
  else url = resolveMediaUrl(s);
  return width ? optimizedImageUrl(url, width) : url;
}

/** Must match next.config.js `images.deviceSizes` + `images.imageSizes`, or /_next/image answers 400. */
const NEXT_IMAGE_WIDTHS = [96, 160, 256, 384, 480, 640, 828, 1080, 1280, 1600, 1920];

function getOptimizableRemoteHosts(): string[] {
  const hosts = ["api.kennedys.group"];
  try {
    const apiHost = new URL(process.env.NEXT_PUBLIC_API_URL || "").hostname;
    if (apiHost) hosts.push(apiHost);
  } catch {
    /* NEXT_PUBLIC_API_URL not set or relative */
  }
  return hosts;
}

/**
 * Routes an on-screen image through Vercel's /_next/image (resize + AVIF/WebP + edge cache).
 * Only for <img>/CSS shown in the browser: OG meta, PDF/html2canvas capture and server-side code
 * must keep using the raw URL. Anything it can't safely optimize (data/blob URLs, SVG/GIF, hosts
 * missing from next.config.js remotePatterns) is returned unchanged.
 */
export function optimizedImageUrl(
  src: string | undefined | null,
  width: number,
  quality = 75
): string {
  if (src == null) return "";
  const s = String(src).trim();
  if (!s || s.startsWith("data:") || s.startsWith("blob:")) return s;
  if (/\.(svg|gif)(\?|#|$)/i.test(s)) return s;
  if (s.startsWith("/_next/")) return s;

  if (/^https?:\/\//i.test(s)) {
    let host = "";
    try {
      host = new URL(s).hostname;
    } catch {
      return s;
    }
    if (!getOptimizableRemoteHosts().includes(host)) return s;
  } else if (!s.startsWith("/") || s.startsWith("//")) {
    return s;
  }

  const w = NEXT_IMAGE_WIDTHS.find((size) => size >= width) ?? NEXT_IMAGE_WIDTHS[NEXT_IMAGE_WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(s)}&w=${w}&q=${quality}`;
}

export function formatNightlyPriceLabel(value?: number | string | null, currencySymbol = "$") {
  if (value === null || value === undefined || value === "") {
    return "Price on request";
  }

  const numeric = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numeric)) {
    return "Price on request";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numeric as number);

  return `From ${currencySymbol}${formatted}/Night`;
}

/**
 * Build table rows for the Price/Night box from the price table only (property_price_ranges).
 * Each row = one price range: date range, min stay, price. Not availability.
 */
export function formatPriceRangesToTableRows(
  priceRanges: any[],
  currencySymbol: string = '€ '
): Array<{ dates: string; price: string; minStay: string }> {
  if (!Array.isArray(priceRanges) || priceRanges.length === 0) return [];
  return priceRanges.map((r) => {
    const from = getDateOnlyString(r.from ?? r.startDate ?? '');
    const to = getDateOnlyString(r.to ?? r.endDate ?? '');
    const dates = from && to ? formatDateRange(from, to) : '–';
    const price = formatCurrency(r.price_per_night, currencySymbol);
    const minStay = r.min_stay != null ? `${r.min_stay} nights` : 'N/A';
    return { dates, price, minStay };
  });
}

/** Get price and min_stay for a date from a list of price ranges (from, to, price_per_night, min_stay). */
export function getPriceForDateInRanges(ranges: any[], dateStr: string): { price: number; min_stay?: number } | null {
  if (!Array.isArray(ranges) || ranges.length === 0) return null;
  const d = getDateOnlyString(dateStr);
  for (const range of ranges) {
    if (range.is_available === false) continue;
    const disabledDates = Array.isArray(range.disabled_dates)
      ? range.disabled_dates.map((x: string | Date) => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : new Date(x).toISOString().split('T')[0])).filter(Boolean)
      : [];
    if (disabledDates.includes(d)) continue;
    const start = getDateOnlyString(range.from || range.startDate);
    const end = getDateOnlyString(range.to || range.endDate);
    if (d >= start && d <= end && (range.price_per_night != null || range.price_per_night === 0)) {
      return {
        price: Number(range.price_per_night) || 0,
        min_stay: range.min_stay != null ? Number(range.min_stay) : undefined,
      };
    }
  }
  return null;
}

/** Generate all date strings in [fromStr, toStr] (inclusive). fromStr/toStr YYYY-MM-DD. */
function allDaysInRange(fromStr: string, toStr: string): string[] {
  const [fy, fm, fd] = fromStr.split('-').map(Number);
  const [ty, tm, td] = toStr.split('-').map(Number);
  const out: string[] = [];
  let y = fy, m = fm, d = fd;
  const endY = ty, endM = tm, endD = td;
  while (y < endY || (y === endY && m < endM) || (y === endY && m === endM && d <= endD)) {
    out.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    const next = new Date(y, m - 1, d + 1);
    y = next.getFullYear();
    m = next.getMonth() + 1;
    d = next.getDate();
  }
  return out;
}

/** Available days = all days in [fromStr, toStr] minus blockedDates, minus dates before todayStr. */
export function getAvailableDaysInRange(
  fromStr: string,
  toStr: string,
  blockedDates: string[],
  todayStr: string
): string[] {
  const blockedSet = new Set(blockedDates || []);
  const all = allDaysInRange(fromStr, toStr);
  return all.filter((d) => !blockedSet.has(d) && d >= todayStr);
}

/** Build pricing/availability day list from available date strings + price ranges lookup. */
export function availabilityDatesToDays(
  availabilityDates: string[],
  priceRanges: any[],
  formatSingleDateFn: (dateStr: string) => string,
  formatCurrencyFn: (n: number) => string
): Array<{ date: string; dateFormatted: string; price: string; priceNumeric: number; minStay: string }> {
  if (!Array.isArray(availabilityDates) || availabilityDates.length === 0) return [];
  return availabilityDates
    .map((dateStr) => {
      const info = getPriceForDateInRanges(priceRanges || [], dateStr);
      const price = info?.price ?? 0;
      return {
        date: dateStr,
        dateFormatted: formatSingleDateFn(dateStr),
        price: formatCurrencyFn(price),
        priceNumeric: price,
        minStay: info?.min_stay != null ? `${info.min_stay} nights` : 'N/A',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Función para obtener el precio desde la fecha actual (usa priceRanges o availabilityRanges como fallback)
export function getPriceFromCurrentDate(property: any): number | null {
  if (property?.price_visibility === false) return null;
  const ranges = property?.priceRanges ?? property?.availabilityRanges;
  if (!ranges || !Array.isArray(ranges) || ranges.length === 0) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const info = getPriceForDateInRanges(ranges, todayStr);
  return info ? info.price : null;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');             // Trim - from end of text
}

/** "★", "⭐", etc. — item names like "5★ Concierge Mykonos" use the symbol, not the word. */
const STAR_SYMBOLS_REGEX = /[★⭐✩✭✰☆🌟]/g

/**
 * Normalizes text for free-text search matching: lowercases, spells out star symbols as the
 * word "star" (so "5★" and "5 stars" line up), singularizes "stars" → "star", and collapses
 * whitespace.
 */
export function normalizeSearchText(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(STAR_SYMBOLS_REGEX, ' star ')
    .replace(/\bstars\b/g, 'star')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when every word of `query` appears somewhere in `text` (order-independent). */
export function matchesSearchQuery(text: string, query: string): boolean {
  const normalizedText = normalizeSearchText(text)
  const terms = normalizeSearchText(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true
  return terms.every((term) => normalizedText.includes(term))
}

/** Normaliza la respuesta de getAllProperties a un array (para usar en SSR y en cliente) */
/**
 * Build a wsrv.nl image optimiser URL.
 * wsrv.nl resizes, converts to WebP and caches images at the CDN edge.
 * Local paths (starting with /) and data URIs are returned unchanged.
 * URLs with host localhost/127.0.0.1 are returned as-is (wsrv.nl cannot resolve them).
 */
export function wsrvUrl(
  src: string,
  opts: { w?: number; h?: number; fit?: 'cover' | 'contain' | 'fill'; q?: number; position?: string | null } = {}
): string {
  if (!src || src.startsWith('/') || src.startsWith('data:')) return src;
  try {
    const u = new URL(src);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return src;
  } catch {
    /* not a valid URL, continue to wsrv */
  }
  try {
    const params = new URLSearchParams({ url: src });
    if (opts.w) params.set('w', String(opts.w));
    if (opts.h) params.set('h', String(opts.h));
    params.set('fit', opts.fit ?? 'cover');
    params.set('output', 'webp');
    params.set('q', String(opts.q ?? 100));
    // TEMPORAL: cache bust para forzar wsrv.nl a traer la imagen fresca del origen (sacar después de probar)
    params.set('n', '1');
    // Loggia's reposition editor stores a CSS object-position ("62.0% 40.0%") — wsrv crops
    // server-side before the browser ever sees the image, so plain CSS object-position on the
    // <img> can't reach content wsrv already cut away. Its own focal-point crop (fpx/fpy, 0–1)
    // is the only way to actually honor that position here. https://wsrv.nl/docs/crop.html
    const focal = parseObjectPositionToUnit(opts.position);
    if (focal) {
      params.set('a', 'focal');
      params.set('fpx', focal.x.toFixed(3));
      params.set('fpy', focal.y.toFixed(3));
    }
    return `https://wsrv.nl/?${params.toString()}`;
  } catch {
    return src;
  }
}

/**
 * "62.0% 40.0%" -> { x: 0.62, y: 0.4 } (clamped to 0-1); null for "center"/empty/unparseable.
 * Also accepts Loggia's optional trailing zoom token ("62.0% 40.0% 1.35") and ignores it — wsrv's
 * own crop only needs the focal point, zoom is applied separately as a client-side CSS transform
 * (see `positionStyle` below) since wsrv has no equivalent "zoom past the crop" parameter.
 */
function parseObjectPositionToUnit(position?: string | null): { x: number; y: number } | null {
  const trimmed = (position || '').trim().toLowerCase();
  if (!trimmed || trimmed === 'center') return null;
  const m = trimmed.match(/^([\d.]+)%\s+([\d.]+)%(?:\s+[\d.]+)?$/);
  if (!m) return null;
  const clamp = (n: number) => Math.min(1, Math.max(0, n / 100));
  return { x: clamp(Number(m[1])), y: clamp(Number(m[2])) };
}

/**
 * CSS style for a Loggia reposition value ("62.0% 40.0%" or "62.0% 40.0% 1.35") on a plain
 * `object-cover` <img> that is NOT going through wsrv — `object-position` alone can't express
 * zoom, so a zoomed value also needs `transform: scale()` anchored at the same point. The parent
 * element must have `overflow: hidden` or the zoomed image will visibly spill past its box.
 */
export function positionStyle(value?: string | null): CSSProperties {
  const trimmed = (value || '').trim().toLowerCase();
  if (!trimmed || trimmed === 'center') return { objectPosition: 'center' };
  const m = trimmed.match(/^([\d.]+)%\s+([\d.]+)%(?:\s+([\d.]+))?$/);
  if (!m) return { objectPosition: trimmed };
  const objectPosition = `${m[1]}% ${m[2]}%`;
  const zoom = m[3] ? Number(m[3]) : 1;
  if (!Number.isFinite(zoom) || zoom <= 1) return { objectPosition };
  return { objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition };
}

/**
 * Same reposition value applied to a CSS `background-image` element instead of an `<img>`
 * (`object-position` has no effect there). Zoom is intentionally left out — callers that animate
 * their own `transform` on hover (villa/real-estate hero) would have that inline style clobbered.
 */
export function backgroundPositionStyle(value?: string | null): CSSProperties {
  const trimmed = (value || '').trim().toLowerCase();
  if (!trimmed || trimmed === 'center') return { backgroundPosition: 'center' };
  const m = trimmed.match(/^([\d.]+)%\s+([\d.]+)%(?:\s+[\d.]+)?$/);
  if (!m) return { backgroundPosition: trimmed };
  return { backgroundPosition: `${m[1]}% ${m[2]}%` };
}

/**
 * Si la URL es un proxy wsrv.nl, devuelve la URL original del parámetro `url`.
 * Sirve cuando el CMS guardó thumbnails con `w` bajo y el hero se ve borroso al ampliarlo.
 */
export function unwrapWsrvProxyUrl(src: string | undefined | null): string {
  if (src == null) return "";
  let s = String(src).trim();
  if (!s) return "";
  let depth = 0;
  while (depth++ < 4) {
    try {
      const u = new URL(s);
      if (!/^(www\.)?wsrv\.nl$/i.test(u.hostname)) return s;
      const inner = u.searchParams.get("url")?.trim();
      if (!inner) return s;
      const decoded = decodeURIComponent(inner);
      if (!decoded || decoded === s) return s;
      s = decoded;
    } catch {
      return s;
    }
  }
  return s;
}

export function normalizePropertiesResponse(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object' && 'data' in res) {
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.items && Array.isArray(res.data.items)) return res.data.items;
  }
  return [];
}

export async function fetchProperties(filters: PropertyFilters = {}) {
  try {
    const res = await getAllProperties(filters);
    return normalizePropertiesResponse(res) ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('fetchProperties:', error);
    return [];
  }
}

export const REAL_ESTATE_LIST_PAGE_SIZE = 12;

export type PropertiesListResult = {
  items: any[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Property list API returns `{ items, total, page, pageSize }` inside `data` when limited.
 */
export async function fetchPropertiesListResult(
  filters: PropertyFilters = {}
): Promise<PropertiesListResult> {
  const fallbackSize = Number(filters.pageSize) || REAL_ESTATE_LIST_PAGE_SIZE;
  try {
    const res = await getAllProperties(filters);
    if (res && typeof res === 'object' && (res as any).success === false) {
      return { items: [], total: 0, page: 1, pageSize: fallbackSize };
    }
    const payload = (res as any)?.data;
    if (payload && typeof payload === 'object' && Array.isArray(payload.items)) {
      return {
        items: payload.items,
        total: typeof payload.total === 'number' ? payload.total : payload.items.length,
        page: typeof payload.page === 'number' ? payload.page : 1,
        pageSize: typeof payload.pageSize === 'number' ? payload.pageSize : fallbackSize,
      };
    }
    const arr = normalizePropertiesResponse(res) ?? [];
    return {
      items: arr,
      total: arr.length,
      page: 1,
      pageSize: arr.length || fallbackSize,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('fetchPropertiesListResult:', error);
    return { items: [], total: 0, page: 1, pageSize: fallbackSize };
  }
}

/**
 * Fetches every page of a listing query (server caps pageSize at 100 — see lib/api/properties.js).
 * Needed when a filter can't be delegated to the backend (e.g. currency-aware price range) and has
 * to be applied client-side against the full matching set instead of one server page at a time.
 */
export async function fetchAllPropertiesListResult(
  filters: PropertyFilters = {}
): Promise<any[]> {
  const pageSize = 100;
  const MAX_PAGES = 20;

  const first = await fetchPropertiesListResult({ ...filters, page: 1, pageSize });
  if (!first.items || first.items.length === 0) return [];

  const all: any[] = [...first.items];
  const totalPages = Math.min(MAX_PAGES, Math.ceil((first.total || first.items.length) / pageSize));

  if (totalPages > 1) {
    // Remaining pages don't depend on each other — fetch them concurrently instead of
    // one-by-one, which used to serialize the whole wait behind N round trips.
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        fetchPropertiesListResult({ ...filters, page: i + 2, pageSize })
      )
    );
    for (const { items } of rest) {
      if (items && items.length) all.push(...items);
    }
  }

  return all;
}
