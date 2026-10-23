import { useRouter } from "next/router";
import type { NextRouter } from "next/router";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { getAllServices } from "@/lib/api/services";
import {
  LocationTreeDropdown,
  type LocationTreeSelection,
  type LocationTreeDropdownHandle,
} from "@/components/custom/LocationTreeDropdown";
import { KENNEDYS_LOCATION_FILTER_TREE, filterTreeByAvailableRegions } from "@/lib/kennedysLocationFilterTree";

function formatTypeLabel(type: string): string {
  if (!type || type === 'All') return type
  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

interface Props {
  typeOfService: string;
  location: string;
  area?: string;
  onTypeOfServiceChange: Dispatch<SetStateAction<string>>;
  onLocationChange: Dispatch<SetStateAction<string>>;
  onAreaChange?: Dispatch<SetStateAction<string>>;
  onOpenFilters?: () => void;
  /** Query actual de la página list (p. ej. concierge) para conservar min, max, types, search al pulsar Show Services. */
  listUrlQuery?: NextRouter["query"];
  /** `pageGrid`: ancho completo del contenedor max-w-[1300px] (misma columna que el grid de cards). */
  layout?: "default" | "pageGrid";
  /** Lista concierge: ordenación en la misma fila que villas/real-estate. */
  sortOrder?: 'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc';
  onSortOrderChange?: (order: 'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc') => void;
  /** Servicios ya cargados en SSR para poblar tipos sin depender del fetch cliente. */
  initialServicesForTypes?: any[];
  /** Regions available in the backend — used to filter non-Greece countries out of the location dropdown. */
  availableLocations?: string[];
}

export const ServiceSearch = ({
  typeOfService,
  location,
  area = "",
  onTypeOfServiceChange,
  onLocationChange,
  onAreaChange,
  onOpenFilters,
  listUrlQuery,
  layout = "default",
  sortOrder,
  onSortOrderChange,
  initialServicesForTypes = [],
  availableLocations,
}: Props) => {
  const router = useRouter();
  const isPageGrid = layout === "pageGrid";
  const showSortColumn = isPageGrid && typeof onSortOrderChange === "function";
  const [types, setTypes] = useState<string[]>([]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);
  const locationDropdownRef = useRef<LocationTreeDropdownHandle>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [locationTreeScope, setLocationTreeScope] = useState<"country" | "region" | undefined>(undefined);
  const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState("");

  const filteredLocationTree = useMemo(
    () => filterTreeByAvailableRegions(KENNEDYS_LOCATION_FILTER_TREE, availableLocations ?? []),
    [availableLocations],
  )

  const extractServiceType = (service: any): string => {
    const direct = typeof service?.type === "string" ? service.type.trim() : "";
    if (direct) return direct;
    const nestedCollections = [
      "yachts",
      "chauffeurs",
      "helicopters",
      "chefs",
      "privateJets",
      "nannies",
      "securities",
      "uniqueExperiences",
      "conciergePackages",
      "wellnessFitnesses",
      "luxuryShoppings",
      "kidsExperiences",
      "tours",
    ];
    for (const key of nestedCollections) {
      const first = Array.isArray(service?.[key]) ? service[key][0] : null;
      const nestedType =
        (typeof first?.serviceType === "string" && first.serviceType.trim()) ||
        (typeof first?.type === "string" && first.type.trim()) ||
        "";
      if (nestedType) return nestedType;
    }
    return "";
  };

  const buildTypesFromServices = (rows: any[]): string[] => {
    const uniqueTypes = Array.from(
      new Set(
        rows
          .map((s: any) => extractServiceType(s))
          .filter((t: string) => typeof t === "string" && t.trim().length > 0),
      ),
    ) as string[];
    return uniqueTypes.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  };

  useEffect(() => {
    const initialRows = Array.isArray(initialServicesForTypes) ? initialServicesForTypes : [];
    if (initialRows.length === 0) return;
    const initialTypes = buildTypesFromServices(initialRows);
    if (initialTypes.length > 0) {
      setTypes(["All", ...initialTypes]);
    }
  }, [initialServicesForTypes]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getAllServices({ published: true, forWebsite: true, limit: 100 });
        if (res?.success) {
          const data = Array.isArray(res.data) ? res.data : [];
          const sorted = buildTypesFromServices(data);
          setTypes(["All", ...sorted]);
        } else {
          setTypes((prev) => (prev.length > 0 ? prev : ["All"]));
        }
      } catch (e) {
        console.error(e);
        setTypes((prev) => (prev.length > 0 ? prev : ["All"]));
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!typeDropdownOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [typeDropdownOpen]);

  const treeValue = useMemo<LocationTreeSelection>(() => {
    const leaves = area.trim()
      ? [area.trim()]
      : location.split(",").map((s) => s.trim()).filter(Boolean);
    return {
      selectedCountry,
      regionValue: location,
      area,
      scope: locationTreeScope,
      displayRegion: locationTreeDisplayRegion || undefined,
      selectedLeaves: leaves.length > 0 ? leaves : undefined,
    };
  }, [selectedCountry, location, area, locationTreeScope, locationTreeDisplayRegion]);

  const applyTree = (next: LocationTreeSelection) => {
    setSelectedCountry(next.selectedCountry);
    setLocationTreeScope(next.scope);
    setLocationTreeDisplayRegion(next.displayRegion ?? "");
    if (next.selectedLeaves !== undefined) {
      const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)));
      if (uniq.length === 0) {
        onLocationChange("");
        onAreaChange?.("");
      } else {
        onLocationChange(uniq.join(","));
        onAreaChange?.(next.area ?? "");
      }
    } else {
      onLocationChange(next.regionValue);
      onAreaChange?.(next.area);
    }
  };

  const oneQueryString = (v: string | string[] | undefined): string => {
    if (typeof v === "string") return v.trim();
    if (Array.isArray(v) && typeof v[0] === "string") return v[0].trim();
    return "";
  };

  const buildQueryParams = (openFilters?: boolean, typeOverride?: string) => {
    const qp = new URLSearchParams();
    qp.set("page", "1");

    const effectiveType = typeOverride !== undefined ? typeOverride : typeOfService;
    if (effectiveType) qp.set("type", effectiveType);
    if (location) qp.set("location", location);
    if (area) qp.set("area", area);

    const searchP = oneQueryString(listUrlQuery?.search);
    if (searchP) qp.set("search", searchP);
    const minP = oneQueryString(listUrlQuery?.min);
    if (minP) qp.set("min", minP);
    const maxP = oneQueryString(listUrlQuery?.max);
    if (maxP) qp.set("max", maxP);
    const typesP = oneQueryString(listUrlQuery?.types);
    if (typesP) qp.set("types", typesP);
    const promoP = oneQueryString(listUrlQuery?.promo);
    if (promoP) qp.set("promo", promoP);

    if (openFilters) qp.set("openFilters", "true");
    return qp;
  };

  const rootClassName =
    layout === "pageGrid"
      ? "w-full max-w-none overflow-visible px-0 py-0"
      : "w-full max-w-[1120px] bg-white px-4 md:px-6 py-5 overflow-visible";

  /** Aligned with villas list / LuxurySearchForm filter controls */
  const fieldBorder = "border-[#D1D5DB]";
  const filtersBtnBorder = "border-[#D1D5DB]";

  const rowClassName = isPageGrid
    ? "flex flex-col md:flex-row gap-2 overflow-visible"
    : "flex flex-col md:flex-row md:items-end md:flex-nowrap gap-3 md:gap-4 overflow-visible";

  const sortSelectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23172338' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <div className={rootClassName}>
      {isPageGrid && (
        <div className="hidden md:flex gap-2 text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-0">
          <div className="flex-[2] min-w-0 px-1">Location</div>
          <div className="flex-[2] min-w-0 px-1">Type of Service</div>
          {showSortColumn && <div className="w-[170px] shrink-0 px-1">Sort by Price</div>}
          <div className="w-[100px] shrink-0" />
          <div className="w-[160px] shrink-0" />
        </div>
      )}
      <div className={rowClassName}>
        <div className={`w-full min-w-0 ${isPageGrid ? "flex-[2]" : "md:flex-1 md:min-w-[160px]"}`}>
          {!isPageGrid && (
            <label className="block font-haas text-[#172338] text-sm md:text-base mb-2">Location</label>
          )}
          <LocationTreeDropdown
            ref={locationDropdownRef}
            options={filteredLocationTree}
            loading={false}
            placeholder="Select location"
            triggerClassName={`w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border ${fieldBorder} pl-4 pr-14`}
            value={treeValue}
            onChange={applyTree}
            multiSelect
            closeOnSelect={false}
          />
        </div>

        <div className={`w-full min-w-0 ${isPageGrid ? "flex-[2]" : "md:flex-1 md:min-w-[160px]"}`} ref={typeDropdownRef}>
          {!isPageGrid && (
            <label className="block font-haas text-[#172338] text-sm md:text-base mb-2">Type of Service</label>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTypeDropdownOpen((o) => !o)}
              className={`w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border ${fieldBorder} pl-4 pr-10 flex items-center text-left relative`}
            >
              <span className="truncate">
                {typeOfService || "Select type of service"}
              </span>
              <ChevronDown
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`}
                strokeWidth={1.5}
              />
            </button>
            {typeDropdownOpen && (
              <div className={`absolute z-50 mt-1 w-full max-h-72 overflow-y-auto border bg-white shadow-xl ${fieldBorder}`}>
                <button
                  type="button"
                  className="w-full px-4 py-5 text-left text-sm font-haas text-[#506A70] hover:bg-[#F0F3F5] border-b border-[#E8EDF0]"
                  onClick={() => {
                    onTypeOfServiceChange("");
                    setTypeDropdownOpen(false);
                    locationDropdownRef.current?.close();
                    void router.push(`/concierge/list?${buildQueryParams(false, "").toString()}`, undefined, {
                      shallow: true,
                      scroll: false,
                    });
                  }}
                >
                  All types
                </button>
                {types
                  .filter((t) => t !== "All")
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`w-full px-4 py-5 text-left text-sm font-haas text-[#172338] hover:bg-[#F0F3F5] border-b border-[#E8EDF0] last:border-b-0 ${typeOfService === t ? "bg-[#F0F3F5]" : ""}`}
                      onClick={() => {
                        onTypeOfServiceChange(t);
                        setTypeDropdownOpen(false);
                        locationDropdownRef.current?.close();
                        void router.push(`/concierge/list?${buildQueryParams(false, t).toString()}`, undefined, {
                          shallow: true,
                          scroll: false,
                        });
                      }}
                    >
                      {formatTypeLabel(t)}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {showSortColumn && (
          <div className="w-full md:w-[170px] shrink-0 relative">
            <select
              value={sortOrder ?? "default"}
              onChange={(e) =>
                onSortOrderChange?.(e.target.value as "default" | "asc" | "desc" | "nameAsc" | "nameDesc")
              }
              className="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-3 pr-10 appearance-none cursor-pointer bg-no-repeat bg-[length:20px] bg-[position:right_0.75rem_center] [&::-ms-expand]:hidden"
              style={{ backgroundImage: sortSelectChevron }}
            >
              <option value="default">Sort by Price</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
              <option value="nameAsc">Name: A-Z</option>
              <option value="nameDesc">Name: Z-A</option>
            </select>
          </div>
        )}

        <div className="flex flex-col w-full md:w-[100px] shrink-0">
          {!isPageGrid && (
            <label className="block font-haas text-[#172338] text-sm md:text-base mb-2"> </label>
          )}
          <button
            type="button"
            onClick={() => {
              locationDropdownRef.current?.close();
              if (onOpenFilters) {
                onOpenFilters();
              } else {
                void router.push(`/concierge/list?${buildQueryParams(true).toString()}`, undefined, {
                  shallow: true,
                  scroll: false,
                });
              }
            }}
            className={`h-[52px] w-full md:w-[100px] bg-white border ${filtersBtnBorder} hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2 shrink-0`}
          >
            <span className="font-haas text-[#172338] text-[14px]">Filters</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#172338]" />
          </button>
        </div>

        <div className="flex flex-col w-full md:w-[160px] shrink-0">
          {!isPageGrid && (
            <label className="block font-haas text-[#172338] text-sm md:text-base mb-2"> </label>
          )}
          <button
            type="button"
            onClick={() => {
              locationDropdownRef.current?.close();
              void router.push(`/concierge/list?${buildQueryParams().toString()}`, undefined, {
                shallow: true,
                scroll: false,
              });
            }}
            className="h-[52px] w-full md:w-[160px] bg-[#7CF5EE] hover:brightness-95 transition flex items-center justify-center gap-2 shrink-0"
          >
            <span className="font-haas text-[#172338] text-[14px] whitespace-nowrap">Show Services</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#172338] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
