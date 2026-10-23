/**
 * Valores enviados como `dateFlexDays` a la API (días ± respecto al check-in/checkout elegidos).
 * Backend acepta hasta 30.
 */
export const STAY_DATE_FLEX_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 0, label: 'Exact dates' },
  { value: 1, label: '±1 day' },
  { value: 2, label: '±2 days' },
  { value: 3, label: '±3 days' },
  { value: 7, label: '±1 week' },
  { value: 30, label: '±1 month' },
] as const;

/** Máximo permitido en UI y en query (debe coincidir con el clamp de la API). */
export const MAX_STAY_DATE_FLEX_UI = 30;

export function clampStayDateFlexDays(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_STAY_DATE_FLEX_UI, Math.floor(n));
}

/** Lee flex desde URL: `dateFlexDays` numérico o legacy `flexibleDates=true` (tratado como ±3). */
export function parseStayDateFlexFromQuery(query: {
  dateFlexDays?: string | string[];
  flexibleDates?: string | string[];
}): number {
  const raw = query.dateFlexDays;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first === 'string' && first.trim()) {
    const n = Number.parseInt(first.trim(), 10);
    if (Number.isFinite(n) && n >= 1 && n <= MAX_STAY_DATE_FLEX_UI) return n;
  }
  const flexFlag = query.flexibleDates;
  const ff = Array.isArray(flexFlag) ? flexFlag[0] : flexFlag;
  if (ff === 'true' || ff === '1') return 3;
  return 0;
}

export function stayDateFlexShortLabel(days: number): string {
  if (days <= 0) return '';
  if (days === 1) return '±1 day';
  if (days === 7) return '±1 week';
  if (days === 30) return '±1 month';
  if (days === 2) return '±2 days';
  if (days === 3) return '±3 days';
  return `±${days} days`;
}
