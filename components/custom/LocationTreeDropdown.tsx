'use client';

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { KENNEDYS_LOCATION_FILTER_TREE } from '@/lib/kennedysLocationFilterTree';

export type LocationCountryGroup = {
  country: string;
  regions: string[];
  areasByRegion?: Record<string, string[]>;
  /** Sub-localidades reales bajo una mega area (p. ej. Glyfada -> Kato Glyfada), keyed por nombre de área. */
  subAreasByArea?: Record<string, string[]>;
  /** 4to nivel: sub-sub-localidades bajo una sub-área (p. ej. Kato Glyfada -> Center, Golf), keyed por nombre de sub-área. */
  subSubAreasBySubArea?: Record<string, string[]>;
  /** 5to nivel: bajo una sub-sub-área (p. ej. Kato Glyfada -> Center, Golf), keyed por nombre de sub-sub-área. */
  subSubSubAreasBySubSubArea?: Record<string, string[]>;
};

export type LocationTreeSelection = {
  /** País mostrado en el label (si aplica) */
  selectedCountry: string;
  /**
   * Valor enviado a la API: un solo nombre de región; o CSV de hojas (país completo / «All areas»);
   * con `area` rellena, suele ser el padre del árbol mientras la hoja va en `area`.
   */
  regionValue: string;
  area: string;
  /** Solo para etiqueta UI cuando `regionValue` lista todas las localidades de una región */
  scope?: 'country' | 'region';
  displayRegion?: string;
  /** Con `multiSelect`: hojas elegidas (islas/áreas), misma semántica que CSV en `regionValue` */
  selectedLeaves?: string[];
};

export type LocationTreeDropdownHandle = {
  close: () => void;
};

function leafArrayFromValue(value: LocationTreeSelection): string[] {
  if (value.selectedLeaves && value.selectedLeaves.length > 0) return [...value.selectedLeaves];
  if (value.area?.trim()) return [value.area.trim()];
  return value.regionValue.split(',').map((s) => s.trim()).filter(Boolean);
}

function leafTok(s: string): string {
  return (s || '').trim().toLowerCase();
}

function hasLeaf(set: Set<string>, leaf: string): boolean {
  return set.has(leafTok(leaf));
}

function leafSetFromArray(arr: string[]): Set<string> {
  return new Set(arr.map(leafTok).filter(Boolean));
}

/** Normaliza nombres de región (p. ej. GR → Greece) para alinear con el árbol fusionado. */
function normalizeRegionToken(r: string): string {
  const t = (r || '').trim();
  if (!t) return '';
  if (t.toUpperCase() === 'GR') return 'Greece';
  return t;
}

/** Localidades hoja bajo una región; si no hay sub-áreas en el árbol, la región es la hoja. */
export function collectLeafLocationsForRegion(
  group: LocationCountryGroup,
  region: string,
): string[] {
  const regionDisplay = normalizeRegionToken(region);
  const byRegion = group.areasByRegion || {};
  const rawAreas = byRegion[region] ?? byRegion[regionDisplay] ?? [];
  if (rawAreas.length > 0) {
    return Array.from(new Set(rawAreas.map((a) => (a || '').trim()).filter(Boolean)));
  }
  return regionDisplay ? [regionDisplay] : [];
}

export function collectLeafLocationsForCountry(group: LocationCountryGroup): string[] {
  const leaves: string[] = [];
  for (const reg of group.regions || []) {
    leaves.push(...collectLeafLocationsForRegion(group, reg));
  }
  return Array.from(new Set(leaves.filter(Boolean)));
}

function sameLeafSet(tokens: string[], leaves: string[]): boolean {
  if (tokens.length !== leaves.length) return false;
  const lowerLeaves = new Set(leaves.map((s) => s.trim().toLowerCase()));
  for (const t of tokens) {
    if (!lowerLeaves.has(t.trim().toLowerCase())) return false;
  }
  return true;
}

/**
 * Si `regionCsv` es exactamente todas las hojas de un país o de una región del árbol Kennedys,
 * devuelve una etiqueta corta (país o región). Si no, null.
 */
export function inferWideLocationSelectionLabel(regionCsv: string): string | null {
  const tokens = regionCsv.split(',').map((s) => s.trim()).filter(Boolean);
  if (tokens.length < 2) return null;
  for (const group of KENNEDYS_LOCATION_FILTER_TREE) {
    const countryLeaves = collectLeafLocationsForCountry(group);
    if (sameLeafSet(tokens, countryLeaves)) return group.country;
    for (const reg of group.regions || []) {
      const regLeaves = collectLeafLocationsForRegion(group, reg);
      if (sameLeafSet(tokens, regLeaves)) return reg;
    }
  }
  return null;
}

/** Lista larga sin mapeo al árbol: pocas entradas con " · ", si no recuento. */
function compactCommaLocationList(regionCsv: string): string {
  const parts = regionCsv.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(' · ');
  return `${parts.length} destinations`;
}

type Props = {
  id?: string;
  options: LocationCountryGroup[];
  loading?: boolean;
  /** Texto del trigger cuando no hay selección */
  placeholder?: string;
  /** Clases del input trigger */
  triggerClassName?: string;
  /** Clases del panel */
  panelClassName?: string;
  value: LocationTreeSelection;
  onChange: (next: LocationTreeSelection) => void;
  onClear?: () => void;
  /** Etiqueta mostrada en el input (si no se pasa, se calcula desde value) */
  displayLabel?: string;
  disabled?: boolean;
  /**
   * Si false: oculta la capa de Área y solo permite seleccionar País/Región.
   * Útil para forms que solo necesitan `region` (sin `area`).
   */
  areaEnabled?: boolean;
  /** Varias hojas a la vez; emite `selectedLeaves` en cada cambio */
  multiSelect?: boolean;
  /** Si false: no se cierra el panel al elegir (cerrar con ref `close()` o el trigger) */
  closeOnSelect?: boolean;
  /** Si false: clic fuera no cierra (p. ej. hasta «Check availability») */
  closeOnOutsideClick?: boolean;
  /** 'editorial': panel con la estética del real estate (tinta + neutros cálidos); el resto de secciones usa 'default'. */
  variant?: 'default' | 'editorial';
};

export function buildLocationTreeLabel(sel: LocationTreeSelection): string {
  const { selectedCountry, regionValue, area, scope, displayRegion, selectedLeaves } = sel;
  const rv = (regionValue || '').trim();
  const isAllRegionsInCountry = !!selectedCountry && rv.includes(',');
  if (!selectedCountry && !rv && !area && !(selectedLeaves && selectedLeaves.length)) return '';

  const normalizeCountryName = (c: string) => {
    const t = (c || '').trim();
    if (!t) return '';
    if (t.toUpperCase() === 'GR') return 'Greece';
    return t;
  };

  if (selectedLeaves && selectedLeaves.length > 0) {
    if (selectedLeaves.length === 1) return selectedLeaves[0];
    const csv = selectedLeaves.join(',');
    const inferred = inferWideLocationSelectionLabel(csv);
    if (inferred) {
      const isKnownCountry = KENNEDYS_LOCATION_FILTER_TREE.some((g) => g.country === inferred);
      if (isKnownCountry) return normalizeCountryName(inferred);
      return inferred;
    }
    return compactCommaLocationList(csv);
  }

  // UX minimalista: si hay área seleccionada, mostrar SOLO el área.
  if (area) return area;

  if (scope === 'country' && selectedCountry) return normalizeCountryName(selectedCountry);

  if (scope === 'region' && displayRegion) return displayRegion;

  // Compat: país completo antiguo (regionValue = regiones separadas por coma).
  if (selectedCountry && isAllRegionsInCountry) return normalizeCountryName(selectedCountry);

  // Varias localidades en CSV (p. ej. sin scope tras navegación): inferir país/región o resumen corto.
  if (rv.includes(',')) {
    const inferred = inferWideLocationSelectionLabel(rv);
    if (inferred) {
      const isKnownCountry = KENNEDYS_LOCATION_FILTER_TREE.some((g) => g.country === inferred);
      if (isKnownCountry) return normalizeCountryName(inferred);
      return inferred;
    }
    return compactCommaLocationList(rv);
  }

  if (rv) return rv;

  // Solo país sin región.
  return normalizeCountryName(selectedCountry);
}

/**
 * Etiquetas sueltas para chips (una por destino). Si la selección equivale a todo un país/región del árbol,
 * devuelve un solo elemento como el label resumido.
 */
export function locationSelectionDisplayTags(sel: LocationTreeSelection): string[] {
  const { selectedCountry, regionValue, area, scope, displayRegion, selectedLeaves } = sel;
  const rv = (regionValue || '').trim();
  const isAllRegionsInCountry = !!selectedCountry && rv.includes(',');

  const normalizeCountryName = (c: string) => {
    const t = (c || '').trim();
    if (!t) return '';
    if (t.toUpperCase() === 'GR') return 'Greece';
    return t;
  };

  if (!selectedCountry && !rv && !area && !(selectedLeaves && selectedLeaves.length)) return [];

  if (selectedLeaves && selectedLeaves.length > 0) {
    if (selectedLeaves.length === 1) return [selectedLeaves[0]];
    const csv = selectedLeaves.join(',');
    const inferred = inferWideLocationSelectionLabel(csv);
    if (inferred) {
      const isKnownCountry = KENNEDYS_LOCATION_FILTER_TREE.some((g) => g.country === inferred);
      return [isKnownCountry ? normalizeCountryName(inferred) : inferred];
    }
    return selectedLeaves.map((s) => s.trim()).filter(Boolean);
  }

  if (area) return [area];

  if (scope === 'country' && selectedCountry) return [normalizeCountryName(selectedCountry)];

  if (scope === 'region' && displayRegion) return [displayRegion];

  if (selectedCountry && isAllRegionsInCountry) return [normalizeCountryName(selectedCountry)];

  if (rv.includes(',')) {
    const inferred = inferWideLocationSelectionLabel(rv);
    if (inferred) {
      const isKnownCountry = KENNEDYS_LOCATION_FILTER_TREE.some((g) => g.country === inferred);
      return [isKnownCountry ? normalizeCountryName(inferred) : inferred];
    }
    return rv.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (rv) return [rv];

  const c = normalizeCountryName(selectedCountry);
  return c ? [c] : [];
}

/**
 * Dropdown jerárquico País → Región (negrita, sin checkbox) → Área (checkbox).
 * País: checkbox «todo el país» + nombre + chevron. Al expandir un país se abren sus regiones.
 */
export const LocationTreeDropdown = forwardRef<LocationTreeDropdownHandle, Props>(function LocationTreeDropdown(
  {
    id,
    options,
    loading = false,
    placeholder = 'Select location',
    triggerClassName = '',
    panelClassName = '',
    value,
    onChange,
    onClear,
    displayLabel,
    disabled = false,
    areaEnabled = true,
    multiSelect = false,
    closeOnSelect = true,
    closeOnOutsideClick = true,
    variant = 'default',
  },
  ref,
) {
  // Backend a veces entrega abreviaturas como "GR" para "Greece".
  // Normalizamos para que el filtro se comporte como 1 sola región.
  const normalizeRegionName = (r: string) => {
    const t = (r || '').trim()
    if (!t) return ''
    if (t.toUpperCase() === 'GR') return 'Greece'
    return t
  }

  const normalizeCountryName = (c: string) => {
    const t = (c || '').trim()
    if (!t) return ''
    if (t.toUpperCase() === 'GR') return 'Greece'
    return t
  }

  const mergedOptions = useMemo<LocationCountryGroup[]>(() => {
    const map = new Map<
      string,
      {
        country: string
        regions: Set<string>
        areasByRegion: Record<string, Set<string>>
        subAreasByArea: Record<string, Set<string>>
        subSubAreasBySubArea: Record<string, Set<string>>
        subSubSubAreasBySubSubArea: Record<string, Set<string>>
      }
    >()

    ;(options || []).forEach((opt) => {
      const countryNorm = normalizeCountryName(opt.country)
      if (!countryNorm) return

      const existing =
        map.get(countryNorm) ??
        (() => {
          const init = {
            country: countryNorm,
            regions: new Set<string>(),
            areasByRegion: {} as Record<string, Set<string>>,
            subAreasByArea: {} as Record<string, Set<string>>,
            subSubAreasBySubArea: {} as Record<string, Set<string>>,
            subSubSubAreasBySubSubArea: {} as Record<string, Set<string>>,
          }
          map.set(countryNorm, init)
          return init
        })()

      ;(opt.regions || []).forEach((r) => {
        const rn = normalizeRegionName(r)
        if (rn) existing.regions.add(rn)
      })

      if (opt.areasByRegion) {
        Object.entries(opt.areasByRegion).forEach(([regionKey, areasArr]) => {
          const rk = normalizeRegionName(regionKey)
          if (!rk) return
          if (!existing.areasByRegion[rk]) existing.areasByRegion[rk] = new Set<string>()
          ;(areasArr || []).forEach((a) => {
            const av = (a || '').trim()
            if (av) existing.areasByRegion[rk].add(av)
          })
        })
      }

      if (opt.subAreasByArea) {
        Object.entries(opt.subAreasByArea).forEach(([areaKey, subsArr]) => {
          const ak = (areaKey || '').trim()
          if (!ak) return
          if (!existing.subAreasByArea[ak]) existing.subAreasByArea[ak] = new Set<string>()
          ;(subsArr || []).forEach((s) => {
            const sv = (s || '').trim()
            if (sv) existing.subAreasByArea[ak].add(sv)
          })
        })
      }

      if (opt.subSubAreasBySubArea) {
        Object.entries(opt.subSubAreasBySubArea).forEach(([subAreaKey, subsubArr]) => {
          const sak = (subAreaKey || '').trim()
          if (!sak) return
          if (!existing.subSubAreasBySubArea[sak]) existing.subSubAreasBySubArea[sak] = new Set<string>()
          ;(subsubArr || []).forEach((ss) => {
            const ssv = (ss || '').trim()
            if (ssv) existing.subSubAreasBySubArea[sak].add(ssv)
          })
        })
      }

      if (opt.subSubSubAreasBySubSubArea) {
        Object.entries(opt.subSubSubAreasBySubSubArea).forEach(([subSubAreaKey, subsubsubArr]) => {
          const ssak = (subSubAreaKey || '').trim()
          if (!ssak) return
          if (!existing.subSubSubAreasBySubSubArea[ssak]) existing.subSubSubAreasBySubSubArea[ssak] = new Set<string>()
          ;(subsubsubArr || []).forEach((sss) => {
            const sssv = (sss || '').trim()
            if (sssv) existing.subSubSubAreasBySubSubArea[ssak].add(sssv)
          })
        })
      }
    })

    return Array.from(map.values()).map((v) => ({
      country: v.country,
      regions: Array.from(v.regions),
      areasByRegion: Object.fromEntries(
        Object.entries(v.areasByRegion).map(([rk, set]) => [rk, Array.from(set)])
      ),
      subAreasByArea: Object.fromEntries(
        Object.entries(v.subAreasByArea).map(([ak, set]) => [ak, Array.from(set)])
      ),
      subSubAreasBySubArea: Object.fromEntries(
        Object.entries(v.subSubAreasBySubArea).map(([sak, set]) => [sak, Array.from(set)])
      ),
      subSubSubAreasBySubSubArea: Object.fromEntries(
        Object.entries(v.subSubSubAreasBySubSubArea).map(([ssak, set]) => [ssak, Array.from(set)])
      ),
    }))
  }, [options])

  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  /** Editorial variant on phones: the picker opens as a full-screen modal (like the filters panel) instead of a dropdown. */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedSubAreas, setExpandedSubAreas] = useState<Set<string>>(new Set());
  const [expandedSubSubAreas, setExpandedSubSubAreas] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const prevOpenRef = useRef(false);
  const prevMergedLenRef = useRef(0);

  /** Al abrir el panel (o cuando llegan opciones tras loading), todo el árbol visible por defecto. */
  useEffect(() => {
    const mergedLen = mergedOptions.length;
    const justOpened = open && !prevOpenRef.current;
    const optionsJustAppeared =
      open && prevMergedLenRef.current === 0 && mergedLen > 0;

    if (open && (justOpened || optionsJustAppeared)) {
      const nextCountries = new Set(mergedOptions.map((g) => g.country));
      const nextRegions = new Set<string>();
      if (areaEnabled) {
        for (const g of mergedOptions) {
          for (const r of g.regions || []) {
            nextRegions.add(`${g.country}::${r}`);
          }
        }
      }
      setExpandedCountries(nextCountries);
      setExpandedRegions(nextRegions);
    }

    prevOpenRef.current = open;
    prevMergedLenRef.current = mergedLen;
  }, [open, mergedOptions, areaEnabled]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!open) setSearchQuery('');
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [open]);

  const searchLower = searchQuery.trim().toLowerCase();

  const filteredForSearch = useMemo<LocationCountryGroup[]>(() => {
    if (!searchLower) return mergedOptions;
    return mergedOptions
      .map((group) => {
        if (group.country.toLowerCase().includes(searchLower)) return group;
        const filteredRegions = (group.regions || []).filter((region) => {
          const regionDisplay = normalizeRegionName(region);
          if (regionDisplay.toLowerCase().includes(searchLower)) return true;
          const areas = group.areasByRegion?.[region] ?? group.areasByRegion?.[regionDisplay] ?? [];
          return areas.some((a) => a.toLowerCase().includes(searchLower));
        });
        if (filteredRegions.length === 0) return null;
        return { ...group, regions: filteredRegions };
      })
      .filter(Boolean) as LocationCountryGroup[];
  }, [mergedOptions, searchLower]);

  // Auto-expand all matches when search is active
  useEffect(() => {
    if (!searchLower || !open) return;
    setExpandedCountries(new Set(filteredForSearch.map((g) => g.country)));
    const nextRegions = new Set<string>();
    for (const g of filteredForSearch) {
      for (const r of g.regions || []) {
        nextRegions.add(`${g.country}::${r}`);
      }
    }
    setExpandedRegions(nextRegions);
  }, [searchLower, filteredForSearch, open]);

  const label = displayLabel ?? buildLocationTreeLabel(value);
  const displayTags = useMemo(
    () => (multiSelect ? locationSelectionDisplayTags(value) : []),
    [multiSelect, value],
  );

  useImperativeHandle(ref, () => ({
    close: () => {
      setOpen(false);
      setExpandedRegions(new Set());
      setExpandedAreas(new Set());
      setExpandedSubAreas(new Set());
      setExpandedSubSubAreas(new Set());
    },
  }));

  const finishSelecting = () => {
    if (closeOnSelect) {
      setOpen(false);
      setExpandedRegions(new Set());
      setExpandedAreas(new Set());
      setExpandedSubAreas(new Set());
      setExpandedSubSubAreas(new Set());
    }
  };

  const emitMultiLeaves = (leaves: string[]) => {
    const uniq = Array.from(new Set(leaves.map((l) => l.trim()).filter(Boolean)));
    onChange({
      selectedCountry: '',
      regionValue: uniq.join(','),
      area: '',
      scope: undefined,
      displayRegion: undefined,
      selectedLeaves: uniq,
    });
    finishSelecting();
  };

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (modalRef.current?.contains(target)) return;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
        setExpandedRegions(new Set());
        setExpandedAreas(new Set());
        setExpandedSubAreas(new Set());
        setExpandedSubSubAreas(new Set());
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, closeOnOutsideClick]);

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) {
        next.delete(country);
      } else {
        next.add(country);
        if (areaEnabled) {
          const group = mergedOptions.find((g) => g.country === country);
          setExpandedRegions((regPrev) => {
            const regNext = new Set(regPrev);
            (group?.regions || []).forEach((r) => regNext.add(`${country}::${r}`));
            return regNext;
          });
        }
      }
      return next;
    });
  };

  const toggleRegion = (key: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleArea = (key: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSubArea = (key: string) => {
    setExpandedSubAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSubSubArea = (key: string) => {
    setExpandedSubSubAreas((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectCountryAllRegions = (countryGroup: LocationCountryGroup) => {
    if (multiSelect) {
      const countryLeaves = collectLeafLocationsForCountry(countryGroup);
      const current = leafArrayFromValue(value);
      const set = leafSetFromArray(current);
      const allIn = countryLeaves.length > 0 && countryLeaves.every((l) => hasLeaf(set, l));
      let next: string[];
      if (allIn) {
        const rm = new Set(countryLeaves.map(leafTok));
        next = current.filter((l) => !rm.has(leafTok(l)));
      } else {
        next = Array.from(new Set([...current, ...countryLeaves].map((l) => l.trim()).filter(Boolean)));
      }
      emitMultiLeaves(next);
      return;
    }
    const leaves = collectLeafLocationsForCountry(countryGroup);
    onChange({
      selectedCountry: normalizeCountryName(countryGroup.country),
      regionValue: leaves.join(','),
      area: '',
      scope: 'country',
      displayRegion: undefined,
    });
    finishSelecting();
  };

  /** Solo esta región (un token en API), p. ej. «Cyclades» — no expande islas. */
  const selectRegionSingle = (country: string, region: string) => {
    const cNorm = normalizeCountryName(country);
    const normRegion = normalizeRegionName(region);
    if (multiSelect) {
      const countryGroup = mergedOptions.find((g) => g.country === cNorm);
      const leaf =
        countryGroup && collectLeafLocationsForRegion(countryGroup, region).length > 0
          ? collectLeafLocationsForRegion(countryGroup, region)[0]
          : normRegion;
      const current = leafArrayFromValue(value);
      const set = leafSetFromArray(current);
      if (hasLeaf(set, leaf)) {
        emitMultiLeaves(current.filter((l) => leafTok(l) !== leafTok(leaf)));
      } else {
        emitMultiLeaves([...current, leaf]);
      }
      return;
    }
    onChange({
      selectedCountry: cNorm,
      regionValue: normRegion,
      area: '',
      scope: 'region',
      displayRegion: normRegion,
    });
    finishSelecting();
  };

  /** Todas las localidades hoja bajo la región (CSV), p. ej. islas del Cyclades. */
  const selectRegionAllLeaves = (country: string, region: string) => {
    const cNorm = normalizeCountryName(country);
    const normRegion = normalizeRegionName(region);
    const countryGroup = mergedOptions.find((g) => g.country === cNorm);
    if (!countryGroup) return;
    if (multiSelect) {
      const regLeaves = collectLeafLocationsForRegion(countryGroup, region);
      const current = leafArrayFromValue(value);
      const set = leafSetFromArray(current);
      const allIn = regLeaves.length > 0 && regLeaves.every((l) => hasLeaf(set, l));
      let next: string[];
      if (allIn) {
        const rm = new Set(regLeaves.map(leafTok));
        next = current.filter((l) => !rm.has(leafTok(l)));
      } else {
        next = Array.from(new Set([...current, ...regLeaves].map((l) => l.trim()).filter(Boolean)));
      }
      emitMultiLeaves(next);
      return;
    }
    const leaves = collectLeafLocationsForRegion(countryGroup, region);
    onChange({
      selectedCountry: cNorm,
      regionValue: Array.from(new Set(leaves)).join(','),
      area: '',
      scope: 'region',
      displayRegion: normRegion,
    });
    finishSelecting();
  };

  const selectRegion = (country: string, region: string, areaVal: string) => {
    const cNorm = normalizeCountryName(country);
    const normRegion = normalizeRegionName(region);

    if (multiSelect && areaVal) {
      const current = leafArrayFromValue(value);
      const set = leafSetFromArray(current);
      if (hasLeaf(set, areaVal)) {
        emitMultiLeaves(current.filter((l) => leafTok(l) !== leafTok(areaVal)));
      } else {
        emitMultiLeaves([...current, areaVal]);
      }
      return;
    }

    if (!areaVal && !areaEnabled) {
      if (multiSelect) {
        const current = leafArrayFromValue(value);
        const set = leafSetFromArray(current);
        if (hasLeaf(set, normRegion)) {
          emitMultiLeaves(current.filter((l) => leafTok(l) !== leafTok(normRegion)));
        } else {
          emitMultiLeaves([...current, normRegion]);
        }
        return;
      }
      onChange({
        selectedCountry: cNorm,
        regionValue: normRegion,
        area: '',
        scope: undefined,
        displayRegion: undefined,
      });
      finishSelecting();
      return;
    }

    // regionValue va vacío acá (no el label de región sintético del árbol, p. ej. "Mainland Greece"):
    // ese label no existe como valor real en ningún registro, y mandarlo junto con `area` hacía que
    // el filtro combinado (region AND area) no matchee nada — `area` solo ya alcanza para filtrar.
    onChange({
      selectedCountry: cNorm,
      regionValue: '',
      area: areaVal,
      scope: undefined,
      displayRegion: undefined,
    });
    finishSelecting();
  };

  /** Sub-área dentro de una mega area (p. ej. "Golf" dentro de "Glyfada"): manda el par área+sub-área. */
  const selectSubArea = (country: string, region: string, parentArea: string, subArea: string) => {
    if (multiSelect) {
      selectRegion(country, region, subArea);
      return;
    }
    const cNorm = normalizeCountryName(country);
    onChange({
      selectedCountry: cNorm,
      regionValue: subArea,
      area: parentArea,
      scope: undefined,
      displayRegion: undefined,
    });
    finishSelecting();
  };

  const handleClear = () => {
    onChange({
      selectedCountry: '',
      regionValue: '',
      area: '',
      scope: undefined,
      displayRegion: undefined,
      ...(multiSelect ? { selectedLeaves: [] } : {}),
    });
    onClear?.();
    finishSelecting();
  };

  const empty = useMemo(() => !options || options.length === 0, [options]);

  const normalizedSelectionCountry = normalizeCountryName(value.selectedCountry);
  const currentLeafSet = useMemo(() => leafSetFromArray(leafArrayFromValue(value)), [value]);

  const isCountryFullySelected = (country: string) =>
    value.scope === 'country' && normalizedSelectionCountry === country;

  const isCountryFullySelectedMulti = (countryGroup: LocationCountryGroup) => {
    const leaves = collectLeafLocationsForCountry(countryGroup);
    return leaves.length > 0 && leaves.every((l) => hasLeaf(currentLeafSet, l));
  };

  const isCountrySomeSelectedMulti = (countryGroup: LocationCountryGroup) => {
    const leaves = collectLeafLocationsForCountry(countryGroup);
    const some = leaves.some((l) => hasLeaf(currentLeafSet, l));
    const all = isCountryFullySelectedMulti(countryGroup);
    return some && !all;
  };

  const isFullRegionLeavesSelected = (countryGroup: LocationCountryGroup, regionRaw: string) => {
    if (multiSelect) {
      const leaves = collectLeafLocationsForRegion(countryGroup, regionRaw);
      return leaves.length > 0 && leaves.every((l) => hasLeaf(currentLeafSet, l));
    }
    if (value.area) return false;
    const leaves = collectLeafLocationsForRegion(countryGroup, regionRaw);
    if (leaves.length < 2) return false;
    const tokens = value.regionValue.split(',').map((s) => s.trim()).filter(Boolean);
    return sameLeafSet(tokens, leaves);
  };

  const isAreaRowSelected = (regionRaw: string, areaName: string) => {
    if (multiSelect) return hasLeaf(currentLeafSet, areaName);
    // Sin regionValue: así queda una sub-área activa (regionValue = sub-área) sin marcar
    // también la fila de la mega area como seleccionada.
    return !value.regionValue?.trim() && value.area === areaName;
  };

  const isSubAreaRowSelected = (parentArea: string, subAreaName: string) => {
    if (multiSelect) return hasLeaf(currentLeafSet, subAreaName);
    return value.area === parentArea && value.regionValue === subAreaName;
  };

  const isRegionOnlyLeafSelected = (countryGroup: LocationCountryGroup, regionRaw: string) => {
    if (multiSelect) {
      const leaves = collectLeafLocationsForRegion(countryGroup, regionRaw);
      if (leaves.length !== 1) return false;
      return hasLeaf(currentLeafSet, leaves[0]);
    }
    const regionDisplay = normalizeRegionName(regionRaw);
    return (
      !value.area &&
      normalizeRegionName(value.regionValue) === regionDisplay &&
      normalizedSelectionCountry === countryGroup.country
    );
  };

  const editorial = variant === 'editorial';
  const hov = editorial ? 'hover:bg-[#F7F5F0]' : 'hover:bg-[#F0F3F5]';
  const hovIcon = editorial ? 'hover:bg-[#ECE7DE]' : 'hover:bg-[#EEF2F6]';
  const checkboxClass =
    'h-4 w-4 shrink-0 cursor-pointer rounded-none border border-[#172338] text-[#172338] accent-[#172338] focus:ring-2 focus:ring-[#172338]/20 focus:ring-offset-0';

  const modalMode = editorial && isMobile;

  const panelBody = (
    <>
          {loading ? (
            <div className="p-4 text-center text-sm font-haas text-[#506A70]">Loading...</div>
          ) : empty ? (
            <div className="p-4 text-center text-sm font-haas text-[#506A70]">No locations available</div>
          ) : (
            <>
              <div className={`${editorial ? 'relative border-b border-[#E2E8EB]' : 'px-3 py-2 border-b border-[#E8EDF0]'} sticky top-0 bg-white z-10`}>
                {editorial && (
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#506A70]" strokeWidth={1.5} aria-hidden />
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={editorial ? 'Search destination' : 'Search location...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={
                    editorial
                      ? 'w-full h-12 pl-11 pr-4 text-[13px] font-haas font-light tracking-wide text-[#172338] bg-transparent border-0 shadow-none ring-0 focus:ring-0 focus:outline-none focus-visible:outline-none placeholder:text-[#9BA8AF]'
                      : 'w-full h-8 px-3 text-sm font-haas text-[#172338] border border-[#D1D5DB] focus:outline-none focus:border-[#172338] placeholder:text-[#9BA8AF]'
                  }
                />
              </div>
              {!searchLower && (
                <button
                  type="button"
                  className={`w-full px-4 py-2.5 text-left font-haas ${hov} ${
                    editorial ? 'text-[11px] uppercase tracking-[0.2em] text-[#506A70]' : 'text-sm text-[#506A70]'
                  }`}
                  onClick={handleClear}
                >
                  All locations
                </button>
              )}
              {filteredForSearch.length === 0 && (
                <div className="p-4 text-center text-sm font-haas text-[#506A70]">No results</div>
              )}
              {filteredForSearch.map((countryGroup) => {
                const expanded = expandedCountries.has(countryGroup.country);
                const countryLabel = normalizeCountryName(countryGroup.country);
                return (
                  <div key={countryGroup.country} className={`border-b last:border-b-0 ${editorial ? 'border-[#E2E8EB]' : 'border-[#E8EDF0]'}`}>
                    <div className={`flex items-center gap-2 px-4 ${editorial ? 'py-3 bg-[#F7F5F0]/60' : 'py-2.5'} ${hov}`}>
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={multiSelect ? isCountryFullySelectedMulti(countryGroup) : isCountryFullySelected(countryGroup.country)}
                        ref={(el) => {
                          if (el && multiSelect) {
                            el.indeterminate = isCountrySomeSelectedMulti(countryGroup);
                          }
                        }}
                        aria-label={`Select all locations in ${countryLabel}`}
                        onChange={() => {
                          if (multiSelect) {
                            selectCountryAllRegions(countryGroup);
                            return;
                          }
                          if (isCountryFullySelected(countryGroup.country)) {
                            handleClear();
                          } else {
                            selectCountryAllRegions(countryGroup);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        className={`min-w-0 flex-1 text-left font-haas text-[#172338] ${
                          editorial ? 'text-[11px] font-normal uppercase tracking-[0.2em]' : 'text-sm font-normal'
                        }`}
                        onClick={() => toggleCountry(countryGroup.country)}
                      >
                        <span className="truncate">{countryLabel}</span>
                      </button>
                      <button
                        type="button"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center text-[#172338] ${hovIcon} rounded`}
                        aria-expanded={expanded}
                        aria-label={expanded ? `Collapse ${countryLabel}` : `Expand ${countryLabel}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCountry(countryGroup.country);
                        }}
                      >
                        {expanded ? (
                          <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>

                    {expanded && (
                      <div className="bg-white pb-1">
                        {(countryGroup.regions || []).map((region) => {
                          const regionKey = `${countryGroup.country}::${region}`;
                          if (!areaEnabled) {
                            return (
                              <label
                                key={regionKey}
                                className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 pl-8 ${hov}`}
                              >
                                <input
                                  type="checkbox"
                                  className={checkboxClass}
                                  checked={
                                    multiSelect
                                      ? hasLeaf(currentLeafSet, normalizeRegionName(region))
                                      : !value.area &&
                                        normalizeRegionName(value.regionValue) === normalizeRegionName(region) &&
                                        normalizedSelectionCountry === countryGroup.country
                                  }
                                  onChange={() => selectRegion(countryGroup.country, region, '')}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className={`text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                  {normalizeRegionName(region)}
                                </span>
                              </label>
                            );
                          }

                          const regionDisplay = normalizeRegionName(region);
                          const areasForRegion =
                            countryGroup.areasByRegion?.[region] ||
                            countryGroup.areasByRegion?.[regionDisplay] ||
                            [];

                          // Region with no sub-areas: same visual structure as an expandable
                          // region header (spacer + w-8 icon area + text) but with a checkbox
                          // in the icon slot — no expand, no duplicate item inside.
                          if (areasForRegion.length === 0) {
                            return (
                              <label
                                key={regionKey}
                                className={`flex cursor-pointer items-center gap-1 pl-2 pr-2 ${hov}`}
                              >
                                <div className="w-4 shrink-0" aria-hidden />
                                <div className="flex h-9 w-8 shrink-0 items-center justify-center">
                                  <input
                                    type="checkbox"
                                    className={checkboxClass}
                                    checked={isRegionOnlyLeafSelected(countryGroup, region)}
                                    onChange={() => selectRegionSingle(countryGroup.country, region)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="min-w-0 flex-1 py-2 text-left text-sm font-haas font-semibold text-[#172338]">
                                  {regionDisplay}
                                </div>
                              </label>
                            );
                          }

                          const regOpen = expandedRegions.has(regionKey);
                          return (
                            <div key={regionKey}>
                              <div className="flex items-center gap-1 pl-2 pr-2">
                                <div className="w-4 shrink-0" aria-hidden />
                                <button
                                  type="button"
                                  className={`flex h-9 w-8 shrink-0 items-center justify-center text-[#172338] ${hovIcon} rounded`}
                                  aria-expanded={regOpen}
                                  aria-label={regOpen ? `Collapse ${regionDisplay}` : `Expand ${regionDisplay}`}
                                  onClick={() => toggleRegion(regionKey)}
                                >
                                  {regOpen ? (
                                    <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                                  )}
                                </button>
                                <div className="min-w-0 flex-1 py-2 text-left text-sm font-haas font-semibold text-[#172338]">
                                  {regionDisplay}
                                </div>
                              </div>
                              {regOpen && (
                                <div className="bg-white">
                                  {areasForRegion
                                    .filter(
                                      (a) =>
                                        !searchLower ||
                                        a.toLowerCase().includes(searchLower) ||
                                        (countryGroup.subAreasByArea?.[a] ?? []).some(
                                          (s) =>
                                            s.toLowerCase().includes(searchLower) ||
                                            (countryGroup.subSubAreasBySubArea?.[s] ?? []).some(
                                              (ss) =>
                                                ss.toLowerCase().includes(searchLower) ||
                                                (countryGroup.subSubSubAreasBySubSubArea?.[ss] ?? []).some((sss) =>
                                                  sss.toLowerCase().includes(searchLower),
                                                ),
                                            ),
                                        ),
                                    )
                                    .map((a) => {
                                      const subAreas = countryGroup.subAreasByArea?.[a] ?? [];
                                      if (subAreas.length === 0) {
                                        return (
                                          <label
                                            key={`${regionKey}-${a}`}
                                            className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 pl-12 ${hov}`}
                                          >
                                            <input
                                              type="checkbox"
                                              className={checkboxClass}
                                              checked={isAreaRowSelected(region, a)}
                                              onChange={() => selectRegion(countryGroup.country, region, a)}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className={`text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>{a}</span>
                                          </label>
                                        );
                                      }

                                      const areaKey = `${regionKey}::${a}`;
                                      const areaOpen = expandedAreas.has(areaKey);
                                      return (
                                        <div key={areaKey}>
                                          <div className={`flex items-center gap-2 pl-12 pr-2 ${hov}`}>
                                            <input
                                              type="checkbox"
                                              className={checkboxClass}
                                              checked={isAreaRowSelected(region, a)}
                                              onChange={() => selectRegion(countryGroup.country, region, a)}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                              type="button"
                                              className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left"
                                              aria-expanded={areaOpen}
                                              aria-label={areaOpen ? `Collapse ${a}` : `Expand ${a}`}
                                              onClick={() => toggleArea(areaKey)}
                                            >
                                              <span className={`truncate text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                {a}
                                              </span>
                                              {areaOpen ? (
                                                <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                              )}
                                            </button>
                                          </div>
                                          {areaOpen && (
                                            <div className="bg-white">
                                              {subAreas
                                                .filter(
                                                  (s) =>
                                                    !searchLower ||
                                                    s.toLowerCase().includes(searchLower) ||
                                                    (countryGroup.subSubAreasBySubArea?.[s] ?? []).some(
                                                      (ss) =>
                                                        ss.toLowerCase().includes(searchLower) ||
                                                        (countryGroup.subSubSubAreasBySubSubArea?.[ss] ?? []).some(
                                                          (sss) => sss.toLowerCase().includes(searchLower),
                                                        ),
                                                    ),
                                                )
                                                .map((s) => {
                                                  const subSubAreas = countryGroup.subSubAreasBySubArea?.[s] ?? [];
                                                  if (subSubAreas.length === 0) {
                                                    return (
                                                      <label
                                                        key={`${areaKey}-${s}`}
                                                        className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 pl-20 ${hov}`}
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          className={checkboxClass}
                                                          checked={isSubAreaRowSelected(a, s)}
                                                          onChange={() => selectSubArea(countryGroup.country, region, a, s)}
                                                          onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <span className={`text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                          {s}
                                                        </span>
                                                      </label>
                                                    );
                                                  }

                                                  const subAreaKey = `${areaKey}::${s}`;
                                                  const subAreaOpen = expandedSubAreas.has(subAreaKey);
                                                  return (
                                                    <div key={subAreaKey}>
                                                      <div className={`flex items-center gap-2 pl-20 pr-2 ${hov}`}>
                                                        <input
                                                          type="checkbox"
                                                          className={checkboxClass}
                                                          checked={isSubAreaRowSelected(a, s)}
                                                          onChange={() => selectSubArea(countryGroup.country, region, a, s)}
                                                          onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <button
                                                          type="button"
                                                          className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left"
                                                          aria-expanded={subAreaOpen}
                                                          aria-label={subAreaOpen ? `Collapse ${s}` : `Expand ${s}`}
                                                          onClick={() => toggleSubArea(subAreaKey)}
                                                        >
                                                          <span className={`truncate text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                            {s}
                                                          </span>
                                                          {subAreaOpen ? (
                                                            <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                                          ) : (
                                                            <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                                          )}
                                                        </button>
                                                      </div>
                                                      {subAreaOpen && (
                                                        <div className="bg-white">
                                                          {subSubAreas
                                                            .filter(
                                                              (ss) =>
                                                                !searchLower ||
                                                                ss.toLowerCase().includes(searchLower) ||
                                                                (countryGroup.subSubSubAreasBySubSubArea?.[ss] ?? []).some(
                                                                  (sss) => sss.toLowerCase().includes(searchLower),
                                                                ),
                                                            )
                                                            .map((ss) => {
                                                              const subSubSubAreas =
                                                                countryGroup.subSubSubAreasBySubSubArea?.[ss] ?? [];
                                                              if (subSubSubAreas.length === 0) {
                                                                return (
                                                                  <label
                                                                    key={`${subAreaKey}-${ss}`}
                                                                    className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 pl-28 ${hov}`}
                                                                  >
                                                                    <input
                                                                      type="checkbox"
                                                                      className={checkboxClass}
                                                                      checked={isSubAreaRowSelected(s, ss)}
                                                                      onChange={() =>
                                                                        selectSubArea(countryGroup.country, region, s, ss)
                                                                      }
                                                                      onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <span className={`text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                                      {ss}
                                                                    </span>
                                                                  </label>
                                                                );
                                                              }

                                                              const subSubAreaKey = `${subAreaKey}::${ss}`;
                                                              const subSubAreaOpen = expandedSubSubAreas.has(subSubAreaKey);
                                                              return (
                                                                <div key={subSubAreaKey}>
                                                                  <div className={`flex items-center gap-2 pl-28 pr-2 ${hov}`}>
                                                                    <input
                                                                      type="checkbox"
                                                                      className={checkboxClass}
                                                                      checked={isSubAreaRowSelected(s, ss)}
                                                                      onChange={() =>
                                                                        selectSubArea(countryGroup.country, region, s, ss)
                                                                      }
                                                                      onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <button
                                                                      type="button"
                                                                      className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left"
                                                                      aria-expanded={subSubAreaOpen}
                                                                      aria-label={
                                                                        subSubAreaOpen ? `Collapse ${ss}` : `Expand ${ss}`
                                                                      }
                                                                      onClick={() => toggleSubSubArea(subSubAreaKey)}
                                                                    >
                                                                      <span className={`truncate text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                                        {ss}
                                                                      </span>
                                                                      {subSubAreaOpen ? (
                                                                        <ChevronDown
                                                                          className="h-4 w-4 shrink-0"
                                                                          strokeWidth={1.5}
                                                                        />
                                                                      ) : (
                                                                        <ChevronRight
                                                                          className="h-4 w-4 shrink-0"
                                                                          strokeWidth={1.5}
                                                                        />
                                                                      )}
                                                                    </button>
                                                                  </div>
                                                                  {subSubAreaOpen && (
                                                                    <div className="bg-white">
                                                                      {subSubSubAreas
                                                                        .filter(
                                                                          (sss) =>
                                                                            !searchLower ||
                                                                            sss.toLowerCase().includes(searchLower),
                                                                        )
                                                                        .map((sss) => (
                                                                          <label
                                                                            key={`${subSubAreaKey}-${sss}`}
                                                                            className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 pl-36 ${hov}`}
                                                                          >
                                                                            <input
                                                                              type="checkbox"
                                                                              className={checkboxClass}
                                                                              checked={isSubAreaRowSelected(ss, sss)}
                                                                              onChange={() =>
                                                                                selectSubArea(
                                                                                  countryGroup.country,
                                                                                  region,
                                                                                  ss,
                                                                                  sss,
                                                                                )
                                                                              }
                                                                              onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <span className={`text-sm font-haas ${editorial ? 'font-light' : 'font-normal'} text-[#172338]`}>
                                                                              {sss}
                                                                            </span>
                                                                          </label>
                                                                        ))}
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              );
                                                            })}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
    </>
  );

  // Lock page scroll behind the modal while it is open.
  useEffect(() => {
    if (!(modalMode && open)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalMode, open]);

  return (
    <div className="relative w-full min-w-0" ref={rootRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`w-full relative flex items-center disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
      >
        <span
          className={`min-w-0 flex-1 text-left pr-10 ${
            multiSelect && displayTags.length === 1
              ? 'flex flex-wrap gap-1.5 items-center content-center max-h-[4.5rem] overflow-y-auto py-0.5'
              : ''
          }`}
        >
          {multiSelect && displayTags.length > 1 ? (
            <span className="block truncate font-haas font-thin text-[#506A70]">
              Selected areas ({displayTags.length})
            </span>
          ) : multiSelect && displayTags.length === 1 ? (
            <span className="inline-flex max-w-full shrink-0 items-center rounded-full bg-[#F0F3F5] px-2 py-0.5 text-xs font-haas font-thin text-[#506A70]">
              <span className="truncate">{displayTags[0]}</span>
            </span>
          ) : (
            <span className="block truncate">{label?.trim() ? label : placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 shrink-0 h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open &&
        (modalMode ? (
          createPortal(
            <div ref={modalRef} className="fixed inset-0 z-[10000] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Select location">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-gtsuper-ds font-light text-gray-900">Location</h2>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 transition-colors hover:bg-gray-100" aria-label="Close">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" role="listbox">
                {panelBody}
              </div>
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={handleClear} className="text-sm font-haas text-gray-600 underline transition-colors hover:text-gray-800">
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 bg-[#172338] px-6 py-3 font-haas font-medium text-white transition-colors hover:bg-[#0f1a1f]"
                  >
                    Done
                    <span className="text-lg">›</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        ) : (
        <div
          className={`absolute z-50 overflow-y-auto bg-white ${
            editorial
              ? 'w-[calc(100%+80px)] mt-2 max-h-[26rem] min-w-[18rem] border border-[#172338]/15 shadow-[0_28px_60px_-28px_rgba(23,35,56,0.4)]'
              : 'w-full mt-1 max-h-80 border border-[#D1D5DB] shadow-xl'
          } ${panelClassName}`}
          role="listbox"
        >
          {panelBody}
        </div>
        ))}
    </div>
  );
});

LocationTreeDropdown.displayName = 'LocationTreeDropdown';
