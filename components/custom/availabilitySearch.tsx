"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Candle2Icon from '@/public/images/candle-2.svg'
import { ChevronRight, SlidersHorizontal, ChevronUp, ChevronDown, ChevronLeft, Calendar, ArrowRight } from 'lucide-react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { getAllProperties } from '@/lib/api/properties'
import { KENNEDYS_LOCATION_FILTER_TREE, REAL_ESTATE_LOCATION_FILTER_TREE } from '@/lib/kennedysLocationFilterTree'
import {
    LocationTreeDropdown,
    buildLocationTreeLabel,
    locationSelectionDisplayTags,
    type LocationTreeSelection,
    type LocationCountryGroup,
    type LocationTreeDropdownHandle,
} from '@/components/custom/LocationTreeDropdown'
import { getAllServices } from '@/lib/api/services'
import { Cross1Icon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { stayDateFlexShortLabel } from '@/lib/stayDateFlex'
import { StayDateFlexPicker } from '@/components/custom/StayDateFlexPicker'

const BUDGET_SLIDER_MIN = 0
const BUDGET_SLIDER_MAX = 50_000_000
const BUDGET_SLIDER_STEP = 100_000

function fmtBudgetAmt(n: number, isEnd: boolean): string {
    if (n >= BUDGET_SLIDER_MAX && isEnd) return '€50M+'
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
    if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}K`
    return `€${n}`
}

function fmtBudgetBarLabel(min: number, max: number): string {
    if (min <= BUDGET_SLIDER_MIN && max >= BUDGET_SLIDER_MAX) return 'Any price'
    return `${fmtBudgetAmt(min, false)} – ${fmtBudgetAmt(max, true)}`
}

// --- Shared cell styling for the unified "reservation desk" search bar ---
const CELL_BASE = 'flex flex-col justify-center gap-1 px-5 py-2 md:py-2.5'
const CELL_LABEL = 'font-haas text-[10px] uppercase tracking-[0.22em] text-[#506A70]/60'
const CELL_TRIGGER = 'w-full flex items-center justify-between text-left bg-transparent focus:outline-none'
const CELL_VALUE = 'font-haas font-light text-[15px] leading-none truncate'
const cellValueTone = (filled: boolean) => (filled ? 'text-[#172338]' : 'text-[#506A70]/55')

const TAB_ORDER: Array<'rental' | 'real-estate' | 'concierge' | 'events'> = ['rental', 'real-estate', 'concierge', 'events']

interface Props {
    onFilterClick: () => void
    hideFilters?: boolean
    variant?: "default" | "home";
    onFiltersChange?: (filters: any) => void;
    selectedFilters?: any;
}

const AvailabilitySearch = ({ onFilterClick, hideFilters = false, variant = "default", onFiltersChange, selectedFilters = {} }: Props) => {
    const router = useRouter();
    const [searchType, setSearchType] = useState<'rental' | 'real-estate' | 'concierge' | 'events'>('rental');
    const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
    const slideAnimClass = slideDir === 'right' ? 'animate-search-slide-from-right' : 'animate-search-slide-from-left';
    const changeSearchType = (next: 'rental' | 'real-estate' | 'concierge' | 'events') => {
        setSlideDir(TAB_ORDER.indexOf(next) >= TAB_ORDER.indexOf(searchType) ? 'right' : 'left');
        setSearchType(next);
    };
    const [location, setLocation] = useState('');
    const [area, setArea] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [locationTreeScope, setLocationTreeScope] = useState<'country' | 'region' | undefined>(undefined);
    const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState('');
    const [bedroomsMin, setBedroomsMin] = useState('');
    const [bedroomsMax, setBedroomsMax] = useState('');
    const [budget, setBudget] = useState('');
    const [budgetMin, setBudgetMin] = useState(BUDGET_SLIDER_MIN)
    const [budgetMax, setBudgetMax] = useState(BUDGET_SLIDER_MAX)
    const [budgetMinInput, setBudgetMinInput] = useState('')
    const [budgetMaxInput, setBudgetMaxInput] = useState('')
    const [isBudgetOpen, setIsBudgetOpen] = useState(false)
    const budgetRef = useRef<HTMLDivElement>(null)
    const [isServiceOpen, setIsServiceOpen] = useState(false)
    const serviceRef = useRef<HTMLDivElement>(null)
    const [propertyType, setPropertyType] = useState(''); // Para real estate: Residential / Commercial / Land
    const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false)
    const propertyTypeRef = useRef<HTMLDivElement>(null)
    const [checkInOut, setCheckInOut] = useState('');
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = dateRange;
    const [serviceName, setServiceName] = useState(''); // Para concierge
    const [realEstateName, setRealEstateName] = useState(''); // Para real estate

    // Estados para location agrupado por país (rental / real-estate / concierge)
    const [locationOptionsByCountry] = useState<LocationCountryGroup[]>(KENNEDYS_LOCATION_FILTER_TREE);
    const [loading] = useState(false);
    const [propertyName, setPropertyName] = useState('');
    // Estados para el dropdown personalizado de location
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [dateFlexDays, setDateFlexDays] = useState(0);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<LocationTreeDropdownHandle>(null);

    // Cerrar calendar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        if (isDatePickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isDatePickerOpen]);

    // Cerrar service dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
                setIsServiceOpen(false);
            }
        };
        if (isServiceOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isServiceOpen]);

    // Cerrar budget al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (budgetRef.current && !budgetRef.current.contains(event.target as Node)) {
                setIsBudgetOpen(false);
            }
        };
        if (isBudgetOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isBudgetOpen]);

    // Cerrar property type dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target as Node)) {
                setIsPropertyTypeOpen(false);
            }
        };
        if (isPropertyTypeOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isPropertyTypeOpen]);

    // Limpiar campos cuando cambia el tipo de búsqueda
    useEffect(() => {
        setSelectedCountry('');
        setLocation('');
        setArea('');
        setLocationTreeScope(undefined);
        setLocationTreeDisplayRegion('');
        if (searchType === 'concierge') {
            setPropertyName('');
            setRealEstateName('');
            setBedroomsMin('');
            setBedroomsMax('');
            setPropertyType('');
        } else if (searchType === 'real-estate') {
            setPropertyName('');
            setServiceName('');
            setBedroomsMin('');
            setBedroomsMax('');
            setDateRange([null, null]);
            setDateFlexDays(0);
        } else if (searchType === 'rental') {
            setServiceName('');
            setRealEstateName('');
            setPropertyType('');
        }
    }, [searchType]);

    // Aplicar filtros seleccionados cuando cambien
    useEffect(() => {
        if (selectedFilters && Object.keys(selectedFilters).length > 0) {
            setLocation(selectedFilters.location || '');
            setArea(selectedFilters.area || '');
            setBedroomsMin(selectedFilters.bedroomsMin || '');
            setBedroomsMax(selectedFilters.bedroomsMax || '');
            setBudget(selectedFilters.budget || '');
            setCheckInOut(selectedFilters.checkInOut || '');
        }
    }, [selectedFilters]);

    // Derivar el país para el label del dropdown (solo cuando `location` es una región simple)
    useEffect(() => {
        if (!selectedCountry && location && !location.includes(',') && Array.isArray(locationOptionsByCountry) && locationOptionsByCountry.length > 0) {
            const loc = location.trim();
            for (const group of locationOptionsByCountry) {
                if (group.regions?.includes(loc)) {
                    setSelectedCountry(group.country);
                    break;
                }
            }
        }
    }, [selectedCountry, location, locationOptionsByCountry]);


    const handleChange = (field: string, value: string) => {
        const newFilters = {
            ...selectedFilters,
            [field]: value
        };
        
        // Actualizar estado local
        switch (field) {
            case 'location':
                setLocation(value);
                break;
            case 'area':
                setArea(value);
                break;
            case 'bedroomsMin':
                setBedroomsMin(value);
                break;
            case 'bedroomsMax':
                setBedroomsMax(value);
                break;
            case 'budget':
                setBudget(value);
                break;
            case 'checkInOut':
                setCheckInOut(value);
                break;
        }

        // Notificar cambios
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const applyLocationTreeSelection = (next: LocationTreeSelection) => {
        setSelectedCountry(next.selectedCountry);
        setLocationTreeScope(next.scope);
        setLocationTreeDisplayRegion(next.displayRegion ?? '');
        if (next.selectedLeaves !== undefined) {
            const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)));
            if (uniq.length === 0) {
                setLocation('');
                setArea('');
            } else {
                setLocation(uniq.join(','));
                setArea(next.area ?? '');
            }
        } else {
            setLocation(next.regionValue);
            setArea(next.area);
        }
        if (!onFiltersChange) return;
        const nf: any = { ...(selectedFilters || {}) };
        const locCsv = (next.selectedLeaves !== undefined
            ? Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean))).join(',')
            : next.regionValue
        ).trim();
        if (locCsv) nf.location = locCsv;
        else delete nf.location;
        if (next.area && next.area.trim()) nf.area = next.area;
        else delete nf.area;
        onFiltersChange(nf);
    };

    const locationTreeValue = useMemo<LocationTreeSelection>(() => {
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

    const clearLocationTreeState = () => {
        setSelectedCountry('');
        setLocation('');
        setArea('');
        setLocationTreeScope(undefined);
        setLocationTreeDisplayRegion('');
    };

    const removeFilter = (field: string, locationTag?: string) => {
        const newFilters = { ...selectedFilters };
        if (field === 'location' && locationTag) {
            const tags = locationSelectionDisplayTags(locationTreeValue);
            const leaves = location.split(',').map((s) => s.trim()).filter(Boolean);
            if (tags.length <= 1) {
                clearLocationTreeState();
                delete newFilters.location;
                delete newFilters.area;
            } else {
                const nextLeaves = leaves.filter(
                    (l) => l.toLowerCase() !== locationTag.toLowerCase(),
                );
                if (nextLeaves.length === 0) {
                    clearLocationTreeState();
                    delete newFilters.location;
                    delete newFilters.area;
                } else {
                    const csv = nextLeaves.join(',');
                    setLocation(csv);
                    setArea('');
                    newFilters.location = csv;
                    delete newFilters.area;
                }
            }
        } else {
            delete newFilters[field];
            switch (field) {
                case 'location':
                    clearLocationTreeState();
                    break;
                case 'area':
                    clearLocationTreeState();
                    break;
                case 'bedroomsMin':
                    setBedroomsMin('');
                    break;
                case 'bedroomsMax':
                    setBedroomsMax('');
                    break;
                case 'budget':
                    setBudget('');
                    break;
                case 'checkInOut':
                    setCheckInOut('');
                    setDateRange([null, null]);
                    setDateFlexDays(0);
                    break;
                default:
                    break;
            }
        }

        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const getActiveFilters = () => {
        const activeFilters: {
            id: string;
            field: string;
            label: string;
            value: string;
            locationTag?: string;
        }[] = [];

        if (location || area) {
            const tags = locationSelectionDisplayTags(locationTreeValue);
            const fallback =
                tags.length > 0
                    ? tags
                    : [buildLocationTreeLabel(locationTreeValue) || location || area].filter(Boolean);
            fallback.forEach((tag) => {
                activeFilters.push({
                    id: `location:${tag}`,
                    field: 'location',
                    label: 'Location',
                    value: tag,
                    locationTag: tag,
                });
            });
        }

        if (checkInOut) {
            activeFilters.push({
                id: 'checkInOut',
                field: 'checkInOut',
                label: 'Check In/Out',
                value: checkInOut,
            });
        }

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    const parseBudgetRange = (value: string) => {
        if (!value) return { min: undefined, max: undefined };
        const cleaned = value.replace(/[,$]/g, '');
        if (cleaned.includes('-')) {
            const [minStr, maxStr] = cleaned.split('-').map((part) => part.replace(/\D/g, ''));
            const min = Number(minStr);
            const max = Number(maxStr);
            return { min: Number.isFinite(min) ? min : undefined, max: Number.isFinite(max) ? max : undefined };
        }
        if (cleaned.endsWith('+')) {
            const min = Number(cleaned.replace(/\D/g, ''));
            return { min: Number.isFinite(min) ? min : undefined, max: undefined };
        }
        const single = Number(cleaned.replace(/\D/g, ''));
        return { min: Number.isFinite(single) ? single : undefined, max: undefined };
    };

    // --- Calendar helpers ---
    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const getCalendarDays = (year: number, month: number): (Date | null)[] => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
        return days;
    };

    const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

    const handleDayClick = (day: Date) => {
        if (day < todayMidnight) return;
        if (!startDate || (startDate && endDate)) {
            setDateRange([day, null]);
        } else {
            if (day < startDate) {
                setDateRange([day, null]);
            } else if (isSameDay(day, startDate)) {
                setDateRange([null, null]);
                setDateFlexDays(0);
            } else {
                setDateRange([startDate, day]);
                setTimeout(() => setIsDatePickerOpen(false), 120);
            }
        }
    };

    const renderDatePicker = (cellClassName = 'md:flex-[1.15]') => {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const days = getCalendarDays(year, month);
        const dateLabel = startDate && endDate
            ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}${dateFlexDays > 0 ? ` · ${stayDateFlexShortLabel(dateFlexDays)}` : ''}`
            : startDate
                ? `${format(startDate, 'MMM d')} –`
                : 'Select dates';

        return (
            <div className={`${CELL_BASE} w-full ${cellClassName}`} ref={datePickerRef}>
                <label className={CELL_LABEL}>Dates</label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(p => !p)}
                        className={CELL_TRIGGER}
                    >
                        <span className={`${CELL_VALUE} ${cellValueTone(!!startDate)}`}>
                            {dateLabel}
                        </span>
                        <Calendar className="h-4 w-4 text-[#506A70]/70 shrink-0 ml-2" strokeWidth={1.5} />
                    </button>

                    {isDatePickerOpen && (
                        <div className="absolute z-50 mt-4 left-0 bg-white border border-[#506A70]/20 shadow-[0_20px_50px_-20px_rgba(23,35,56,0.4)] p-4 w-[280px]">
                            {/* Navegación mes */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth(new Date(year, month - 1))}
                                    className="p-1 hover:bg-[#EEF2F6] transition"
                                >
                                    <ChevronLeft className="h-4 w-4 text-[#506A70]" />
                                </button>
                                <span className="font-haas text-xs font-thin text-[#506A70] uppercase tracking-widest">
                                    {format(calendarMonth, 'MMMM yyyy')}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth(new Date(year, month + 1))}
                                    className="p-1 hover:bg-[#EEF2F6] transition"
                                >
                                    <ChevronRight className="h-4 w-4 text-[#506A70]" />
                                </button>
                            </div>

                            {/* Headers días */}
                            <div className="grid grid-cols-7 mb-1">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-400 py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Grid días */}
                            <div className="grid grid-cols-7">
                                {days.map((day, i) => {
                                    if (!day) return <div key={`empty-${i}`} />;
                                    const isPast = day < todayMidnight;
                                    const isStart = startDate && isSameDay(day, startDate);
                                    const isEnd = endDate && isSameDay(day, endDate);
                                    const inRange = startDate && endDate && day > startDate && day < endDate;
                                    const isHovered = startDate && !endDate && hoverDate && day > startDate && day <= hoverDate;
                                    return (
                                        <button
                                            key={`day-${i}`}
                                            type="button"
                                            disabled={isPast}
                                            onClick={() => handleDayClick(day)}
                                            onMouseEnter={() => !isPast && setHoverDate(day)}
                                            onMouseLeave={() => setHoverDate(null)}
                                            className={[
                                                'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                                                isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer',
                                                (isStart || isEnd) ? 'bg-[#D99330] text-white' : '',
                                                inRange ? 'bg-[#EEF2F6] text-[#506A70]' : '',
                                                isHovered && !inRange && !isStart && !isEnd ? 'bg-[#f5f8fa] text-[#506A70]' : '',
                                                !isPast && !isStart && !isEnd && !inRange && !isHovered ? 'hover:bg-[#EEF2F6] text-[#506A70]' : '',
                                            ].filter(Boolean).join(' ')}
                                        >
                                            {day.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            <StayDateFlexPicker className="mt-3" value={dateFlexDays} onChange={setDateFlexDays} />

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setDateRange([null, null]); setDateFlexDays(0); handleChange('checkInOut', ''); }}
                                    className="text-xs font-haas font-thin text-[#506A70] underline"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(false)}
                                    className="text-xs font-haas font-thin text-[#506A70] font-medium"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleSearch = async () => {
        locationDropdownRef.current?.close();
        // Redirigir según el tipo de búsqueda seleccionado
        if (searchType === 'events') {
            router.push('/events');
            return;
        } else if (searchType === 'concierge') {
            const params = new URLSearchParams();
            if (serviceName.trim()) params.set('type', serviceName.trim());
            if (location.trim()) params.set('location', location.trim());
            if (area.trim()) params.set('area', area.trim());
            if (startDate) params.set('dateFrom', format(startDate, 'yyyy-MM-dd'));
            if (endDate) params.set('dateTo', format(endDate, 'yyyy-MM-dd'));
            if (dateFlexDays > 0 && startDate && endDate) {
                params.set('dateFlexDays', String(dateFlexDays));
            }
            router.push(`/concierge/list?${params.toString()}`);
            return;
        } else if (searchType === 'real-estate') {
            const params = new URLSearchParams();
            if (realEstateName.trim()) params.set('searchQuery', realEstateName.trim());
            if (location.trim()) params.set('region', location.trim());
            if (area.trim()) params.set('area', area.trim());
            if (propertyType) params.set('propertyType', propertyType);
            if (budgetMin > BUDGET_SLIDER_MIN) params.set('minPrice', String(budgetMin));
            if (budgetMax < BUDGET_SLIDER_MAX) params.set('maxPrice', String(budgetMax));
            router.push(`/real-estate/list?${params.toString()}`);
            return;
        } else {
            // Rental (comportamiento original)
            const params = new URLSearchParams();
            if (location.trim()) params.set('region', location.trim());
            if (area.trim()) params.set('area', area.trim());
            if (bedroomsMin) {
                const n = Number(bedroomsMin);
                if (Number.isFinite(n) && n > 0) params.set('minBedrooms', String(n));
            }
            if (bedroomsMax) {
                const n = Number(bedroomsMax);
                if (Number.isFinite(n) && n > 0) params.set('maxBedrooms', String(n));
            }
            if (startDate) params.set('dateFrom', format(startDate, 'yyyy-MM-dd'));
            if (endDate) params.set('dateTo', format(endDate, 'yyyy-MM-dd'));
            if (dateFlexDays > 0 && startDate && endDate) {
                params.set('dateFlexDays', String(dateFlexDays));
            }
            params.set('rental', 'true');
            const queryString = params.toString();
            router.push(`/villas/list${queryString ? `?${queryString}` : ''}`);
            return;
        }

        // Código antiguo (comentado - no se usa)
        /*
        if (false && propertyName.trim()) {
            try {
                const searchQuery = propertyName.trim();
                
                // Buscar en los tres tipos en paralelo
                const [rentalResults, conciergeResults, realEstateResults] = await Promise.all([
                    // Buscar en propiedades rental
                    getAllProperties({ 
                        rental: true, 
                        search: searchQuery,
                        published: true 
                    } as any).catch(() => ({ data: { items: [] } })),
                    // Buscar en servicios (concierge)
                    getAllServices({ 
                        published: true,
                        forWebsite: true
                    }).catch(() => ({ data: [] })),
                    // Buscar en propiedades real estate
                    getAllProperties({ 
                        rental: false, 
                        search: searchQuery,
                        published: true 
                    } as any).catch(() => ({ data: { items: [] } }))
                ]);

                // Filtrar servicios por nombre (la API de servicios no tiene filtro de búsqueda)
                const conciergeData = conciergeResults?.data || [];
                const filteredConcierge = conciergeData.filter((service: any) => {
                    const serviceName = (service.name || '').toLowerCase();
                    const searchLower = searchQuery.toLowerCase();
                    return serviceName.includes(searchLower);
                });

                // Determinar a dónde redirigir según los resultados
                const hasRental = rentalResults?.data?.items?.length > 0 || rentalResults?.data?.length > 0;
                const hasConcierge = filteredConcierge.length > 0;
                const hasRealEstate = realEstateResults?.data?.items?.length > 0 || realEstateResults?.data?.length > 0;

                // Prioridad: concierge > real estate > rental
                if (hasConcierge) {
                    // Redirigir a concierge con filtro de búsqueda
                    const params = new URLSearchParams();
                    params.set('search', searchQuery);
                    router.push(`/concierge/list?${params.toString()}`);
                    return;
                } else if (hasRealEstate) {
                    // Redirigir a real estate con filtro de búsqueda
                    const params = new URLSearchParams();
                    params.set('searchQuery', searchQuery); // La página de real estate espera searchQuery
                    router.push(`/real-estate/list?${params.toString()}`);
                    return;
                } else if (hasRental) {
                    // Redirigir a rental con filtro de búsqueda (comportamiento original)
                    const params = new URLSearchParams();
                    if (location.trim()) params.set('region', location.trim());
                    if (area.trim()) params.set('area', area.trim());
                    params.set('searchQuery', searchQuery);
                    if (bedrooms) {
                        const bedroomNumber = Number(bedrooms);
                        if (Number.isFinite(bedroomNumber) && bedroomNumber > 0) {
                            params.set('bedroomsQuantity', String(bedroomNumber));
                            params.set('bedroomsCondition', '>=');
                        }
                    }
                    if (startDate) params.set('dateFrom', format(startDate as Date, 'yyyy-MM-dd'));
                    if (endDate) params.set('dateTo', format(endDate as Date, 'yyyy-MM-dd'));
                    const { min, max } = parseBudgetRange(budget);
                    if (min !== undefined) params.set('minPrice', String(min));
                    if (max !== undefined) params.set('maxPrice', String(max));
                    params.set('rental', 'true');
                    router.push(`/villas/list?${params.toString()}`);
                    return;
                }
                // Si no hay resultados en ningún tipo, redirigir a rental con la búsqueda y un parámetro que indique que no se encontró nada
                const params = new URLSearchParams();
                if (location.trim()) params.set('region', location.trim());
                if (area.trim()) params.set('area', area.trim());
                params.set('searchQuery', searchQuery);
                params.set('noResults', 'true'); // Indicador de que no se encontraron resultados en ningún tipo
                if (bedrooms) {
                    const bedroomNumber = Number(bedrooms);
                    if (Number.isFinite(bedroomNumber) && bedroomNumber > 0) {
                        params.set('bedroomsQuantity', String(bedroomNumber));
                        params.set('bedroomsCondition', '>=');
                    }
                }
                if (startDate) params.set('dateFrom', format(startDate as Date, 'yyyy-MM-dd'));
                if (endDate) params.set('dateTo', format(endDate as Date, 'yyyy-MM-dd'));
                const { min, max } = parseBudgetRange(budget);
                if (min !== undefined) params.set('minPrice', String(min));
                if (max !== undefined) params.set('maxPrice', String(max));
                params.set('rental', 'true');
                router.push(`/villas/list?${params.toString()}`);
                return;
            } catch (error) {
                console.error('Error searching across types:', error);
                // En caso de error, continuar con el comportamiento original
            }
        }
        */

        // Comportamiento original si no hay búsqueda por nombre o si hubo error
        const params = new URLSearchParams();
        if (location.trim()) params.set('region', location.trim());
        if (area.trim()) params.set('area', area.trim());
        if (propertyName.trim()) params.set('searchQuery', propertyName.trim());
        if (bedroomsMin) {
            const n = Number(bedroomsMin);
            if (Number.isFinite(n) && n > 0) params.set('minBedrooms', String(n));
        }
        if (bedroomsMax) {
            const n = Number(bedroomsMax);
            if (Number.isFinite(n) && n > 0) params.set('maxBedrooms', String(n));
        }
        if (startDate) params.set('dateFrom', format(startDate as Date, 'yyyy-MM-dd'));
        if (endDate) params.set('dateTo', format(endDate as Date, 'yyyy-MM-dd'));
        if (dateFlexDays > 0 && startDate && endDate) {
            params.set('dateFlexDays', String(dateFlexDays));
        }
        const { min, max } = parseBudgetRange(budget);
        if (min !== undefined) params.set('minPrice', String(min));
        if (max !== undefined) params.set('maxPrice', String(max));
        params.set('rental', 'true');
        const queryString = params.toString();
        router.push(`/villas/list${queryString ? `?${queryString}` : ''}`);
    };

    const searchHeadingTitle =
        searchType === 'real-estate'
            ? 'Luxury Real Estate'
            : searchType === 'concierge'
              ? 'Luxury Concierge Services'
              : searchType === 'events'
                ? 'Luxury Events'
                : 'Luxury Vacation Rentals';

    const searchHeadingSubtitle =
        searchType === 'real-estate'
            ? "Exceptional homes and investments in the world's most coveted addresses."
            : searchType === 'concierge'
              ? 'Private chefs, chauffeurs, yachts and jets — arranged end to end.'
              : searchType === 'events'
                ? 'Bespoke celebrations, produced from first idea to final toast.'
                : 'Handpicked villas and chalets, from the Mediterranean to the Alps.';

    const SEARCH_TABS: { value: 'rental' | 'real-estate' | 'concierge' | 'events'; label: string }[] = [
        { value: 'rental', label: 'Vacation Rental' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'concierge', label: 'Concierge Services' },
        { value: 'events', label: 'Events' },
    ];

    return (
        <div className="bg-white border border-[#506A70]/15 shadow-[0_14px_40px_-30px_rgba(23,35,56,0.25)] p-6 md:p-10">
            {/* Header: eyebrow con renglón dorado, título serif y subtítulo de apoyo */}
            <div className="mb-7 md:mb-9 md:flex md:items-end md:justify-between md:gap-8">
                <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-3">
                        <span className="h-px w-8 bg-[#D99330]" />
                        <p className="font-haas text-[11px] uppercase tracking-[0.34em] text-[#D99330]">Search</p>
                    </div>
                    <h1 key={searchHeadingTitle} className={`text-[30px] md:text-[46px] font-gtsuper-ds font-thin leading-[0.98] tracking-[0%] uppercase text-[#506A70] ${slideAnimClass}`}>{searchHeadingTitle}</h1>
                </div>
                <p key={searchHeadingSubtitle} className={`mt-3 md:mt-0 md:max-w-[19rem] md:text-right font-haas font-light text-[13px] leading-relaxed text-[#506A70]/70 ${slideAnimClass}`}>
                    {searchHeadingSubtitle}
                </p>
            </div>

            {/* Tabs para seleccionar tipo de búsqueda */}
            <div className="mb-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[#506A70]/15">
                {SEARCH_TABS.map((tab) => {
                    const isActive = searchType === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => (tab.value === 'events' ? router.push('/events') : changeSearchType(tab.value))}
                            className={`relative pb-3 font-haas text-[13px] uppercase tracking-[0.12em] transition-colors ${isActive ? 'text-[#506A70]' : 'text-[#506A70]/40 hover:text-[#506A70]/70'}`}
                        >
                            {tab.label}
                            {isActive && <span key={tab.value} className="absolute inset-x-0 -bottom-px h-[2px] bg-[#D99330] animate-search-fade-in" />}
                        </button>
                    );
                })}
            </div>

            {/* Barra unificada: un solo instrumento con celdas separadas por hairlines */}
            <div
                key={searchType}
                className={`flex flex-col md:flex-row md:items-stretch w-full border border-[#506A70]/25 bg-white divide-y md:divide-y-0 md:divide-x divide-[#506A70]/15 ${slideAnimClass}`}
            >
                {/* Campos según el tipo de búsqueda */}
                {searchType === 'rental' && (
                    <>
                        {/* Location Field */}
                        <div className={`${CELL_BASE} w-full md:flex-[1.7] md:min-w-0`}>
                            <label className={CELL_LABEL}>Where</label>
                            <LocationTreeDropdown
                                ref={locationDropdownRef}
                                options={locationOptionsByCountry}
                                loading={loading}
                                placeholder="Anywhere"
                                triggerClassName="w-full pr-8 bg-transparent text-[#172338] font-haas font-light text-[15px] focus:outline-none"
                                value={locationTreeValue}
                                onChange={applyLocationTreeSelection}
                                multiSelect
                                closeOnSelect={false}
                            />
                        </div>

                        {/* Check In/Check Out Field */}
                        {renderDatePicker()}

                        {/* Bedrooms */}
                        <div className={`${CELL_BASE} w-full md:flex-[0.85] md:min-w-[130px]`}>
                            <label className={CELL_LABEL}>Bedrooms</label>
                            <div className='flex items-center justify-between'>
                                <span className={`${CELL_VALUE} ${cellValueTone(!!bedroomsMin)}`}>
                                    {bedroomsMin || 'Any'}
                                </span>
                                <div className='flex flex-col -my-1 ml-2'>
                                    <button
                                        type="button"
                                        aria-label="Add bedroom"
                                        onClick={() => {
                                            const cur = parseInt(bedroomsMin) || 0;
                                            setBedroomsMin(String(Math.min(20, cur + 1)));
                                        }}
                                        className='p-0.5 text-[#506A70]/70 hover:text-[#506A70] transition-colors'
                                    >
                                        <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Remove bedroom"
                                        onClick={() => {
                                            const cur = parseInt(bedroomsMin) || 0;
                                            if (cur <= 1) { setBedroomsMin(''); return; }
                                            setBedroomsMin(String(cur - 1));
                                        }}
                                        className='p-0.5 text-[#506A70]/70 hover:text-[#506A70] transition-colors'
                                    >
                                        <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </>
                )}

                {searchType === 'concierge' && (
                    <>
                        {/* Location Field */}
                        <div className={`${CELL_BASE} w-full md:flex-[1.5] md:min-w-0`}>
                            <label className={CELL_LABEL}>Where</label>
                            <LocationTreeDropdown
                                ref={locationDropdownRef}
                                options={locationOptionsByCountry}
                                loading={loading}
                                placeholder="Anywhere"
                                triggerClassName="w-full pr-8 bg-transparent text-[#172338] font-haas font-light text-[15px] focus:outline-none"
                                value={locationTreeValue}
                                onChange={applyLocationTreeSelection}
                                multiSelect
                                closeOnSelect={false}
                            />
                        </div>

                        {/* Service Type Field */}
                        <div className={`${CELL_BASE} w-full md:flex-1 md:min-w-[180px]`} ref={serviceRef}>
                            <label className={CELL_LABEL}>Service</label>
                            <div className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setIsServiceOpen(p => !p)}
                                    className={CELL_TRIGGER}
                                >
                                    <span className={`${CELL_VALUE} ${cellValueTone(!!serviceName)}`}>
                                        {serviceName || 'All services'}
                                    </span>
                                    <ChevronDown className='w-4 h-4 text-[#506A70]/70 shrink-0 ml-2' strokeWidth={1.5} />
                                </button>

                                {isServiceOpen && (
                                    <div className='absolute z-50 mt-4 bg-white border border-[#506A70]/20 shadow-[0_20px_50px_-20px_rgba(23,35,56,0.4)] w-full min-w-[200px] max-h-72 overflow-y-auto'>
                                        {[
                                            { value: '', label: 'All services' },
                                            { value: 'Car Rental', label: 'Car Rental' },
                                            { value: 'Chauffeur', label: 'Chauffeur' },
                                            { value: 'Chef', label: 'Chef' },
                                            { value: 'Concierge Packages', label: 'Concierge Packages' },
                                            { value: 'Kids Experiences', label: 'Kids Experiences' },
                                            { value: 'Nanny', label: 'Nanny' },
                                            { value: 'PrivateJet', label: 'Private Jet' },
                                            { value: 'Security', label: 'Security' },
                                            { value: 'Unique Experiences', label: 'Unique Experiences' },
                                            { value: 'Wellness & Fitnesss', label: 'Wellness & Fitness' },
                                            { value: 'Yacht', label: 'Yacht' },
                                            { value: 'helicopter', label: 'Helicopter' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => { setServiceName(opt.value); setIsServiceOpen(false); }}
                                                className={`w-full px-4 py-2.5 text-left font-haas font-thin text-sm text-[#506A70] hover:bg-[#F0F3F5] transition-colors ${serviceName === opt.value ? 'bg-[#F0F3F5] font-normal' : ''}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {searchType === 'real-estate' && (
                    <>
                        {/* Location Field */}
                        <div className={`${CELL_BASE} w-full md:flex-[1.5] md:min-w-0`}>
                            <label className={CELL_LABEL}>Where</label>
                            <LocationTreeDropdown
                                ref={locationDropdownRef}
                                options={REAL_ESTATE_LOCATION_FILTER_TREE}
                                loading={loading}
                                placeholder="Anywhere"
                                triggerClassName="w-full pr-8 bg-transparent text-[#172338] font-haas font-light text-[15px] focus:outline-none"
                                value={locationTreeValue}
                                onChange={applyLocationTreeSelection}
                                multiSelect
                                closeOnSelect={false}
                            />
                        </div>

                        {/* Property Type Field */}
                        <div className={`${CELL_BASE} w-full md:flex-1 md:min-w-[150px]`} ref={propertyTypeRef}>
                            <label className={CELL_LABEL}>Type</label>
                            <div className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setIsPropertyTypeOpen(p => !p)}
                                    className={CELL_TRIGGER}
                                >
                                    <span className={`${CELL_VALUE} ${cellValueTone(!!propertyType)}`}>
                                        {propertyType || 'Any type'}
                                    </span>
                                    <ChevronDown className='w-4 h-4 text-[#506A70]/70 shrink-0 ml-2' strokeWidth={1.5} />
                                </button>

                                {isPropertyTypeOpen && (
                                    <div className='absolute z-50 mt-4 bg-white border border-[#506A70]/20 shadow-[0_20px_50px_-20px_rgba(23,35,56,0.4)] w-full min-w-[180px]'>
                                        {[
                                            { value: '', label: 'Any type' },
                                            { value: 'Residential', label: 'Residential' },
                                            { value: 'Commercial', label: 'Commercial' },
                                            { value: 'Land', label: 'Land' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => { setPropertyType(opt.value); setIsPropertyTypeOpen(false); }}
                                                className={`w-full px-4 py-2.5 text-left font-haas font-thin text-sm text-[#506A70] hover:bg-[#F0F3F5] transition-colors ${propertyType === opt.value ? 'bg-[#F0F3F5] font-normal' : ''}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Budget Field */}
                        <div className={`${CELL_BASE} w-full md:flex-1 md:min-w-[170px]`} ref={budgetRef}>
                            <label className={CELL_LABEL}>Budget</label>
                            <div className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setIsBudgetOpen(p => !p)}
                                    className={CELL_TRIGGER}
                                >
                                    <span className={`${CELL_VALUE} ${cellValueTone(budgetMin > BUDGET_SLIDER_MIN || budgetMax < BUDGET_SLIDER_MAX)}`}>
                                        {fmtBudgetBarLabel(budgetMin, budgetMax)}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-[#506A70]/70 shrink-0 ml-2" strokeWidth={1.5} />
                                </button>

                                {isBudgetOpen && (
                                    <div className='absolute z-50 mt-4 right-0 bg-white border border-[#506A70]/20 shadow-[0_20px_50px_-20px_rgba(23,35,56,0.4)] w-80'>
                                        {/* Header */}
                                        <div className='px-5 pt-4 pb-3 border-b border-[#506A70]/20'>
                                            <p className='font-haas text-[13px] uppercase tracking-wide text-[#506A70]'>Price Range</p>
                                            <p className='mt-0.5 font-haas font-thin text-[15px] text-[#506A70] tabular-nums'>
                                                {fmtBudgetBarLabel(budgetMin, budgetMax)}
                                            </p>
                                        </div>

                                        {/* Slider */}
                                        <div className='px-5 pt-5 pb-2'>
                                            <SliderPrimitive.Root
                                                className='relative flex w-full touch-none select-none items-center py-1'
                                                min={BUDGET_SLIDER_MIN}
                                                max={BUDGET_SLIDER_MAX}
                                                step={BUDGET_SLIDER_STEP}
                                                value={[budgetMin, budgetMax]}
                                                onValueChange={(v) => {
                                                    const [a, b] = v
                                                    if (typeof a === 'number' && typeof b === 'number') {
                                                        setBudgetMin(a)
                                                        setBudgetMax(b)
                                                        setBudgetMinInput(a > BUDGET_SLIDER_MIN ? String(a) : '')
                                                        setBudgetMaxInput(b < BUDGET_SLIDER_MAX ? String(b) : '')
                                                    }
                                                }}
                                                aria-label="Budget range"
                                            >
                                                <SliderPrimitive.Track className='relative h-[3px] w-full grow overflow-hidden bg-[#506A70]/15'>
                                                    <SliderPrimitive.Range className='absolute h-full bg-[#506A70]' />
                                                </SliderPrimitive.Track>
                                                <SliderPrimitive.Thumb className='block h-[18px] w-[18px] rounded-full border-2 border-[#506A70] bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40 cursor-grab active:cursor-grabbing' />
                                                <SliderPrimitive.Thumb className='block h-[18px] w-[18px] rounded-full border-2 border-[#506A70] bg-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40 cursor-grab active:cursor-grabbing' />
                                            </SliderPrimitive.Root>

                                            {/* Min / Max inputs */}
                                            <div className='mt-4 flex gap-3'>
                                                <div className='flex-1'>
                                                    <label className='mb-1.5 block text-[11px] font-haas uppercase tracking-wider text-[#506A70]/60'>Min</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="€ 0"
                                                        value={budgetMinInput}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/\D/g, '')
                                                            setBudgetMinInput(v)
                                                            const n = Number(v)
                                                            if (v !== '' && !Number.isNaN(n)) {
                                                                setBudgetMin(Math.min(n, budgetMax - BUDGET_SLIDER_STEP))
                                                            } else if (v === '') {
                                                                setBudgetMin(BUDGET_SLIDER_MIN)
                                                            }
                                                        }}
                                                        className='w-full border border-[#9BA6AE]/60 px-3 py-2 text-sm font-haas font-thin text-[#506A70] placeholder:text-[#506A70]/30 focus:outline-none focus:border-[#9BA6AE]'
                                                    />
                                                </div>
                                                <div className='flex items-end pb-2'>
                                                    <span className='text-[#506A70]/30 font-haas'>—</span>
                                                </div>
                                                <div className='flex-1'>
                                                    <label className='mb-1.5 block text-[11px] font-haas uppercase tracking-wider text-[#506A70]/60'>Max</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="€ 50M+"
                                                        value={budgetMaxInput}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/\D/g, '')
                                                            setBudgetMaxInput(v)
                                                            const n = Number(v)
                                                            if (v !== '' && !Number.isNaN(n)) {
                                                                setBudgetMax(Math.max(n, budgetMin + BUDGET_SLIDER_STEP))
                                                            } else if (v === '') {
                                                                setBudgetMax(BUDGET_SLIDER_MAX)
                                                            }
                                                        }}
                                                        className='w-full border border-[#9BA6AE]/60 px-3 py-2 text-sm font-haas font-thin text-[#506A70] placeholder:text-[#506A70]/30 focus:outline-none focus:border-[#9BA6AE]'
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className='flex items-center justify-between px-5 py-3 border-t border-[#506A70]/20'>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBudgetMin(BUDGET_SLIDER_MIN)
                                                    setBudgetMax(BUDGET_SLIDER_MAX)
                                                    setBudgetMinInput('')
                                                    setBudgetMaxInput('')
                                                }}
                                                className='text-xs font-haas font-thin text-[#506A70] underline underline-offset-2'
                                            >
                                                Clear
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsBudgetOpen(false)}
                                                className='text-xs font-haas font-thin text-[#506A70] font-medium'
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Filters Button (solo variante default) */}
                {!hideFilters && variant !== 'home' && (
                    <button
                        type="button"
                        onClick={onFilterClick}
                        className={`${CELL_BASE} w-full md:w-auto md:flex-row md:items-center md:justify-center md:gap-2 text-[#506A70] hover:bg-[#506A70]/[0.04] transition-colors focus:outline-none`}
                    >
                        <span className='font-haas text-[13px] uppercase tracking-[0.12em]'>Filters</span>
                        <SlidersHorizontal className="w-4 h-4 text-[#506A70]/80" strokeWidth={1.5} />
                    </button>
                )}

                {/* Search Action: bloque dorado integrado a la barra */}
                <button
                    onClick={handleSearch}
                    className='group flex items-center justify-center gap-2.5 bg-[#D99330] px-8 py-2.5 md:py-0 md:px-11 text-white hover:bg-[#B27626] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70'
                >
                    <span className='font-haas text-[13px] uppercase tracking-[0.16em]'>Search</span>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </button>
            </div>
            
            {/* Pills de filtros activos */}
            {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-5">
                    {activeFilters.map((filter) => (
                        <div
                            key={filter.id}
                            className="flex items-center gap-2 border border-[#506A70]/25 px-3 py-1.5 bg-white"
                        >
                            <span className="font-haas text-xs uppercase tracking-[0.08em] text-[#506A70]">
                                {filter.label}: {filter.value}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    removeFilter(filter.field, filter.locationTag)
                                }
                                className="hover:bg-[#F0F3F5] rounded-full p-1 transition-colors"
                            >
                                <Cross1Icon className="w-3 h-3 text-[#506A70]/60" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AvailabilitySearch
