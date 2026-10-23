export type OfferDisplayCurrency = "EUR" | "USD";

export function offerMoneySymbol(currency: OfferDisplayCurrency): string {
  return currency === "USD" ? "$" : "€";
}

/** Total formateado para la oferta (estancia); null si no hay monto válido. */
export function formatOfferTotalDisplay(
  value: number | null | undefined,
  currency: OfferDisplayCurrency
): string | null {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) <= 0) {
    return null;
  }
  const sym = offerMoneySymbol(currency);
  return `${sym}${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function normalizeOfferDiscountPercentValue(discount?: unknown, discountShare?: unknown): number {
  const n = Number(discount ?? discountShare ?? 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n > 0 && n <= 1) return n * 100;
  return n;
}

/** Total pre-descuento (lista / official antes del descuento). */
export function getVillaOfferOfficialTotal(property: {
  grossRate?: unknown;
  finalPrice?: unknown;
  officialPrice?: unknown;
  discount?: unknown;
  discountShare?: unknown;
}): number | null {
  const gross = Number(property.grossRate);
  if (Number.isFinite(gross) && gross > 0) {
    return Math.round(gross * 100) / 100;
  }
  const discountPct = normalizeOfferDiscountPercentValue(property.discount, property.discountShare);
  const finalP = property.finalPrice ?? property.officialPrice;
  if (discountPct > 0 && finalP != null && Number.isFinite(Number(finalP))) {
    const pct = 1 - discountPct / 100;
    if (pct > 0) return Math.round((Number(finalP) / pct) * 100) / 100;
  }
  if ((!discountPct || discountPct <= 0) && finalP != null && Number.isFinite(Number(finalP)) && Number(finalP) > 0) {
    return Math.round(Number(finalP) * 100) / 100;
  }
  return null;
}

/** Total que paga el cliente (tras descuento). */
export function getVillaOfferFinalTotal(property: {
  finalPrice?: unknown;
  officialPrice?: unknown;
  grossRate?: unknown;
}): number | null {
  const f = Number(property.finalPrice);
  if (Number.isFinite(f) && f > 0) return Math.round(f * 100) / 100;
  const o = Number(property.officialPrice);
  if (Number.isFinite(o) && o > 0) return Math.round(o * 100) / 100;
  const g = Number(property.grossRate);
  if (Number.isFinite(g) && g > 0) return Math.round(g * 100) / 100;
  return null;
}

/**
 * True si conviene mostrar las filas "Initial price" y "Discount" en cards/PDF.
 * Si es false, solo debe mostrarse "Final price" (misma lógica que la etiqueta "—" en descuento,
 * salvo cuando lista y final difieren aunque el campo de descuento venga vacío).
 */
export function villaOfferShowInitialDiscountRows(
  property: {
    discountMode?: unknown;
    discountFixedAmount?: unknown;
    discount?: unknown;
    discountShare?: unknown;
  },
  currency: OfferDisplayCurrency,
  officialTotal: number | null,
  finalTotal: number | null
): boolean {
  const discountLabel = formatVillaOfferDiscountLabel(property, currency);
  if (discountLabel !== "—") return true;
  if (
    officialTotal != null &&
    finalTotal != null &&
    Number(officialTotal) - Number(finalTotal) > 0.01
  ) {
    return true;
  }
  return false;
}

export function formatVillaOfferDiscountLabel(
  property: {
    discountMode?: unknown;
    discountFixedAmount?: unknown;
    discount?: unknown;
    discountShare?: unknown;
  },
  currency: OfferDisplayCurrency
): string {
  if (String(property.discountMode) === "fixed") {
    const amt = Number(property.discountFixedAmount);
    if (Number.isFinite(amt) && amt > 0) {
      const sym = offerMoneySymbol(currency);
      return `${sym}${amt.toLocaleString("en-US", { maximumFractionDigits: 0 })} off`;
    }
  }
  const pct = normalizeOfferDiscountPercentValue(property.discount, property.discountShare);
  if (pct > 0) {
    return pct % 1 === 0 ? `${pct}%` : `${pct.toFixed(2)}%`;
  }
  return "—";
}
