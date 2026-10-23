/**
 * Conteos de piscina vs jacuzzi alineados con `pages/villas/[id]` (classification.pools: type + cant).
 */

export function countSwimmingPoolsFromClassification(classification: any): number {
  const pools = classification?.pools;
  if (!Array.isArray(pools) || pools.length === 0) return 0;
  const poolItems = pools.filter((p: { type?: string }) => {
    const t = String(p?.type ?? '').trim().toLowerCase();
    if (!t) return true;
    return t === 'pool' || t === 'swimming pool';
  });
  if (poolItems.length === 0) return 0;
  return poolItems.reduce((sum: number, p: { cant?: number }) => sum + (Number(p?.cant) ?? 0), 0);
}

export function countJacuzzisFromClassification(classification: any): number {
  const pools = classification?.pools;
  if (!Array.isArray(pools) || pools.length === 0) return 0;
  const jacuzziItems = pools.filter(
    (p: { type?: string }) => String(p?.type ?? '').trim().toLowerCase() === 'jacuzzi'
  );
  if (jacuzziItems.length === 0) return 0;
  return jacuzziItems.reduce((sum: number, p: { cant?: number }) => sum + (Number(p?.cant) ?? 0), 0);
}

/** Pool count for sale cards: pools[] first, then legacy poolCount. */
export function countPoolsForRealEstateCard(classification: any): number {
  const swim = countSwimmingPoolsFromClassification(classification);
  if (swim > 0) return swim;
  const n = Number(classification?.poolCount);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Positive area helpers for real-estate list/cards (plot vs build). */
export function positiveAreaSqm(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getRealEstatePlotSqm(classification: any): number | null {
  return positiveAreaSqm(classification?.plotArea);
}

/** Built / living area: indoor → living → total. */
export function getRealEstateBuildSqm(classification: any): number | null {
  return positiveAreaSqm(
    classification?.indoorArea ?? classification?.livingArea ?? classification?.totalArea
  );
}

export function getRealEstateBathrooms(classification: any): number | null {
  const n = Number(classification?.baths);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getRealEstateYearBuilt(classification: any): number | null {
  const n = Number(classification?.contructionYear);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Texto para tarjetas/listados: "2 Pools", "1 Pool | 1 Jacuzzi", fallback a poolCount legado. */
export function formatPoolsJacuzziSpecLine(classification: any): string {
  const swim = countSwimmingPoolsFromClassification(classification);
  const jac = countJacuzzisFromClassification(classification);
  const parts: string[] = [];
  if (swim > 0) parts.push(`${swim} ${swim === 1 ? 'Pool' : 'Pools'}`);
  if (jac > 0) parts.push(`${jac} ${jac === 1 ? 'Jacuzzi' : 'Jacuzzis'}`);
  if (parts.length > 0) return parts.join(' | ');

  const poolCount = classification?.poolCount;
  if (poolCount != null && poolCount !== '' && Number(poolCount) > 0) {
    const n = Number(poolCount);
    return `${n} ${n === 1 ? 'Pool' : 'Pools'}`;
  }
  return '0 Pools';
}
