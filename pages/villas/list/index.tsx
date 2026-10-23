import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight, ChevronDown, SlidersHorizontal, Heart, Star, MapPin, Calendar, X, Globe } from 'lucide-react'
import {
    LocationTreeDropdown,
    type LocationTreeSelection,
    type LocationTreeDropdownHandle,
    buildLocationTreeLabel,
    locationSelectionDisplayTags,
} from '@/components/custom/LocationTreeDropdown'
import Navbar from '@/components/custom/Navbar'
import { useCollapseOnScroll } from '@/hooks/useCollapseOnScroll'
import Footer from '@/components/custom/footerNew'
import {
    VillaFilterOverlay,
    type VillaFilterOverlayApplyPayload,
    VILLA_FILTER_VIEW_OPTIONS,
    VILLA_FILTER_INCLUDED_SERVICES,
} from '@/components/custom/VillaFilterOverlay'
import VillasListMapPanel from '@/components/custom/VillasListMapPanel'
import { fetchProperties, resolveMediaUrl, formatNightlyPriceLabel, getPriceFromCurrentDate, heroImageDirectUrl, normalizePropertiesResponse, getPropertyPriceCurrencySymbol } from '@/lib/utils'
import { getAllProperties, getProperty } from '@/lib/api/properties'
import { MANAGED_WE_MANAGE_VILLA_AGENT_IDS } from '@/lib/weManageManagedVillas'
import { KENNEDYS_LOCATION_FILTER_TREE, expandLocationArea, filterTreeByAvailableRegions } from '@/lib/kennedysLocationFilterTree'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { useAuth } from '@/src/contexts/AuthContext'
import { buildRentalDetailPath } from '@/lib/rentalRoute'
import { addDays, format } from 'date-fns'
import { parseStayDateFlexFromQuery, stayDateFlexShortLabel } from '@/lib/stayDateFlex'
import { VillaStayDateCalendarPanel } from '@/components/custom/VillaStayDateCalendarPanel'
import { toLocalDateKey, parseYmdLocal } from '@/lib/villaStayCalendar'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getVillaLocationMeta } from '@/lib/seo/locationMeta'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { formatPoolsJacuzziSpecLine } from '@/lib/propertyPoolCounts'
import { getPromoPageBySlug } from '@/lib/api/promoPages'

/** Tope del slider de precio en filtros (30.000+); mismo criterio que API/chips. */
const FILTER_PRICE_SLIDER_MAX = 30000

/**
 * Noches de estancia: [check-in, check-out) en días calendario locales (el día de checkout no cuenta como noche).
 * Rangos: igual que lib/utils — solo se excluye `is_available === false`, no se exige `=== true` (null/undefined cuentan como disponibles).
 */
function isPropertyAvailableInDateRange(property: any, checkInDate: Date, checkOutDate: Date): boolean {
    const availabilityRanges = property?.availabilityRanges;
    const blockedRaw = property?.availabilityDates;
    const blockedSet = new Set<string>();
    if (Array.isArray(blockedRaw)) {
        blockedRaw.forEach((d: unknown) => {
            const s = String(d ?? '')
                .trim()
                .slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) blockedSet.add(s);
        });
    }

    const stayStart = new Date(checkInDate);
    stayStart.setHours(0, 0, 0, 0);
    const checkoutCal = new Date(checkOutDate);
    checkoutCal.setHours(0, 0, 0, 0);

    if (checkoutCal <= stayStart) {
        return false;
    }

    const requestedDates: string[] = [];
    const step = new Date(stayStart);
    while (step < checkoutCal) {
        requestedDates.push(toLocalDateKey(step));
        step.setDate(step.getDate() + 1);
    }

    if (requestedDates.length === 0) {
        return false;
    }

    for (const dateStr of requestedDates) {
        if (blockedSet.has(dateStr)) {
            return false;
        }
    }

    if (!Array.isArray(availabilityRanges) || availabilityRanges.length === 0) {
        // Rentals con iCal / property_availability_dates sin rangos legacy en listado
        return true;
    }

    for (const dateStr of requestedDates) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const checkDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        let isDateAvailable = false;

        for (const range of availabilityRanges) {
            if (range?.is_available === false || range?.isAvailable === false) {
                continue;
            }

            const fromRaw = range?.from;
            const toRaw = range?.to;
            if (fromRaw == null || toRaw == null) continue;
            
            // Use explicit date components to avoid timezone issues
            const start = new Date(range.from);
            const startYear = start.getFullYear();
            const startMonth = start.getMonth();
            const startDay = start.getDate();
            const rangeStart = new Date(startYear, startMonth, startDay, 0, 0, 0, 0);
            
            const end = new Date(range.to);
            const endYear = end.getFullYear();
            const endMonth = end.getMonth();
            const endDay = end.getDate();
            const rangeEnd = new Date(endYear, endMonth, endDay, 23, 59, 59, 999);
            
            // Verificar si la fecha está dentro del rango
            if (checkDate >= rangeStart && checkDate <= rangeEnd) {
                const disabledRaw = range.disabled_dates ?? range.disabledDates;
                const disabledDates = Array.isArray(disabledRaw)
                    ? disabledRaw.map((d: string | Date) => {
                        if (d instanceof Date) {
                            // Use explicit date components
                            const dYear = d.getFullYear();
                            const dMonth = d.getMonth();
                            const dDay = d.getDate();
                            return `${dYear}-${String(dMonth + 1).padStart(2, '0')}-${String(dDay).padStart(2, '0')}`;
                        }
                        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                        const parsed = new Date(d);
                        if (!isNaN(parsed.getTime())) {
                            const pYear = parsed.getFullYear();
                            const pMonth = parsed.getMonth();
                            const pDay = parsed.getDate();
                            return `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
                        }
                        return null;
                    }).filter((d: string | null): d is string => d !== null)
                    : [];
                
                if (!disabledDates.includes(dateStr)) {
                    isDateAvailable = true;
                    break; // Esta fecha está disponible, pasar a la siguiente
                }
            }
        }
        
        // Si alguna fecha no está disponible, la propiedad no está disponible
        if (!isDateAvailable) {
            return false;
        }
    }
    
    // Todas las fechas están disponibles
    return true;
}

/** Huéspedes en cards/listado: classification (max/ideal) y fallback a `property.guests` */
function getVillaGuestDisplay(villa: any): string | number {
    const c = villa?.classification;
    const maxP = c?.maxPersons;
    const ideal = c?.idealPersons;
    const positive = [maxP, ideal].find(
        (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
    );
    if (positive !== undefined) return positive;
    if (typeof maxP === 'number' && Number.isFinite(maxP)) return maxP;
    if (typeof ideal === 'number' && Number.isFinite(ideal)) return ideal;
    const raw = villa?.guests;
    if (raw == null || raw === '') return 'N/A';
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    const digits = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    if (!Number.isNaN(digits) && digits > 0) return digits;
    const s = String(raw).trim();
    return s || 'N/A';
}

function parseStarsValue(property: any): number {
    const raw = property?.stars ?? property?.classification?.stars ?? property?.starRating ?? null;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    const parsed = parseInt(String(raw ?? '').replace(/[^\d]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function isManagedVilla(property: any): boolean {
    return Boolean(
        property?.exclusiveManagement ||
            property?.exclusive_management ||
            property?.isExclusiveManagement ||
            property?.isManagedByKennedys ||
            property?.managedByKennedys ||
            property?.management === 'kennedys' ||
            property?.management === 'exclusive'
    );
}

function applyMykonosPrioritySort(input: any[]): any[] {
    const starPriority: Record<number, number> = { 6: 0, 7: 1, 5: 2 };
    return [...input].sort((a, b) => {
        const aManaged = isManagedVilla(a) ? 0 : 1;
        const bManaged = isManagedVilla(b) ? 0 : 1;
        if (aManaged !== bManaged) return aManaged - bManaged;

        const aStars = parseStarsValue(a);
        const bStars = parseStarsValue(b);
        const aStarPriority = starPriority[aStars] ?? 9;
        const bStarPriority = starPriority[bStars] ?? 9;
        if (aStarPriority !== bStarPriority) return aStarPriority - bStarPriority;

        return aStars - bStars;
    });
}

const KennedysVillasList = () => {
    const router = useRouter()
    const [showFilters, setShowFilters] = useState(false)
    const [cmsSeoMeta, setCmsSeoMeta] = useState<{ title?: string | null; description?: string | null; imageUrl?: string | null }>({})
    useEffect(() => {
        let mounted = true
        fetchPageByKeyServer('villas-list').then((row) => {
            if (!mounted) return
            setCmsSeoMeta({ title: row?.metaTitle || null, description: row?.metaDescription || null, imageUrl: row?.metaImageUrl || null })
        })
        return () => { mounted = false }
    }, [])

    /** Aplicados al buscar (API + chips); el dropdown edita el picker hasta «Check availability». */
    const [location, setLocation] = useState('')
    const [area, setArea] = useState('')
    const [pickerLocation, setPickerLocation] = useState('')
    const [pickerArea, setPickerArea] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')

    const [budget, setBudget] = useState('')
    const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc' | 'newest'>('default')
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
    const sortDropdownRef = useRef<HTMLDivElement | null>(null)
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [showMap, setShowMap] = useState(false)
    const searchSectionRef = useRef<HTMLDivElement | null>(null)
    const [searchSectionHeight, setSearchSectionHeight] = useState(0)
    const [navbarHeight, setNavbarHeight] = useState(0)
    const handleNavbarHeightChange = useCallback((h: number) => setNavbarHeight(h), [])
    const { collapsed: searchCollapsed, toggle: toggleSearchCollapsed } = useCollapseOnScroll()
    const [villas, setVillas] = useState<any[]>([])
    const [filteredVillas, setFilteredVillas] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const datePickerRef = useRef<HTMLDivElement | null>(null)
    const locationDropdownRef = useRef<LocationTreeDropdownHandle>(null)
    const [dateFlexDays, setDateFlexDays] = useState(0)
    const [activeProperty, setActiveProperty] = useState<any | null>(null)
    const [filtersInitialized, setFiltersInitialized] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState('')
    const [locationTreeScope, setLocationTreeScope] = useState<'country' | 'region' | undefined>(undefined)
    const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState('')
    const { isAuthenticated } = useAuth()
    const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes()
    const ITEMS_PER_PAGE = 12
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCountFromApi, setTotalCountFromApi] = useState(0)
    const [priceSliderCeiling, setPriceSliderCeiling] = useState(30000)
    const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false)
    useEffect(() => { if (searchCollapsed) setMobileSearchExpanded(false) }, [searchCollapsed])
    // Dropdowns inside the inputs row must not be clipped once open; clip only while it animates / is closed.
    const [searchOverflowVisible, setSearchOverflowVisible] = useState(false)
    useEffect(() => {
        if (!mobileSearchExpanded) { setSearchOverflowVisible(false); return }
        const t = setTimeout(() => setSearchOverflowVisible(true), 320)
        return () => clearTimeout(t)
    }, [mobileSearchExpanded])
    const [availableRegions, setAvailableRegions] = useState<string[]>([])
    const [pinnedManagedVillas, setPinnedManagedVillas] = useState<any[]>([])

    // Promo Page scoping: `?promo=<slug>` restricts this same page (filters, map, etc.) to a curated id set.
    const promoSlug = typeof router.query.promo === 'string' ? router.query.promo : undefined
    const [promoPage, setPromoPage] = useState<any | null>(null)
    const [promoResolving, setPromoResolving] = useState(false)
    useEffect(() => {
        if (!promoSlug) {
            setPromoPage(null)
            setPromoResolving(false)
            return
        }
        let cancelled = false
        setPromoResolving(true)
        getPromoPageBySlug(promoSlug).then((res: any) => {
            if (cancelled) return
            setPromoPage(res?.success && res?.data && res.data.published !== false ? res.data : null)
        }).catch(() => {
            if (!cancelled) setPromoPage(null)
        }).finally(() => {
            if (!cancelled) setPromoResolving(false)
        })
        return () => { cancelled = true }
    }, [promoSlug])

    const [filterState, setFilterState] = useState<{
        location: string;
        area: string;
        priceRange: { min: number | null; max: number | null };
        bedroomsMin: number | null;
        bedroomsMax: number | null;
        bedroomsExact: number | null;
        bathrooms: number;
        outdoor: string[];
        guestsMin: number | null;
        stars: number[];
        viewTokens: string[];
        includedServices: string[];
        kidsFriendly: 'any' | 'yes' | 'no';
        locationFeatures: string[];
        accessibilityFeatures: string[];
    }>({
        location: '',
        area: '',
        priceRange: {
            min: null,
            max: null
        },
        bedroomsMin: null,
        bedroomsMax: null,
        bedroomsExact: null,
        bathrooms: 1,
        outdoor: [],
        guestsMin: null,
        stars: [],
        viewTokens: [],
        includedServices: [],
        kidsFriendly: 'any',
        locationFeatures: [],
        accessibilityFeatures: [],
    })

    useEffect(() => {
        if (!isDatePickerOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDatePickerOpen]);

    useEffect(() => {
        if (!sortDropdownOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sortDropdownOpen]);

    const PLACEHOLDER_IMAGE = '/images/villa-detail@2x.png';

    /** Imagen principal de la villa (primary o primera; URL ya resuelta en normalización o se resuelve aquí si es relativa). */
    const getVillaImageUrl = (villa: any): string => {
        const images = villa?.images;
        if (!Array.isArray(images) || images.length === 0) return PLACEHOLDER_IMAGE;
        const primary = images.find((img: any) => {
            const p = img?.isPrimary ?? img?.is_primary ?? img?.primary;
            return p === true || p === 'true' || p === 1;
        });
        const entry = primary ?? images[0];
        const raw = typeof entry === 'string' ? entry : (entry?.urlImage ?? entry?.url ?? entry?.image ?? '');
        if (!raw || String(raw).trim() === '') return PLACEHOLDER_IMAGE;
        if (/^https?:\/\//i.test(raw)) return raw;
        const resolved = resolveMediaUrl(raw);
        return resolved && resolved.trim() !== '' ? resolved : PLACEHOLDER_IMAGE;
    };

    const extractCoordinatesFromUrl = (url?: string | null) => {
        if (!url) return null;

        // swap:true = !1d es lng y !2d es lat en el formato embed de Google Maps
        const patterns: Array<{ re: RegExp; swap?: boolean }> = [
            { re: /@([-\d.]+),([-\d.]+)/ },                          // @lat,lng
            { re: /maps\/place\/[^/]+\/@([-\d.]+),([-\d.]+)/ },      // maps/place/@lat,lng
            { re: /maps\/@([-\d.]+),([-\d.]+)/ },                     // maps/@lat,lng
            { re: /!3d([-\d.]+)!4d([-\d.]+)/ },                      // !3d=lat !4d=lng
            { re: /!1d([-\d.]+)!2d([-\d.]+)/, swap: true },          // !1d=lng !2d=lat
            { re: /[?&]q=([-\d.]+),([-\d.]+)/ },                      // ?q=lat,lng
            { re: /maps\?q=([-\d.]+),([-\d.]+)/ },                    // maps?q=lat,lng
            { re: /ll=([-\d.]+),([-\d.]+)/ },                         // ll=lat,lng
            { re: /center=([-\d.]+),([-\d.]+)/ },                     // center=lat,lng
            { re: /place\/[^/]+\/([-\d.]+),([-\d.]+)/ },              // place/.../lat,lng
        ];

        for (const { re, swap } of patterns) {
            const match = url.match(re);
            if (match && match.length >= 3) {
                const a = parseFloat(match[1]);
                const b = parseFloat(match[2]);
                const lat = swap ? b : a;
                const lng = swap ? a : b;
                if (!Number.isNaN(lat) && !Number.isNaN(lng) &&
                    lat >= -90 && lat <= 90 &&
                    lng >= -180 && lng <= 180 &&
                    Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001) {
                    return { lat, lng };
                }
            }
        }

        return null;
    };

    /** List filters / URL: region labels (Tulum, St Barts, …) often absent on each record — merge into currency detection. */
    const priceCurrencyHints = useMemo(
        () => [
            selectedCountry,
            locationTreeDisplayRegion,
            location,
            area,
            pickerLocation,
            pickerArea,
            filterState.location,
            filterState.area,
            typeof router.query?.region === 'string'
                ? router.query.region
                : Array.isArray(router.query?.region)
                  ? router.query.region.join(',')
                  : '',
        ],
        [
            selectedCountry,
            locationTreeDisplayRegion,
            location,
            area,
            pickerLocation,
            pickerArea,
            filterState.location,
            filterState.area,
            router.query?.region,
        ]
    )

    // Función para obtener el precio a mostrar (prioridad: availabilityRanges fecha actual > price_per_night > Price on request)
    const getDisplayPrice = (villa: any): string => {
        if (villa?.price_visibility === false) return 'Price on request';

        const currentDatePrice = getPriceFromCurrentDate(villa);

        if (currentDatePrice !== null && currentDatePrice > 0) {
            const formatted = formatNightlyPriceLabel(
                currentDatePrice,
                getPropertyPriceCurrencySymbol(villa, priceCurrencyHints)
            );
            return formatted;
        }

        const pricePerNight = villa.price_per_night;
        const pricePerNightNum = pricePerNight !== null && pricePerNight !== undefined && pricePerNight !== ''
            ? Number(pricePerNight)
            : null;

        if (pricePerNightNum !== null && pricePerNightNum > 0) {
            const formatted = formatNightlyPriceLabel(
                pricePerNightNum,
                getPropertyPriceCurrencySymbol(villa, priceCurrencyHints)
            );
            return formatted;
        }

        return 'Price on request';
    }

    const formatDisplayDate = (value: string) => {
        if (!value) return '';
        const parsed = parseYmdLocal(value);
        if (!parsed) return value;
        return format(parsed, 'MMM d');
    };

    const dateRangeLabel = checkIn && checkOut
        ? `${formatDisplayDate(checkIn)} – ${formatDisplayDate(checkOut)}${dateFlexDays > 0 ? ` · ${stayDateFlexShortLabel(dateFlexDays)}` : ''}`
        : checkIn
            ? `${formatDisplayDate(checkIn)} -`
            : 'Select dates';

    const hasUncommittedLocation = pickerLocation !== location || pickerArea !== area;

    const parseBudgetRange = (value: string) => {
        if (!value) {
            return { min: undefined, max: undefined };
        }

        const normalized = value.replace(/\$/g, '');

        if (normalized.includes('-')) {
            const [minStr, maxStr] = normalized.split('-').map(part => part.replace(/,/g, '').trim());
            const min = Number(minStr);
            const max = Number(maxStr);
            return {
                min: Number.isFinite(min) ? min : undefined,
                max: Number.isFinite(max) ? max : undefined
            };
        }

        if (normalized.endsWith('+')) {
            const min = Number(normalized.replace('+', '').replace(/,/g, '').trim());
            return {
                min: Number.isFinite(min) ? min : undefined,
                max: undefined
            };
        }

        const single = Number(normalized.replace(/,/g, '').trim());
        return {
            min: Number.isFinite(single) ? single : undefined,
            max: undefined
        };
    };

    const fetchVillas = useCallback(async () => {
        if (!router.isReady || !filtersInitialized) return;
        // Esperar a resolver la Promo Page antes de pegarle al catálogo (evita traer todo sin scope).
        if (promoSlug && !promoPage) return;

        setIsLoading(true);
        setError(null);

        try {
            const effectiveLocation = filterState.location || location;
            const effectiveArea = filterState.area || area;

            const exactBd: number | undefined =
                typeof filterState.bedroomsExact === 'number' &&
                Number.isFinite(filterState.bedroomsExact) &&
                filterState.bedroomsExact > 0
                    ? filterState.bedroomsExact
                    : undefined;

            let minBd: number | undefined =
                exactBd === undefined &&
                typeof filterState.bedroomsMin === 'number' &&
                Number.isFinite(filterState.bedroomsMin) &&
                filterState.bedroomsMin > 1
                    ? filterState.bedroomsMin
                    : undefined;

            let maxBd: number | undefined =
                exactBd === undefined &&
                typeof filterState.bedroomsMax === 'number' &&
                Number.isFinite(filterState.bedroomsMax) &&
                filterState.bedroomsMax > 0
                    ? filterState.bedroomsMax
                    : undefined;

            if (minBd !== undefined && maxBd !== undefined && maxBd < minBd) {
                maxBd = undefined;
            }

            const overlayBathrooms =
                filterState.bathrooms && filterState.bathrooms > 1 ? filterState.bathrooms : null;

            let minPrice: number | undefined = filterState.priceRange?.min ?? undefined;
            let maxPrice: number | undefined = filterState.priceRange?.max ?? undefined;

            if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice <= 0)) {
                minPrice = undefined;
            }

            if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice <= 0)) {
                maxPrice = undefined;
            }

            // Slider «sin tope» = +30.000 — no enviar max artificial a la API
            if (maxPrice !== undefined && maxPrice >= FILTER_PRICE_SLIDER_MAX) {
                maxPrice = undefined;
            }

            if ((minPrice === undefined && maxPrice === undefined) && budget) {
                const parsedBudget = parseBudgetRange(budget);
                minPrice = parsedBudget.min ?? minPrice;
                maxPrice = parsedBudget.max ?? maxPrice;
            }

            // Construir amenities solo desde filterState.outdoor, no desde activeFilters para evitar loops
            const outdoorArray = Array.isArray(filterState.outdoor) ? filterState.outdoor : [];
            const amenities = Array.from(
                new Set(
                    outdoorArray.map(item => String(item).trim()).filter(Boolean) as string[]
                )
            );

            const payload: Record<string, string | number | boolean> = {
                rental: 'true',
                // No forzar category: 'villa' — el backend guarda un category distinto por cada
                // property type (chalet, apartment, house, etc.), así que ese filtro ocultaba
                // toda vacation rental que no fuera type=Villa. rental:'true' ya alcanza.
                // Para mostrar precio real en cards (usa availabilityRanges por fecha actual).
                // Si no pedimos availability, getDisplayPrice cae a price_per_night y muchos registros
                // no lo tienen poblado aunque sí existan rangos con precio en BD.
                includeAvailabilityRanges: true,
            };

            // Una hoja → `area`; varias → `region` como CSV (misma API).
            // Athens Riviera se expande a towns costeros + aliases Vari/Varkiza.
            const leafArea = effectiveArea && String(effectiveArea).trim();
            const locTokens = (effectiveLocation || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (leafArea) {
                const expanded = expandLocationArea(leafArea);
                if (expanded.length > 1) {
                    payload.region = expanded.join(',');
                } else {
                    payload.area = expanded[0];
                }
            } else if (locTokens.length > 1) {
                const allExpanded = Array.from(new Set(locTokens.flatMap(expandLocationArea)));
                payload.region = allExpanded.join(',');
            } else if (locTokens.length === 1) {
                const expanded = expandLocationArea(locTokens[0]);
                if (expanded.length > 1) {
                    payload.region = expanded.join(',');
                } else {
                    payload.area = expanded[0];
                }
            }

            if (exactBd !== undefined) {
                // El backend no aplica bedroomsQuantity/bedroomsCondition para rental=true (villas);
                // minBedrooms+maxBedrooms con el mismo valor sí filtra correctamente y logra el mismo efecto.
                payload.minBedrooms = exactBd;
                payload.maxBedrooms = exactBd;
            }

            if (minBd !== undefined) {
                payload.minBedrooms = minBd;
            }

            if (maxBd !== undefined) {
                payload.maxBedrooms = maxBd;
            }

            if (overlayBathrooms !== null && overlayBathrooms > 1) {
                payload.bathroomsQuantity = overlayBathrooms;
                payload.bathroomsCondition = '>=';
            }

            if (minPrice !== undefined) {
                payload.minPrice = minPrice;
            }

            if (maxPrice !== undefined) {
                payload.maxPrice = maxPrice;
            }


            if (amenities.length > 0) {
                payload.amenities = amenities.join(',');
            }

            if (
                typeof filterState.guestsMin === 'number' &&
                filterState.guestsMin >= 2
            ) {
                payload.guests = filterState.guestsMin;
            }

            if (filterState.stars.length > 0) {
                payload.stars = filterState.stars.join(',');
            }

            if (filterState.viewTokens.length > 0) {
                payload.view = filterState.viewTokens.join(',');
            }

            if (filterState.includedServices.length > 0) {
                payload.includedServices = filterState.includedServices.join(',');
            }

            if (filterState.kidsFriendly === 'yes' || filterState.kidsFriendly === 'no') {
                payload.kidsFriendly = filterState.kidsFriendly;
            }

            if (filterState.locationFeatures.length > 0) {
                payload.locationFeatures = filterState.locationFeatures.join(',');
            }

            if (filterState.accessibilityFeatures && filterState.accessibilityFeatures.length > 0) {
                payload.amenities = [
                    ...(Array.isArray(payload.amenities) ? payload.amenities : payload.amenities ? [payload.amenities] : []),
                    ...filterState.accessibilityFeatures,
                ].join(',');
            }

            if (checkIn && checkOut) {
                payload.dateFrom = checkIn;
                payload.dateTo = checkOut;
                if (dateFlexDays > 0) {
                    payload.dateFlexDays = dateFlexDays;
                }
            }

            // Agregar búsqueda por nombre si está presente en la URL
            const searchQueryFromUrl = router.query.searchQuery as string | undefined;
            if (searchQueryFromUrl && searchQueryFromUrl.trim()) {
                payload.searchQuery = searchQueryFromUrl.trim();
            }

            // Paginación siempre en el backend; el filtro por fechas vive en la API (evita OOM por JSON gigante).
            payload.page = currentPage;
            payload.pageSize = ITEMS_PER_PAGE;

            if (sortOrder === 'asc') {
                payload.orderBy = 'price_per_night'
                payload.orderDir = 'ASC'
            } else if (sortOrder === 'desc') {
                payload.orderBy = 'price_per_night'
                payload.orderDir = 'DESC'
            } else if (sortOrder === 'newest') {
                payload.orderBy = 'createdAt'
                payload.orderDir = 'DESC'
            }

            if (promoSlug && promoPage) {
                const itemIds = Array.isArray(promoPage.itemIds) ? promoPage.itemIds : []
                if (itemIds.length === 0) {
                    setVillas([])
                    setFilteredVillas([])
                    setTotalCountFromApi(0)
                    setIsLoading(false)
                    return
                }
                payload.ids = itemIds.join(',')
                // El set de ids ya fue curado en Loggia (donde se puede seleccionar cualquier
                // propiedad, publicada/deshabilitada o no): no re-exigir category/rental/published/disabled,
                // o un item curado quedaría afuera por defaults pensados para el catálogo público general.
                delete payload.category
                delete payload.rental
                payload.published = 'null'
                payload.includeDisabled = true
            }

            const raw = await getAllProperties(payload);
            const data = (raw as any)?.data;
            const isPaginated = data && typeof data === 'object' && Array.isArray(data.items);
            const properties: any[] = isPaginated
                ? data.items
                : (Array.isArray(data) ? data : normalizePropertiesResponse(raw));
            if (isPaginated && typeof data.total === 'number') {
                setTotalCountFromApi(data.total);
            } else {
                setTotalCountFromApi(Array.isArray(data) ? data.length : (properties?.length ?? 0));
            }

            const normalized = (properties || []).map((property: any) => {
                const coordinates = extractCoordinatesFromUrl(property?.googleMapUrl);
                return {
                    ...property,
                    coordinates,
                    availabilityRanges: Array.isArray(property?.availabilityRanges) ? property.availabilityRanges : [],
                    // Igual que real-estate: resolver URLs de imagen en normalización para que las cards muestren la imagen
                    images: Array.isArray(property?.images)
                        ? property.images.map((img: any) => ({
                            ...img,
                            urlImage: resolveMediaUrl(img?.urlImage || img?.url || img?.image || '') || img?.urlImage || img?.url || '',
                            }))
                        : [],
                };
            });

            // Disponibilidad por fechas: la API filtra por estancia; aquí refinamos rangos múltiples y disabled_dates.
            let filteredByAvailability = normalized;
            if (checkIn && checkOut) {
                const checkInDate = parseYmdLocal(checkIn);
                const checkOutDate = parseYmdLocal(checkOut);
                if (checkInDate && checkOutDate) {
                    checkInDate.setHours(0, 0, 0, 0);
                    checkOutDate.setHours(0, 0, 0, 0);
                    if (dateFlexDays > 0) {
                        filteredByAvailability = normalized.filter((property: any) => {
                            for (let d = -dateFlexDays; d <= dateFlexDays; d++) {
                                const s = addDays(checkInDate, d);
                                const e = addDays(checkOutDate, d);
                                if (isPropertyAvailableInDateRange(property, s, e)) return true;
                            }
                            return false;
                        });
                    } else {
                        filteredByAvailability = normalized.filter((property: any) =>
                            isPropertyAvailableInDateRange(property, checkInDate, checkOutDate)
                        );
                    }
                }
            }

            const selectedAreaText = `${effectiveArea || ''} ${effectiveLocation || ''}`.toLowerCase();
            const isMykonosSearch = selectedAreaText.includes('mykonos');
            const hasSpecificDates = Boolean(checkIn && checkOut);
            const hasSpecificBedrooms = Boolean(minBd) || Boolean(exactBd);

            const baseResults =
                sortOrder !== 'default' && sortOrder !== 'newest'
                    ? filteredByAvailability
                    : isMykonosSearch && !hasSpecificDates && !hasSpecificBedrooms && sortOrder === 'default'
                        ? applyMykonosPrioritySort(filteredByAvailability)
                        : filteredByAvailability;

            const sortedResults = searchQueryFromUrl
                ? [...baseResults].sort((a, b) => {
                    const sq = searchQueryFromUrl.trim().toLowerCase();
                    const at = (a.title ?? '').toLowerCase();
                    const bt = (b.title ?? '').toLowerCase();
                    const rank = (t: string) => t === sq ? 0 : t.startsWith(sq) ? 1 : 2;
                    return rank(at) - rank(bt);
                  })
                : baseResults;

            const maxNightlyPrice = sortedResults.reduce((acc, property) => {
                const byCurrentDate = Number(getPriceFromCurrentDate(property));
                const fallback = Number(property?.price_per_night ?? property?.pricePerNight ?? property?.price ?? 0);
                const candidate = Number.isFinite(byCurrentDate) && byCurrentDate > 0 ? byCurrentDate : fallback;
                return candidate > acc ? candidate : acc;
            }, 0);
            const nextCeiling =
                maxNightlyPrice > 0
                    ? Math.max(10000, Math.ceil(maxNightlyPrice / 5000) * 5000)
                    : 30000;

            setPriceSliderCeiling(nextCeiling);
            setVillas(sortedResults);
            setFilteredVillas(sortedResults);
        } catch (err) {
            console.error('Failed to load villas', err);
            setError('We could not load villas at this time. Please try again later.');
            setVillas([]);
            setFilteredVillas([]);
            setTotalCountFromApi(0);
        } finally {
            setIsLoading(false);
        }
    }, [
        router.isReady,
        filtersInitialized,
        location,
        area,
        budget,
        filterState.location,
        filterState.area,
        filterState.bedroomsMin,
        filterState.bedroomsMax,
        filterState.bedroomsExact,
        filterState.bathrooms,
        filterState.priceRange?.min,
        filterState.priceRange?.max,
        filterState.outdoor,
        filterState.guestsMin,
        filterState.stars,
        filterState.viewTokens,
        filterState.includedServices,
        filterState.kidsFriendly,
        filterState.locationFeatures,
        filterState.accessibilityFeatures,
        checkIn,
        checkOut,
        dateFlexDays,
        currentPage,
        sortOrder,
        promoSlug,
        promoPage
    ]);

    useEffect(() => {
        fetchVillas();
    }, [fetchVillas]);

    useEffect(() => {
        import('@/lib/api/properties').then(({ getFilterOptions }) => {
            getFilterOptions({ rental: true }).then((data: any) => {
                const regions = Array.isArray(data?.data?.regions) ? data.data.regions : []
                setAvailableRegions(regions)
            }).catch(() => {})
        })
    }, [])

    // Fetch managed villas immediately on mount — they'll be pinned at top when no filters are active.
    // Skipped entirely in Promo Page scope: irrelevant there (already excluded from display) and these
    // are 20+ individual requests that only add load while the scoped catalog is loading.
    useEffect(() => {
        if (promoSlug) return
        Promise.allSettled(
            MANAGED_WE_MANAGE_VILLA_AGENT_IDS.map((id) => getProperty(id))
        ).then((results) => {
            const villas: any[] = []
            results.forEach((res) => {
                if (res.status !== 'fulfilled') return
                const raw = res.value as any
                const prop = raw?.data ?? raw
                if (!prop?.id) return
                const coordinates = extractCoordinatesFromUrl(prop?.googleMapUrl)
                villas.push({
                    ...prop,
                    coordinates,
                    availabilityRanges: Array.isArray(prop?.availabilityRanges) ? prop.availabilityRanges : [],
                    images: Array.isArray(prop?.images)
                        ? prop.images.map((img: any) => ({
                            ...img,
                            urlImage: resolveMediaUrl(img?.urlImage || img?.url || img?.image || '') || img?.urlImage || img?.url || '',
                          }))
                        : [],
                })
            })
            setPinnedManagedVillas(villas)
        }).catch(() => {})
    }, [promoSlug])


    const filteredLocationTree = useMemo(
        () => filterTreeByAvailableRegions(KENNEDYS_LOCATION_FILTER_TREE, availableRegions),
        [availableRegions],
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [sortOrder])

    useEffect(() => {
        setCurrentPage(1);
    }, [
        checkIn,
        checkOut,
        dateFlexDays,
        filterState.bedroomsMin,
        filterState.bedroomsMax,
        filterState.bedroomsExact,
        filterState.guestsMin,
        filterState.stars,
        filterState.viewTokens,
        filterState.outdoor,
        filterState.includedServices,
        filterState.kidsFriendly,
        filterState.locationFeatures,
        filterState.priceRange?.min,
        filterState.priceRange?.max,
    ]);

    useEffect(() => {
        if (!router.isReady) return;

        const {
            region: regionParam, // Cambiar location por region
            location: locationParam, // Mantener para compatibilidad hacia atrás
            area: areaParam,
            searchQuery: searchQueryParam, // Búsqueda por nombre
            openFilters,
            checkIn: checkInParam,
            checkOut: checkOutParam,
            dateFrom: dateFromParam,
            dateTo: dateToParam,
            bedrooms: bedroomsParam,
            bedroomsQuantity: bedroomsQuantityParam,
            minBedrooms: minBedroomsParam,
            maxBedrooms: maxBedroomsParam,
            guests: guestsParam,
            stars: starsParam,
            view: viewsParam,
            includedServices: includedServicesParam,
            kidsFriendly: kidsFriendlyParam,
            bathroomsQuantity: bathroomsQuantityParam,
            budget: budgetParam,
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            amenities: amenitiesParam,
            rental: rentalParam
        } = router.query;

        const areaStr = typeof areaParam === 'string' ? areaParam.trim() : '';
        if (areaStr) {
            setArea(areaParam as string);
            setPickerArea(areaParam as string);
            setFilterState((prev) => ({ ...prev, area: areaParam as string, location: '' }));
            setLocation('');
            setPickerLocation('');
        }
        // Priorizar region sobre location para compatibilidad (solo si no hay área en query)
        const effectiveRegionParam = regionParam || locationParam;
        if (!areaStr && typeof effectiveRegionParam === 'string') {
            setLocation(effectiveRegionParam);
            setPickerLocation(effectiveRegionParam);
            setFilterState((prev) => ({ ...prev, location: effectiveRegionParam }));
        }
        // Leer fechas de checkIn/checkOut o dateFrom/dateTo
        const effectiveCheckIn = checkInParam || dateFromParam;
        const effectiveCheckOut = checkOutParam || dateToParam;
        if (typeof effectiveCheckIn === 'string') {
            setCheckIn(effectiveCheckIn);
        }
        if (typeof effectiveCheckOut === 'string') {
            setCheckOut(effectiveCheckOut);
        }

        setDateFlexDays(
            parseStayDateFlexFromQuery({
                dateFlexDays: router.query.dateFlexDays as string | string[] | undefined,
                flexibleDates: router.query.flexibleDates as string | string[] | undefined,
            })
        );
        
        // minBedrooms/maxBedrooms vienen del overlay de filtros (rango "X+").
        // bedroomsQuantity/bedrooms (shortcut, ej. desde el buscador del home) representan
        // una cantidad exacta y alimentan el stepper de la barra, no el rango del overlay.
        const bedroomsShortcut = bedroomsQuantityParam || bedroomsParam;
        const parsedMinFromUrl =
            typeof minBedroomsParam === 'string' ? parseInt(minBedroomsParam, 10) : NaN;
        const parsedExactFromUrl =
            typeof minBedroomsParam !== 'string' && typeof bedroomsShortcut === 'string'
                ? parseInt(bedroomsShortcut, 10)
                : NaN;
        setFilterState((prev) => ({
            ...prev,
            bedroomsMin:
                !Number.isNaN(parsedMinFromUrl) && parsedMinFromUrl > 1 ? parsedMinFromUrl : null,
            bedroomsExact:
                !Number.isNaN(parsedExactFromUrl) && parsedExactFromUrl > 0 ? parsedExactFromUrl : null,
        }));

        if (typeof maxBedroomsParam === 'string') {
            const mx = parseInt(maxBedroomsParam, 10);
            setFilterState((prev) =>
                !Number.isNaN(mx) && mx > 0 ? { ...prev, bedroomsMax: mx } : { ...prev, bedroomsMax: null }
            );
        } else {
            setFilterState((prev) => ({ ...prev, bedroomsMax: null }));
        }

        if (typeof guestsParam === 'string') {
            const g = parseInt(guestsParam, 10);
            if (!Number.isNaN(g) && g >= 2) {
                setFilterState((prev) => ({ ...prev, guestsMin: g }));
            } else {
                setFilterState((prev) => ({ ...prev, guestsMin: null }));
            }
        } else {
            setFilterState((prev) => ({ ...prev, guestsMin: null }));
        }

        if (typeof starsParam === 'string' && starsParam.trim()) {
            const nums = starsParam
                .split(',')
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => Number.isFinite(n) && n > 0);
            setFilterState((prev) => ({ ...prev, stars: nums }));
        } else {
            setFilterState((prev) => ({ ...prev, stars: [] }));
        }

        const viewRaw = typeof viewsParam === 'string' ? viewsParam : '';
        if (viewRaw.trim()) {
            setFilterState((prev) => ({
                ...prev,
                viewTokens: viewRaw.split(',').map((s) => s.trim()).filter(Boolean),
            }));
        } else {
            setFilterState((prev) => ({ ...prev, viewTokens: [] }));
        }

        const incRaw = typeof includedServicesParam === 'string' ? includedServicesParam : '';
        if (incRaw.trim()) {
            setFilterState((prev) => ({
                ...prev,
                includedServices: incRaw.split(',').map((s) => s.trim()).filter(Boolean),
            }));
        } else {
            setFilterState((prev) => ({ ...prev, includedServices: [] }));
        }

        if (typeof kidsFriendlyParam === 'string') {
            const lk = kidsFriendlyParam.trim().toLowerCase();
            if (lk === 'yes' || lk === 'true') {
                setFilterState((prev) => ({ ...prev, kidsFriendly: 'yes' }));
            } else if (lk === 'no' || lk === 'false') {
                setFilterState((prev) => ({ ...prev, kidsFriendly: 'no' }));
            } else {
                setFilterState((prev) => ({ ...prev, kidsFriendly: 'any' }));
            }
        } else {
            setFilterState((prev) => ({ ...prev, kidsFriendly: 'any' }));
        }

        if (typeof bathroomsQuantityParam === 'string') {
            const parsedBaths = parseInt(bathroomsQuantityParam, 10);
            if (!Number.isNaN(parsedBaths) && parsedBaths > 0) {
                setFilterState(prev => ({ ...prev, bathrooms: parsedBaths }));
            }
        } else {
            setFilterState(prev => ({ ...prev, bathrooms: 1 }));
        }
        
        if (typeof budgetParam === 'string') setBudget(budgetParam);
        
        // Leer minPrice y maxPrice
        if (typeof minPriceParam === 'string') {
            const parsedMin = parseFloat(minPriceParam);
            if (!Number.isNaN(parsedMin)) {
                setFilterState((prev: any) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: parsedMin }
                }));
            }
        }
        if (typeof maxPriceParam === 'string') {
            const parsedMax = parseFloat(maxPriceParam);
            if (!Number.isNaN(parsedMax)) {
                setFilterState((prev: any) => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parsedMax }
                }));
            }
        }
        
        if (typeof amenitiesParam === 'string') {
            const amenitiesArray = amenitiesParam.split(',').filter(Boolean);
            setFilterState((prev: any) => ({ ...prev, outdoor: amenitiesArray }));
        } else {
            setFilterState((prev: any) => ({ ...prev, outdoor: [] }));
        }
        
        if (openFilters === 'true') {
            setShowFilters(true);
        }

        setFiltersInitialized(true);
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (activeProperty && !filteredVillas.some((villa) => villa.id === activeProperty.id)) {
            setActiveProperty(null);
        }
    }, [filteredVillas, activeProperty]);

    const handleMarkerSelection = useCallback((property: any | null) => {
        setActiveProperty(property);
    }, []);

    const locationTreeValue = useMemo<LocationTreeSelection>(() => {
        const leaves = pickerArea.trim()
            ? [pickerArea.trim()]
            : pickerLocation.split(',').map((s) => s.trim()).filter(Boolean);
        return {
            selectedCountry,
            regionValue: pickerLocation,
            area: pickerArea,
            scope: locationTreeScope,
            displayRegion: locationTreeDisplayRegion || undefined,
            selectedLeaves: leaves.length > 0 ? leaves : undefined,
        };
    }, [selectedCountry, pickerLocation, pickerArea, locationTreeScope, locationTreeDisplayRegion]);

    const breadcrumbLocationSelection = useMemo<LocationTreeSelection>(() => {
        const leaves = area.trim()
            ? [area.trim()]
            : location.split(',').map((s) => s.trim()).filter(Boolean);
        return {
            selectedCountry,
            regionValue: location,
            area,
            scope: locationTreeScope,
            displayRegion: locationTreeDisplayRegion || undefined,
            selectedLeaves: leaves.length > 0 ? leaves : undefined,
        };
    }, [selectedCountry, location, area, locationTreeScope, locationTreeDisplayRegion]);

    const listingCurrencySymbol = useMemo(() => {
        const sample = filteredVillas.find(Boolean) ?? villas.find(Boolean);
        if (!sample) return '€';
        return getPropertyPriceCurrencySymbol(sample);
    }, [filteredVillas, villas]);

    // Construir activeFilters desde filterState y otros estados (solo cuando cambian los filtros, no en cada render)
    useEffect(() => {
        if (!filtersInitialized) return;

        const urlActiveFilters: string[] = [];
        if (area && area !== 'All') urlActiveFilters.push(area);
        else if (location) {
            urlActiveFilters.push(...locationSelectionDisplayTags(breadcrumbLocationSelection));
        }
        const bdMin = filterState.bedroomsMin;
        const bdMax = filterState.bedroomsMax;
        const bdExact = filterState.bedroomsExact;
        if (bdExact != null && bdExact > 0) {
            urlActiveFilters.push(`Bedrooms: ${bdExact}`);
        }
        if (bdMin != null && bdMin > 1) {
            urlActiveFilters.push(`Bedrooms min ${bdMin}`);
        }
        if (bdMax != null && bdMax > 0) {
            urlActiveFilters.push(`Bedrooms max ${bdMax}`);
        }
        if (filterState.guestsMin != null && filterState.guestsMin >= 2) {
            urlActiveFilters.push(`Guests · ${filterState.guestsMin}+`);
        }
        filterState.stars.forEach((s) => {
            urlActiveFilters.push(`${s}★`);
        });
        filterState.viewTokens.forEach((tok) => {
            const lbl = VILLA_FILTER_VIEW_OPTIONS.find((o) => o.value === tok)?.label ?? tok;
            urlActiveFilters.push(`View: ${lbl}`);
        });
        if (filterState.kidsFriendly === 'yes') {
            urlActiveFilters.push('Kids friendly: Yes');
        } else if (filterState.kidsFriendly === 'no') {
            urlActiveFilters.push('Kids friendly: No');
        }
        filterState.includedServices.forEach((tok) => {
            const lbl = VILLA_FILTER_INCLUDED_SERVICES.find((o) => o.value === tok)?.label ?? tok;
            urlActiveFilters.push(`Service: ${lbl}`);
        });

        if (filterState.bathrooms && filterState.bathrooms > 1) {
            urlActiveFilters.push(`${filterState.bathrooms} Bathrooms`);
        }
        if (filterState.priceRange?.min) urlActiveFilters.push(`Min ${listingCurrencySymbol}${filterState.priceRange.min}`);
        if (filterState.priceRange?.max && filterState.priceRange.max < FILTER_PRICE_SLIDER_MAX) {
            urlActiveFilters.push(`Max ${listingCurrencySymbol}${filterState.priceRange.max}`);
        }
        if (filterState.outdoor && Array.isArray(filterState.outdoor) && filterState.outdoor.length > 0) {
            urlActiveFilters.push(...filterState.outdoor);
        }
        if (filterState.locationFeatures && filterState.locationFeatures.length > 0) {
            filterState.locationFeatures.forEach((f) => urlActiveFilters.push(`Location: ${f}`));
        }
        if (filterState.accessibilityFeatures && filterState.accessibilityFeatures.length > 0) {
            filterState.accessibilityFeatures.forEach((f) => urlActiveFilters.push(`Accessibility: ${f}`));
        }
        const sq = typeof router.query.searchQuery === 'string' ? router.query.searchQuery.trim() : '';
        if (sq) urlActiveFilters.push(`Search: ${sq}`);

        const filtersString = JSON.stringify(urlActiveFilters.sort());
        const currentFiltersString = JSON.stringify([...activeFilters].sort());
        if (filtersString !== currentFiltersString) {
            setActiveFilters(urlActiveFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filtersInitialized,
        breadcrumbLocationSelection,
        area,
        location,
        filterState.bathrooms,
        filterState.bedroomsMin,
        filterState.bedroomsMax,
        filterState.bedroomsExact,
        filterState.guestsMin,
        filterState.stars,
        filterState.viewTokens,
        filterState.kidsFriendly,
        filterState.includedServices,
        filterState.locationFeatures,
        filterState.accessibilityFeatures,
        filterState.priceRange?.min,
        filterState.priceRange?.max,
        filterState.outdoor,
        listingCurrencySymbol,
        router.query.searchQuery,
    ]);

    const onLocationTreeChange = useCallback((next: LocationTreeSelection) => {
        setSelectedCountry(next.selectedCountry);
        setLocationTreeScope(next.scope);
        setLocationTreeDisplayRegion(next.displayRegion ?? '');
        if (next.selectedLeaves !== undefined) {
            const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)));
            if (uniq.length === 0) {
                setPickerLocation('');
                setPickerArea('');
                return;
            }
            const csv = uniq.join(',');
            setPickerLocation(csv);
            setPickerArea(next.area ?? '');
            return;
        }
        setPickerLocation(next.regionValue);
        setPickerArea(next.area);
    }, []);

    const handleViewPropertyDetails = useCallback((property: any) => {
        if (!property?.id) return;
        window.open(buildRentalDetailPath(property), '_blank', 'noopener,noreferrer');
    }, []);

    const handleCardClick = (villa: any) => {
        if (!villa) return;
        handleViewPropertyDetails(villa);
    };

    const removeFilter = (filter: string) => {
        setActiveFilters((prev) => {
            const newFilters = prev.filter((f) => f !== filter);
            
            // Actualizar el estado de los filtros cuando se elimina un tag
            const clearLocationSelection = () => {
                setFilterState((prev) => ({ ...prev, location: '', area: '' }))
                setLocation('')
                setArea('')
                setPickerLocation('')
                setPickerArea('')
                setSelectedCountry('')
                setLocationTreeScope(undefined)
                setLocationTreeDisplayRegion('')
            }

            const locTags =
                !area || area === 'All'
                    ? location
                        ? locationSelectionDisplayTags(breadcrumbLocationSelection)
                        : []
                    : [];
            const isLocationAreaChip = !!(area && area !== 'All' && filter === area);
            const isLocationLeafChip =
                !area &&
                !!location &&
                locTags.some((t) => t.toLowerCase() === filter.toLowerCase());

            if (isLocationAreaChip) {
                clearLocationSelection();
            } else if (isLocationLeafChip) {
                const leaves = location.split(',').map((s) => s.trim()).filter(Boolean);
                if (locTags.length <= 1) {
                    clearLocationSelection();
                } else {
                    const nextLeaves = leaves.filter(
                        (l) => l.toLowerCase() !== filter.toLowerCase(),
                    );
                    if (nextLeaves.length === 0) {
                        clearLocationSelection();
                    } else {
                        const csv = nextLeaves.join(',');
                        setLocation(csv);
                        setArea('');
                        setPickerLocation(csv);
                        setPickerArea('');
                        setFilterState((prev) => ({ ...prev, location: csv, area: '' }));
                    }
                }
            } else if (filter.startsWith('Bedrooms: ')) {
                const n = parseInt(filter.slice('Bedrooms: '.length), 10);
                if (!Number.isNaN(n) && filterState.bedroomsExact === n) {
                    setFilterState((prev) => ({ ...prev, bedroomsExact: null }));
                }
            } else if (filter.startsWith('Bedrooms min ')) {
                const n = parseInt(filter.slice('Bedrooms min '.length), 10);
                if (!Number.isNaN(n) && filterState.bedroomsMin === n) {
                    setFilterState((prev) => ({ ...prev, bedroomsMin: null }));
                }
            } else if (filter.startsWith('Bedrooms max ')) {
                const n = parseInt(filter.slice('Bedrooms max '.length), 10);
                if (!Number.isNaN(n) && filterState.bedroomsMax === n) {
                    setFilterState((prev) => ({ ...prev, bedroomsMax: null }));
                }
            } else if (filter.startsWith('Guests · ') && filter.endsWith('+')) {
                const m = filter.match(/^Guests · (\d+)\+$/);
                if (m && parseInt(m[1], 10) === filterState.guestsMin) {
                    setFilterState((prev) => ({ ...prev, guestsMin: null }));
                }
            } else if (/^\d+★$/.test(filter)) {
                const n = parseInt(filter, 10);
                if (!Number.isNaN(n)) {
                    setFilterState((prev) => ({
                        ...prev,
                        stars: prev.stars.filter((s) => s !== n),
                    }));
                }
            } else if (filter.startsWith('View: ')) {
                const lbl = filter.slice('View: '.length).trim();
                const val =
                    VILLA_FILTER_VIEW_OPTIONS.find((o) => o.label === lbl)?.value ??
                    filterState.viewTokens.find((t) => t === lbl);
                if (val) {
                    setFilterState((prev) => ({
                        ...prev,
                        viewTokens: prev.viewTokens.filter((t) => t !== val),
                    }));
                }
            } else if (filter.startsWith('Service: ')) {
                const lbl = filter.slice('Service: '.length).trim();
                const val =
                    VILLA_FILTER_INCLUDED_SERVICES.find((o) => o.label === lbl)?.value ??
                    filterState.includedServices.find((t) => t === lbl);
                if (val) {
                    setFilterState((prev) => ({
                        ...prev,
                        includedServices: prev.includedServices.filter((t) => t !== val),
                    }));
                }
            } else if (filter === 'Kids friendly: Yes' || filter === 'Kids friendly: No') {
                setFilterState((prev) => ({ ...prev, kidsFriendly: 'any' }));
            } else if (filter.includes('Bathrooms')) {
                const bathroomsMatch = filter.match(/(\d+)\s+Bathrooms/)
                if (bathroomsMatch && parseInt(bathroomsMatch[1], 10) === filterState.bathrooms) {
                    setFilterState(prev => ({ ...prev, bathrooms: 1 }))
                }
            } else if (filter.startsWith(`Min ${listingCurrencySymbol}`)) {
                setFilterState(prev => ({ ...prev, priceRange: { ...prev.priceRange, min: null } }))
            } else if (filter.startsWith(`Max ${listingCurrencySymbol}`)) {
                setFilterState(prev => ({ ...prev, priceRange: { ...prev.priceRange, max: null } }))
            } else if (Array.isArray(filterState.outdoor) && (filterState.outdoor as string[]).includes(filter)) {
                setFilterState(prev => {
                    const currentOutdoor = (prev.outdoor as string[]) || [];
                    return {
                        ...prev,
                        outdoor: currentOutdoor.filter(o => o !== filter)
                    };
                })
            } else if (filter.startsWith('Location: ')) {
                const val = filter.slice('Location: '.length).trim();
                setFilterState(prev => ({
                    ...prev,
                    locationFeatures: prev.locationFeatures.filter(f => f !== val),
                }));
            } else if (filter.startsWith('Accessibility: ')) {
                const val = filter.slice('Accessibility: '.length).trim();
                setFilterState(prev => ({
                    ...prev,
                    accessibilityFeatures: prev.accessibilityFeatures.filter(f => f !== val),
                }));
            } else if (filter.startsWith('Search: ')) {
                const nextQuery = { ...router.query }
                delete nextQuery.searchQuery
                router.push({ pathname: '/villas/list', query: nextQuery })
            }

            return newFilters;
        });
        // No llamar fetchVillas aquí: al actualizar location/area/filterState, el useEffect([fetchVillas]) se dispara solo con el estado ya actualizado.
    };

    const handleSearch = (options?: { syncUrl?: boolean }) => {
        const syncUrl = options?.syncUrl ?? false
        const appliedLoc = pickerLocation
        const appliedAr = pickerArea.trim()
        setLocation(appliedLoc)
        setArea(appliedAr)
        setFilterState((prev) => ({ ...prev, location: appliedLoc, area: appliedAr }))

        const searchActiveFilters: string[] = []
        if (appliedAr && appliedAr !== 'All') {
            searchActiveFilters.push(appliedAr);
        } else if (appliedLoc) {
            const appliedSel: LocationTreeSelection = {
                selectedCountry,
                regionValue: appliedLoc,
                area: appliedAr,
                scope: locationTreeScope,
                displayRegion: locationTreeDisplayRegion || undefined,
                selectedLeaves: appliedAr.trim()
                    ? [appliedAr.trim()]
                    : appliedLoc
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
            };
            searchActiveFilters.push(...locationSelectionDisplayTags(appliedSel));
        }
        setActiveFilters(searchActiveFilters)

        if (!syncUrl) return

        const queryParams = new URLSearchParams()
        if (appliedAr) {
            queryParams.set('area', appliedAr)
        } else if (appliedLoc) {
            queryParams.set('region', appliedLoc)
        }
        if (checkIn && checkOut) {
            queryParams.set('checkIn', checkIn)
            queryParams.set('checkOut', checkOut)
            if (dateFlexDays > 0) {
                queryParams.set('dateFlexDays', String(dateFlexDays))
            }
        }
        if (typeof filterState.bedroomsExact === 'number' && filterState.bedroomsExact > 0) {
            queryParams.set('bedroomsQuantity', String(filterState.bedroomsExact))
        } else {
            if (typeof filterState.bedroomsMin === 'number' && filterState.bedroomsMin > 1) {
                queryParams.set('minBedrooms', String(filterState.bedroomsMin))
            }
            if (typeof filterState.bedroomsMax === 'number' && filterState.bedroomsMax > 0) {
                queryParams.set('maxBedrooms', String(filterState.bedroomsMax))
            }
        }
        if (typeof filterState.guestsMin === 'number' && filterState.guestsMin >= 2) {
            queryParams.set('guests', String(filterState.guestsMin))
        }
        if (filterState.stars.length > 0) {
            queryParams.set('stars', filterState.stars.join(','))
        }
        if (filterState.viewTokens.length > 0) {
            queryParams.set('view', filterState.viewTokens.join(','))
        }
        if (filterState.includedServices.length > 0) {
            queryParams.set('includedServices', filterState.includedServices.join(','))
        }
        if (filterState.kidsFriendly === 'yes' || filterState.kidsFriendly === 'no') {
            queryParams.set('kidsFriendly', filterState.kidsFriendly)
        }
        if (filterState.outdoor.length > 0) {
            queryParams.set('amenities', filterState.outdoor.join(','))
        }
        if (budget) queryParams.set('budget', budget)
        if (promoSlug) queryParams.set('promo', promoSlug)

        router.push(`/villas/list?${queryParams.toString()}`)
        locationDropdownRef.current?.close()
        setMobileSearchExpanded(false)
        // La búsqueda la dispara useEffect([fetchVillas]) al actualizar location/area aplicados.
    }

    const handleSearchRef = useRef(handleSearch)
    handleSearchRef.current = handleSearch

    const autoFilterInitRef = useRef(false)
    useEffect(() => {
        if (!router.isReady) return
        if (!autoFilterInitRef.current) { autoFilterInitRef.current = true; return }
        const t = setTimeout(() => { handleSearchRef.current({ syncUrl: false }) }, 500)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickerLocation, pickerArea, router.isReady])

    // Keeps the sticky map panel pinned right below the sticky filters bar, filling the rest of the viewport.
    useEffect(() => {
        const el = searchSectionRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver((entries) => {
            const height = entries[0]?.contentRect.height
            if (typeof height === 'number') setSearchSectionHeight(height)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const handleOpenFilters = () => {
        setShowFilters(true)
    }

    const handleCloseFilters = () => {
        setShowFilters(false)
    }

    const handleApplyFilters = (filters: VillaFilterOverlayApplyPayload) => {
        setFilterState((prev) => ({
            ...prev,
            priceRange: filters.priceRange ?? prev.priceRange,
            bedroomsMin:
                filters.bedroomsMin != null && filters.bedroomsMin > 1 ? filters.bedroomsMin : null,
            bedroomsMax: filters.bedroomsMax ?? null,
            bathrooms: typeof filters.bathrooms === 'number' ? filters.bathrooms : prev.bathrooms,
            outdoor: Array.isArray(filters.outdoor) ? filters.outdoor : prev.outdoor,
            guestsMin:
                filters.guestsMin != null && filters.guestsMin >= 2 ? filters.guestsMin : null,
            stars: Array.isArray(filters.stars) ? [...filters.stars] : prev.stars,
            viewTokens: Array.isArray(filters.viewTokens) ? [...filters.viewTokens] : prev.viewTokens,
            includedServices: Array.isArray(filters.includedServices)
                ? [...filters.includedServices]
                : prev.includedServices,
            kidsFriendly:
                filters.kidsFriendly === 'yes' ||
                filters.kidsFriendly === 'no' ||
                filters.kidsFriendly === 'any'
                    ? filters.kidsFriendly
                    : prev.kidsFriendly,
            locationFeatures: Array.isArray(filters.locationFeatures)
                ? [...filters.locationFeatures]
                : prev.locationFeatures,
            accessibilityFeatures: Array.isArray(filters.accessibilityFeatures)
                ? [...filters.accessibilityFeatures]
                : prev.accessibilityFeatures,
        }))

        if (filters.priceRange?.min != null || filters.priceRange?.max != null) {
            setBudget('')
        }

        if (typeof filters.checkIn === 'string') {
            setCheckIn(filters.checkIn)
        }
        if (typeof filters.checkOut === 'string') {
            setCheckOut(filters.checkOut)
        }
        if (typeof filters.dateFlexDays === 'number' && Number.isFinite(filters.dateFlexDays)) {
            setDateFlexDays(Math.max(0, filters.dateFlexDays))
        }

        setCurrentPage(1)
        setShowFilters(false)
    }

    const totalPages = Math.max(1, Math.ceil(totalCountFromApi / ITEMS_PER_PAGE))

    const pinnedIds = useMemo(
        () => new Set(pinnedManagedVillas.map((v) => String(v.id))),
        [pinnedManagedVillas]
    )

    const paginatedVillas = useMemo(() => {
        const hasActiveFilters = Boolean(
            filterState.location ||
            filterState.area ||
            checkIn ||
            checkOut ||
            filterState.bedroomsMin ||
            filterState.bedroomsMax ||
            filterState.bedroomsExact ||
            router.query.searchQuery ||
            promoSlug
        )
        if (hasActiveFilters || pinnedManagedVillas.length === 0) return filteredVillas
        const rest = filteredVillas.filter((v) => !pinnedIds.has(String(v.id)))
        return [...pinnedManagedVillas, ...rest]
    }, [pinnedManagedVillas, filteredVillas, pinnedIds, filterState.location, filterState.area, checkIn, checkOut, filterState.bedroomsMin, filterState.bedroomsMax, filterState.bedroomsExact, router.query.searchQuery, promoSlug])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            <SeoHead
              title={!location && cmsSeoMeta.title ? cmsSeoMeta.title : getVillaLocationMeta(location).title}
              description={!location && cmsSeoMeta.description ? cmsSeoMeta.description : getVillaLocationMeta(location).description}
              imageUrl={!location ? (cmsSeoMeta.imageUrl || undefined) : undefined}
              canonicalPath={
                location
                  ? `${getSiteUrl()}/villas/list?location=${encodeURIComponent(location.split(',')[0]?.trim() ?? '')}`
                  : '/villas/list'
              }
            />
            <div>
                <div className='h-full px-4 md:px-24'>
                <Navbar textBlack={true} onHeightChange={handleNavbarHeightChange} />

                    <div className="w-full" style={{ paddingTop: navbarHeight + 16 }}>
                        {/* Breadcrumb */}
                        <div className='mt-3 md:mt-5 h-12 md:h-16 bg-[#F0F3F5] flex items-center gap-2 bg-gray-200 text-xs md:text-sm -mx-4 md:-mx-24 px-4 md:px-24'>
                            <a className='underline' href="/">Home</a>
                            <span><ChevronRight className='w-3 h-3' /></span>
                            <a className='underline' href="/villas">Villas</a>
                            <span><ChevronRight className='w-3 h-3' /></span>
                            <span className="font-semibold truncate min-w-0">
                                {buildLocationTreeLabel(breadcrumbLocationSelection) || 'All Locations'}
                            </span>
                        </div>

                        {/* Promo Page header */}
                        {promoPage && (
                            <div className="mt-6">
                                <h1 className="font-gtsuper text-2xl md:text-4xl font-light text-[#172338] mt-2 mb-2">
                                    {promoPage.title}
                                </h1>
                                {promoPage.description && (
                                    <p className="text-sm text-[#506A70] max-w-2xl">
                                        {promoPage.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Search Section */}
                        <div ref={searchSectionRef} className={`${promoPage ? 'mt-4' : 'mt-3 md:mt-8'} pt-3 md:pt-[20px] pb-3 md:pb-5 sticky z-30 bg-white -mx-4 md:-mx-24 px-4 md:px-24`} style={{ top: navbarHeight }}>
                            <div className="mx-auto w-full max-w-[1300px]">
                                {/* Labels row — desktop only */}
                                <div className="hidden md:flex gap-2 text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-0">
                                    <div className="flex-[1.4] min-w-0 px-1">Location</div>
                                    <div className="flex-[1] min-w-0 px-1">Check In / Check Out</div>
                                    <div className="w-[160px] shrink-0 px-1">Bedrooms</div>
                                    <div className="w-[210px] shrink-0 px-1">Sort</div>
                                    <div className="w-[100px] shrink-0"></div>
                                    <div className="w-[160px] shrink-0"></div>
                                </div>

                                {/* Mobile compact search summary */}
                                <div className="md:hidden mb-2">
                                    <button
                                        onClick={() => {
                                            if (searchCollapsed && !mobileSearchExpanded) toggleSearchCollapsed()
                                            setMobileSearchExpanded((prev) => !prev)
                                        }}
                                        className="w-full bg-white border border-[#D1D5DB] px-4 py-3 flex items-center gap-3 text-left"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[#172338] font-haas text-[14px] truncate">
                                                {area || buildLocationTreeLabel(breadcrumbLocationSelection) || 'All destinations'}
                                            </div>
                                            <div className="text-[#506A70] font-haas text-xs mt-0.5">
                                                {checkIn && checkOut ? dateRangeLabel : 'Any dates'}
                                                {filterState.bedroomsExact ? ` · ${filterState.bedroomsExact} bedrooms` : ''}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {activeFilters.length > 0 && (
                                                <span className="bg-[#172338] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-haas font-medium">
                                                    {activeFilters.length}
                                                </span>
                                            )}
                                            <SlidersHorizontal className="w-4 h-4 text-[#506A70]" />
                                            <ChevronRight className={`w-4 h-4 text-[#506A70] transition-transform duration-200 ${mobileSearchExpanded ? 'rotate-90' : ''}`} />
                                        </div>
                                    </button>
                                </div>

                                {/* Inputs row */}
                                <div className={`grid md:block transition-[grid-template-rows,opacity] duration-300 ease-out md:opacity-100 ${mobileSearchExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none md:pointer-events-auto'}`}>
                                <div className={`min-h-0 md:overflow-visible ${searchOverflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
                                <div className="flex flex-col md:flex-row gap-2">
                                    {/* Location (país → región → área) */}
                                    <div className="flex-[1.4] min-w-0">
                                        <div className="md:hidden text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-1">Location</div>
                                        <LocationTreeDropdown
                                            ref={locationDropdownRef}
                                            options={filteredLocationTree}
                                            loading={false}
                                            placeholder="Select location"
                                            triggerClassName="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14"
                                            value={locationTreeValue}
                                            onChange={onLocationTreeChange}
                                            multiSelect
                                            closeOnSelect={false}
                                        />
                                    </div>

                                    {/* Check In / Check Out */}
                                    <div className="flex-[1] min-w-0 relative" ref={datePickerRef}>
                                        <div className="md:hidden text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-1">Check In / Check Out</div>
                                        <button
                                            type="button"
                                            onClick={() => setIsDatePickerOpen((prev) => !prev)}
                                            className="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-4 flex items-center justify-between text-left focus:outline-none"
                                        >
                                            <span
                                                className={`truncate ${dateRangeLabel === 'Select dates' ? 'text-gray-500' : ''}`}
                                            >
                                                {dateRangeLabel}
                                            </span>
                                            <Calendar className="h-4 w-4 text-black shrink-0 ml-2" />
                                        </button>
                                        {isDatePickerOpen && (
                                            <div className="absolute right-0 mt-2 bg-white border border-[#D1D5DB] shadow-xl p-4 w-[280px] z-30">
                                                <VillaStayDateCalendarPanel
                                                    checkIn={checkIn}
                                                    checkOut={checkOut}
                                                    dateFlexDays={dateFlexDays}
                                                    onChange={({ checkIn: nextIn, checkOut: nextOut, dateFlexDays: nextFlex }) => {
                                                        setCheckIn(nextIn);
                                                        setCheckOut(nextOut);
                                                        setDateFlexDays(nextFlex);
                                                    }}
                                                    showDoneButton
                                                    onDone={() => setIsDatePickerOpen(false)}
                                                    onRangeComplete={() => setIsDatePickerOpen(false)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Bedrooms (exact quantity quick filter) */}
                                    <div className="w-full md:w-[160px] shrink-0">
                                        <div className="md:hidden text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-1">Bedrooms</div>
                                        <div className="flex items-center h-[52px] border border-[#D1D5DB]">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFilterState((prev) => {
                                                        if (prev.bedroomsExact == null) return prev;
                                                        const next = prev.bedroomsExact - 1;
                                                        return { ...prev, bedroomsExact: next > 0 ? next : null };
                                                    })
                                                }
                                                className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-r border-[#D1D5DB] text-lg leading-none"
                                            >
                                                −
                                            </button>
                                            <span className="flex-1 text-center font-haas text-[14px] text-[#172338] select-none">
                                                {filterState.bedroomsExact == null ? 'Any' : filterState.bedroomsExact}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFilterState((prev) => ({
                                                        ...prev,
                                                        bedroomsExact: (prev.bedroomsExact ?? 0) + 1,
                                                    }))
                                                }
                                                className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-l border-[#D1D5DB] text-lg leading-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sort dropdown */}
                                    <div className="w-full md:w-[210px] shrink-0 relative" ref={sortDropdownRef}>
                                        <div className="md:hidden text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-1">Sort</div>
                                        <button
                                            type="button"
                                            onClick={() => setSortDropdownOpen((prev) => !prev)}
                                            className="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-4 flex items-center justify-between text-left focus:outline-none"
                                        >
                                            <span>
                                                {sortOrder === 'default' && 'Sort by'}
                                                {sortOrder === 'newest' && 'New Arrivals'}
                                                {sortOrder === 'asc' && 'Price: Low to High'}
                                                {sortOrder === 'desc' && 'Price: High to Low'}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 text-[#172338] shrink-0 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {sortDropdownOpen && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-[#D1D5DB] shadow-lg z-30">
                                                {([
                                                    { value: 'newest', label: 'New Arrivals' },
                                                    { value: 'asc', label: 'Price: Low to High' },
                                                    { value: 'desc', label: 'Price: High to Low' },
                                                ] as const).map(({ value, label }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => { setSortOrder(value); setSortDropdownOpen(false); }}
                                                        className={`w-full px-4 py-3 text-left font-haas text-[14px] hover:bg-[#F0F3F5] transition-colors ${sortOrder === value ? 'text-[#D99330] font-medium' : 'text-[#172338]'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Filters Button */}
                                    <button
                                        onClick={handleOpenFilters}
                                        className="h-[52px] w-full md:w-[100px] shrink-0 bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2"
                                    >
                                        <span className="font-haas text-[#172338] text-[14px]">Filters</span>
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#172338]" />
                                    </button>

                                    {/* Check Availability Button */}
                                    <button
                                        onClick={() => handleSearch({ syncUrl: true })}
                                        className={`h-[52px] w-full md:w-[160px] shrink-0 transition flex items-center justify-center gap-2 ${
                                            hasUncommittedLocation
                                                ? 'bg-[#172338] text-white hover:bg-[#0f1a1f]'
                                                : 'bg-[#7CF5EE] text-[#172338] hover:brightness-95'
                                        }`}
                                    >
                                        <span className="font-haas text-[14px] whitespace-nowrap">
                                            {hasUncommittedLocation ? 'Search' : 'Check availability'}
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                    </button>
                                </div>
                                </div>
                                </div>
                            </div>
                        </div>

                    {/* Villa Listings */}
                    <div className="mt-10 -mx-4 md:-mx-24 px-4 md:px-24 py-10 bg-[#F8F8F8]">
                        <div className="flex justify-center items-start">
                            <div className="w-full max-w-[1300px]">
                                {/* Active Filters tags */}
                                {activeFilters.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap mb-6 px-4 md:px-0">
                                        {activeFilters.map((filter) => (
                                            <div
                                                key={filter}
                                                className="flex items-center gap-2 bg-white border border-[#d1d5db] rounded-full px-3 py-1.5 text-sm font-haas text-[#172338]"
                                            >
                                                <span>{filter}</span>
                                                <button
                                                    onClick={() => removeFilter(filter)}
                                                    className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                                                    aria-label={`Remove ${filter} filter`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Results Count and Show Map */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-6 md:mb-10 px-4 md:px-0">
                                    <p className="text-[#D99330] text-lg">
                                        {isLoading ? (
                                            <span className="inline-block w-32 h-5 bg-[#e5ddd0] rounded animate-pulse" />
                                        ) : `${totalCountFromApi} Villa${totalCountFromApi !== 1 ? 's' : ''} Found`}
                                    </p>
                                    <button
                                        onClick={() => setShowMap(!showMap)}
                                        className={`flex items-center gap-2 px-4 h-9 border font-haas text-[13px] transition ${
                                            showMap
                                                ? 'bg-[#172338] text-white border-[#172338]'
                                                : 'bg-white text-[#172338] border-[#D1D5DB] hover:border-[#172338]'
                                        }`}
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Map view</span>
                                    </button>
                                </div>

                                {/* Skeleton grid */}
                                {(isLoading || promoResolving) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
                                        {Array.from({ length: 9 }).map((_, i) => (
                                            <div key={i} className="bg-white border border-[#e5e7eb] overflow-hidden animate-pulse">
                                                <div className="w-full h-60 bg-gray-200" />
                                                <div className="p-6 space-y-3">
                                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                                    <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {error && (
                                    <div className="mx-4 md:mx-0 mb-6 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {/* Empty state */}
                                {!isLoading && !promoResolving && !error && filteredVillas.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                                        <div className="w-20 h-20 mb-6 rounded-full bg-[#EEF2F6] flex items-center justify-center">
                                            <SlidersHorizontal className="w-8 h-8 text-[#506A70]" />
                                        </div>
                                        <h3 className="font-haas text-[#172338] text-xl font-medium mb-2">
                                            {router.query.noResults === 'true'
                                                ? `No results for "${router.query.searchQuery || ''}"`
                                                : 'No villas match your search'}
                                        </h3>
                                        <p className="text-[#506A70] text-sm max-w-xs mb-8">
                                            {router.query.noResults === 'true'
                                                ? 'Try a different keyword or browse all our villas.'
                                                : 'Try adjusting your dates, location or filters to find your perfect villa.'}
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => {
                                                    setLocation('');
                                                    setArea('');
                                                    setPickerLocation('');
                                                    setPickerArea('');
                                                    setSelectedCountry('');
                                                    setLocationTreeScope(undefined);
                                                    setLocationTreeDisplayRegion('');
                                                    setBudget('');
                                                    setCheckIn('');
                                                    setCheckOut('');
                                                    setDateFlexDays(0);
                                                    setFilterState({
                                                        location: '',
                                                        area: '',
                                                        priceRange: { min: null, max: null },
                                                        bedroomsMin: null,
                                                        bedroomsMax: null,
                                                        bedroomsExact: null,
                                                        bathrooms: 1,
                                                        outdoor: [],
                                                        guestsMin: null,
                                                        stars: [],
                                                        viewTokens: [],
                                                        includedServices: [],
                                                        kidsFriendly: 'any',
                                                        locationFeatures: [],
                                                        accessibilityFeatures: [],
                                                    });
                                                    setActiveFilters([]);
                                                }}
                                                className="h-[48px] px-6 bg-[#172338] text-white font-haas text-[14px] hover:bg-[#0f1a1f] transition"
                                            >
                                                Clear all filters
                                            </button>
                                            <button
                                                onClick={handleOpenFilters}
                                                className="h-[48px] px-6 border border-[#172338] text-[#172338] font-haas text-[14px] hover:bg-[#F0F3F5] transition flex items-center gap-2"
                                            >
                                                <SlidersHorizontal className="w-4 h-4" />
                                                Adjust filters
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isLoading && !promoResolving && !error && filteredVillas.length > 0 && showMap && (
                                    <div className="flex flex-col-reverse md:flex-row md:items-start gap-6 px-4 md:px-0">
                                        <div className="w-full md:w-2/3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
                                                {paginatedVillas.map((villa) => (
                                                    <div
                                                        key={villa.id}
                                                        onClick={() => handleCardClick(villa)}
                                                        className={`group bg-white overflow-hidden cursor-pointer border transition-[border-color,box-shadow] duration-500 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(23,35,56,0.13)] ${activeProperty?.id === villa.id ? 'border-[#D99330]' : 'border-[#E8ECEF] hover:border-[#D99330]'}`}
                                                    >
                                                        <div className="relative overflow-hidden h-60">
                                                            <img
                                                                src={(() => {
                                                                    if (!villa.images || !Array.isArray(villa.images) || villa.images.length === 0) {
                                                                      return '/images/villa-detail@2x.png';
                                                                    }
                                                                    const rawUrl = villa.images[0]?.urlImage || villa.images[0]?.url || '';
                                                                    if (!rawUrl || rawUrl.trim() === '') {
                                                                      return '/images/villa-detail@2x.png';
                                                                    }
                                                                    if (/^https?:\/\//i.test(rawUrl)) {
                                                                      return heroImageDirectUrl(rawUrl, 828);
                                                                    }
                                                                    const imageUrl = resolveMediaUrl(rawUrl);
                                                                    return imageUrl && imageUrl.trim() !== '' ? heroImageDirectUrl(imageUrl, 828) : '/images/villa-detail@2x.png';
                                                                })()}
                                                                alt={villa.title}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    if (target.src !== '/images/villa-detail@2x.png') {
                                                                        target.src = '/images/villa-detail@2x.png';
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                            <div className="absolute bottom-0 inset-x-0 px-5 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                                                <span className="text-white font-haas text-[11px] tracking-[0.22em] uppercase border-b border-white/40 pb-0.5">View Villa</span>
                                                            </div>
                                                            <button
                                                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition"
                                                                onClick={(e) => e.stopPropagation()}
                                                                type="button"
                                                            >
                                                                <Heart className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="p-5">
                                                            <h3 className="font-haas font-medium text-[#172338] text-lg leading-snug mb-1 truncate transition-colors duration-300 group-hover:text-[#0f1a2e]">
                                                                {villa.title}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-[#506A70] mb-3">
                                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="text-sm truncate">{villa.visibleLocation || villa.location || villa.country || 'N/A'}</span>
                                                            </div>
                                                            <p className="text-xs font-haas text-[#8A9BA0] uppercase tracking-wider mb-4">
                                                                {(villa.classification?.bedrooms ?? 'N/A')} bedrooms · {getVillaGuestDisplay(villa)} guests · {formatPoolsJacuzziSpecLine(villa.classification)}
                                                            </p>
                                                            <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F5]">
                                                                <div>
                                                                    <span className="block text-[10px] text-[#8A9BA0] uppercase tracking-wider font-haas">From</span>
                                                                    <span className="font-haas font-medium text-[#D99330] text-base">{getDisplayPrice(villa)}</span>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-[#8A9BA0] group-hover:text-[#D99330] group-hover:translate-x-1 transition-all duration-300" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-6 px-1">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Previous page"
                                                >
                                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                    const isFirst = page === 1
                                                    const isLast = page === totalPages
                                                    const isNearCurrent = Math.abs(page - currentPage) <= 1
                                                    if (!isFirst && !isLast && !isNearCurrent) {
                                                        if (page === 2 || page === totalPages - 1) {
                                                            return <span key={page} className="text-[#506A70] px-1">…</span>
                                                        }
                                                        return null
                                                    }
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`w-10 h-10 border font-haas text-sm transition ${
                                                                currentPage === page
                                                                    ? 'bg-[#172338] text-white border-[#172338]'
                                                                    : 'border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white'
                                                            }`}
                                                            aria-label={`Page ${page}`}
                                                            aria-current={currentPage === page ? 'page' : undefined}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                })}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Next page"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                        <div
                                            className="w-full md:w-1/3 md:sticky md:self-start"
                                            style={{ top: searchSectionHeight ? navbarHeight + searchSectionHeight : undefined }}
                                        >
                                            <VillasListMapPanel
                                                properties={filteredVillas}
                                                activeProperty={activeProperty}
                                                onMarkerClick={handleMarkerSelection}
                                                onViewDetails={handleViewPropertyDetails}
                                                containerHeight={searchSectionHeight ? `calc(100vh - ${navbarHeight + searchSectionHeight}px)` : undefined}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isLoading && !promoResolving && !error && filteredVillas.length > 0 && !showMap && (
                                    <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
                                        {paginatedVillas.map((villa) => (
                                            <div
                                                key={villa.id}
                                                onClick={() => handleCardClick(villa)}
                                                className={`group bg-white overflow-hidden cursor-pointer border transition-[border-color,box-shadow] duration-500 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(23,35,56,0.13)] ${activeProperty?.id === villa.id ? 'border-[#D99330]' : 'border-[#E8ECEF] hover:border-[#D99330]'}`}
                                            >
                                                <div className="relative overflow-hidden h-64">
                                                    <img
                                                        src={heroImageDirectUrl(getVillaImageUrl(villa), 828)}
                                                        alt={villa.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (target.src !== PLACEHOLDER_IMAGE) {
                                                                target.src = PLACEHOLDER_IMAGE;
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="absolute bottom-0 inset-x-0 px-5 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                                        <span className="text-white font-haas text-[11px] tracking-[0.22em] uppercase border-b border-white/40 pb-0.5">View Villa</span>
                                                    </div>
                                                    <button
                                                        className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition disabled:opacity-70 ${
                                                            isLiked(villa.id) ? 'bg-white' : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (villa.id) {
                                                                if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; }
                                                                toggleFavorite(villa.id);
                                                            }
                                                        }}
                                                        disabled={!villa.id || pendingIds.has(villa.id)}
                                                        type="button"
                                                        aria-pressed={isLiked(villa.id)}
                                                        aria-label={isLiked(villa.id) ? 'Remove from favourites' : 'Add to favourites'}
                                                    >
                                                        <Heart className={`w-4 h-4 ${isLiked(villa.id) ? 'fill-[#ef4444] text-[#ef4444]' : ''}`} />
                                                    </button>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-haas font-medium text-[#172338] text-lg leading-snug mb-1 truncate transition-colors duration-300 group-hover:text-[#0f1a2e]">
                                                        {villa.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-[#506A70] mb-3">
                                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="text-sm truncate">{villa.visibleLocation || villa.location || villa.country || 'N/A'}</span>
                                                    </div>
                                                    <p className="text-xs font-haas text-[#8A9BA0] uppercase tracking-wider mb-4">
                                                        {(villa.classification?.bedrooms ?? 'N/A')} bedrooms · {getVillaGuestDisplay(villa)} guests · {formatPoolsJacuzziSpecLine(villa.classification)}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F5]">
                                                        <div>
                                                            <span className="block text-[10px] text-[#8A9BA0] uppercase tracking-wider font-haas">From</span>
                                                            <span className="font-haas font-medium text-[#D99330] text-base">{getDisplayPrice(villa)}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-[#8A9BA0] group-hover:text-[#D99330] group-hover:translate-x-1 transition-all duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-12 px-4 md:px-0">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Previous page"
                                            >
                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                            </button>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                const isFirst = page === 1
                                                const isLast = page === totalPages
                                                const isNearCurrent = Math.abs(page - currentPage) <= 1
                                                if (!isFirst && !isLast && !isNearCurrent) {
                                                    if (page === 2 || page === totalPages - 1) {
                                                        return <span key={page} className="text-[#506A70] px-1">…</span>
                                                    }
                                                    return null
                                                }
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 border font-haas text-sm transition ${
                                                            currentPage === page
                                                                ? 'bg-[#172338] text-white border-[#172338]'
                                                                : 'border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white'
                                                        }`}
                                                        aria-label={`Page ${page}`}
                                                        aria-current={currentPage === page ? 'page' : undefined}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Next page"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <Footer disableTravelSection={true} disableDataLoading={true} />
            
            {/* Villa Filter Overlay */}
            <VillaFilterOverlay
                isOpen={showFilters}
                onClose={handleCloseFilters}
                onApplyFilters={handleApplyFilters}
                initialFilters={{
                    ...filterState,
                    checkIn,
                    checkOut,
                    dateFlexDays
                }}
                currencySymbol={listingCurrencySymbol}
            />
        </>
    )
}

export default KennedysVillasList
