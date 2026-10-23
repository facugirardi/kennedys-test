import React, { useMemo } from 'react';

const DEFAULT_CEILING = 30000;
const STEP = 100;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Etiqueta del tope del slider: «+30.000» (es-ES) o «+$30,000» ($). */
function formatSliderCeilingPlus(ceiling: number, currencyPrefix: string): string {
  if (currencyPrefix === '$') {
    return `+$${ceiling.toLocaleString('en-US')}`;
  }
  return `+${ceiling.toLocaleString('es-ES')}`;
}

function maxInputPlaceholder(ceiling: number, currencyPrefix: string): string {
  if (currencyPrefix === '$') {
    return `+$${ceiling.toLocaleString('en-US')}`;
  }
  return `+${ceiling.toLocaleString('es-ES')}`;
}

export interface VillaPriceRangeValue {
  min: number | null;
  max: number | null;
}

export interface VillaPriceRangeControlProps {
  ceiling?: number;
  currencyPrefix: string;
  value: VillaPriceRangeValue;
  onChange: (next: VillaPriceRangeValue) => void;
}

/**
 * Rango de precio por noche: 0 … ceiling (30.000+).
 * min null = sin piso; max null = sin techo (30.000+).
 * Sliders con `min`/`max` cruzados para evitar solapamientos rotos.
 */
export const VillaPriceRangeControl: React.FC<VillaPriceRangeControlProps> = ({
  ceiling: ceilingProp,
  currencyPrefix,
  value,
  onChange
}) => {
  const safeCeiling = useMemo(() => {
    const c = ceilingProp ?? DEFAULT_CEILING;
    const r = Math.round(Number.isFinite(c) && c > 0 ? c : DEFAULT_CEILING);
    return Math.max(STEP * 2, r);
  }, [ceilingProp]);

  const { loAdj, hiAdj } = useMemo(() => {
    const rawLo = value.min != null && Number.isFinite(value.min) ? Number(value.min) : 0;
    const rawHi =
      value.max != null && Number.isFinite(value.max) ? Number(value.max) : safeCeiling;

    let lo = clamp(Math.round(rawLo / STEP) * STEP, 0, safeCeiling);
    let hi = clamp(Math.round(rawHi / STEP) * STEP, STEP, safeCeiling);

    if (lo > hi - STEP) {
      lo = hi - STEP;
    }
    if (hi < lo + STEP) {
      hi = lo + STEP;
    }

    return { loAdj: lo, hiAdj: hi };
  }, [value.min, value.max, safeCeiling]);

  const emit = (nextLo: number, nextHi: number) => {
    let L = clamp(Math.round(nextLo / STEP) * STEP, 0, safeCeiling);
    let H = clamp(Math.round(nextHi / STEP) * STEP, STEP, safeCeiling);
    if (L > H - STEP) {
      L = H - STEP;
    }
    if (H < L + STEP) {
      H = L + STEP;
    }
    onChange({
      min: L <= 0 ? null : L,
      max: H >= safeCeiling ? null : H
    });
  };

  const onMinSlider = (v: number) => emit(v, hiAdj);
  const onMaxSlider = (v: number) => emit(loAdj, v);

  const onMinInput = (raw: string) => {
    if (raw.trim() === '') {
      emit(0, hiAdj);
      return;
    }
    const n = parseInt(raw.replace(/\D/g, ''), 10);
    if (Number.isNaN(n)) return;
    emit(n, hiAdj);
  };

  const onMaxInput = (raw: string) => {
    if (raw.trim() === '') {
      emit(loAdj, safeCeiling);
      return;
    }
    const n = parseInt(raw.replace(/\D/g, ''), 10);
    if (Number.isNaN(n)) return;
    emit(loAdj, n);
  };

  const minSliderMax = Math.max(0, hiAdj - STEP);
  const maxSliderMin = Math.min(safeCeiling, loAdj + STEP);
  const thumbsClose = hiAdj - loAdj <= STEP * 2;
  const minZ = thumbsClose ? 5 : 3;
  const maxZ = thumbsClose ? 3 : 5;

  const trackLeft = safeCeiling > 0 ? (loAdj / safeCeiling) * 100 : 0;
  const trackWidth = safeCeiling > 0 ? ((hiAdj - loAdj) / safeCeiling) * 100 : 0;

  const minDisplay = value.min == null || value.min <= 0 ? '' : String(loAdj);
  const maxDisplay = value.max == null ? '' : String(hiAdj);

  return (
    <div className="space-y-4">
      <div className="relative h-11 dual-range-slider pt-1">
        <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 bg-[#E8ECF0] rounded-full" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 bg-[#7CF5EE] rounded-full pointer-events-none"
          style={{
            left: `${trackLeft}%`,
            width: `${Math.max(0, trackWidth)}%`
          }}
        />
        <input
          type="range"
          min={0}
          max={minSliderMax}
          step={STEP}
          value={loAdj}
          onChange={(e) => onMinSlider(parseInt(e.target.value, 10))}
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-11 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: minZ }}
          aria-label="Minimum nightly price"
        />
        <input
          type="range"
          min={maxSliderMin}
          max={safeCeiling}
          step={STEP}
          value={hiAdj}
          onChange={(e) => onMaxSlider(parseInt(e.target.value, 10))}
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-11 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: maxZ }}
          aria-label="Maximum nightly price"
        />
      </div>

      <div className="flex justify-between text-[11px] font-haas text-[#506A70] uppercase tracking-wide">
        <span>0</span>
        <span className="tabular-nums normal-case tracking-normal">
          {formatSliderCeilingPlus(safeCeiling, currencyPrefix)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-haas text-[#506A70] mb-1.5">Min / night</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#172338] font-haas text-sm">
              {currencyPrefix}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={minDisplay}
              onChange={(e) => onMinInput(e.target.value)}
              placeholder="No min"
              className="w-full h-11 pl-8 pr-3 border border-[#D1D5DB] font-haas text-sm text-[#172338] focus:outline-none focus:border-[#172338]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-haas text-[#506A70] mb-1.5">Max / night</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#172338] font-haas text-sm">
              {currencyPrefix}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={maxDisplay}
              onChange={(e) => onMaxInput(e.target.value)}
              placeholder={maxInputPlaceholder(safeCeiling, currencyPrefix)}
              className="w-full h-11 pl-8 pr-3 border border-[#D1D5DB] font-haas text-sm text-[#172338] focus:outline-none focus:border-[#172338]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
