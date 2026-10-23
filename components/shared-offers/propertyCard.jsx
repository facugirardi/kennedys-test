import { Check, EuroIcon, ChevronRight } from "lucide-react"
import { MdOutlineCalendarMonth as CalendarIcon } from "react-icons/md";
import { resolveMediaUrl, formatPropertyAreaLocationCountry } from "@/lib/utils";
import { buildRentalDetailUrl, buildRealEstateDetailPath } from "@/lib/rentalRoute";
import {
    formatOfferTotalDisplay,
    getVillaOfferOfficialTotal,
    getVillaOfferFinalTotal,
    formatVillaOfferDiscountLabel,
    villaOfferShowInitialDiscountRows,
} from "@/lib/offerVillaPriceDisplay";
import { formatPoolsJacuzziSpecLine } from "@/lib/propertyPoolCounts";


export default function PropertyCard({
    handleSelect,
    property,
    displayTitle,
    subtitle = undefined,
    /** Vista shared properties: debajo del título, valores area + region (Location en el form) + country, separados por coma, sin etiquetas. */
    showAreaRegionCountry = false,
    disableSelect,
    containerClassName = '',
    isSelected,
    showPrice, // Si no se especifica, usar price_visibility de la propiedad
    showDateBadge = true,
    onNavigate, // Función opcional para navegar cuando disableSelect es true
    /** EUR | USD — ofertas compartidas */
    currency = "EUR",
}) {


    const toggleSelect = () => {
        handleSelect && handleSelect(!isSelected, property)
    }

    // Determinar si mostrar el precio basado en showPrice prop o price_visibility de la propiedad
    const shouldShowPrice = showPrice !== undefined 
        ? showPrice 
        : (property?.price_visibility !== false && property?.priceVisibility !== false);

    // Función para obtener el precio por noche de la propiedad (prefer property_price_ranges when available)
    const getPricePerNight = () => {
        // Primero intentar obtener el precio directo de la propiedad (API may set this from property_price_ranges for the selected date range)
        if (property?.price_per_night) {
            return property.price_per_night;
        }
        // Then try priceRanges (property_price_ranges) - first range with price
        if (Array.isArray(property?.priceRanges) && property.priceRanges.length > 0) {
            const firstWithPrice = property.priceRanges.find((r) => r?.price_per_night != null && Number(r.price_per_night) > 0);
            if (firstWithPrice?.price_per_night) return Number(firstWithPrice.price_per_night);
        }
        // Fallback: availabilityRanges (legacy)
        if (Array.isArray(property?.availabilityRanges) && property.availabilityRanges.length > 0) {
            const availableRange = property.availabilityRanges.find(
                (range) => range.is_available && range.price_per_night
            );
            if (availableRange?.price_per_night) return availableRange.price_per_night;
            const firstWithPrice = property.availabilityRanges.find((range) => range.price_per_night);
            if (firstWithPrice?.price_per_night) return firstWithPrice.price_per_night;
        }
        return null;
    };

    // Función para generar la URL de detalle en kennedys-website
    const getPropertyDetailUrl = () => {
        if (!property?.id) return '';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_HOST_URL || '';
        // Para propiedades rental, usar /villas/[id]
        const isRealEstate = property?.rental === false || property?.category === 'real-estate';
        if (isRealEstate) {
            return `${baseUrl}${buildRealEstateDetailPath(property)}`;
        } else {
            return buildRentalDetailUrl(property, baseUrl);
        }
    };

    const handleImageClick = (e) => {
        // Si disableSelect es true y hay una función onNavigate, usarla
        if (disableSelect && onNavigate) {
            e.stopPropagation();
            onNavigate(property);
            return;
        }
        // Si no está en modo disableSelect, usar la lógica normal
        if (!disableSelect) {
            const url = getPropertyDetailUrl();
            if (url) {
                window.open(url, '_blank');
            }
        }
    };

    // Prefer primary image (isPrimary), else first image, else mainImage
    const getPrimaryImage = () => {
        const imgs = property?.images;
        if (Array.isArray(imgs) && imgs.length > 0) {
            const primary = imgs.find((i) => i?.isPrimary);
            const img = primary || imgs[0];
            return img?.urlImage || img?.url || null;
        }
        return property?.mainImage || null;
    };
    const primaryImage =
        resolveMediaUrl(getPrimaryImage() || property?.images?.[0]?.urlImage || property?.images?.[0]?.url) ||
        "/placeholder-image.png";

    const nightsFromApi = Number(property?.nights) > 0 ? Number(property.nights) : 0;
    let nightsFromDates = 0;
    if (property?.startDate && property?.endDate) {
        nightsFromDates = Math.max(
            1,
            Math.ceil(
                (new Date(property.endDate).getTime() - new Date(property.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
            )
        );
    }
    const nightsBadge = nightsFromApi > 0 ? nightsFromApi : nightsFromDates > 0 ? nightsFromDates : null;
    /** Mínimo 1 para dividir totales sin dividir por 0 */
    const nightsCount = Math.max(1, nightsFromApi || nightsFromDates || 1);
    const nights = nightsCount;

    const pricePerNightFromOfferFinal = () => {
        if (property?.category === "real-estate" || property?.rental === false) return null;
        const client =
            Number(property?.finalPrice) > 0
                ? Number(property.finalPrice)
                : Number(property?.officialPrice) > 0
                  ? Number(property.officialPrice)
                  : null;
        if (client != null && client > 0 && nightsCount > 0) {
            return client / nightsCount;
        }
        return null;
    };

    const pricePerNight = pricePerNightFromOfferFinal() ?? getPricePerNight();
    const isRealEstate = property?.category === 'real-estate' || property?.rental === false;
    const salePrice = property?.sale_price ?? property?.price;
    const totalPrice =
        property?.finalPrice ??
        property?.officialPrice ??
        property?.grossRate ??
        (isRealEstate && salePrice ? salePrice : null) ??
        (pricePerNight && nights
            ? pricePerNight * nights
            : null);

    const formatCurrency = (value) => {
        if (value === null || value === undefined) {
            return "—";
        }
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) {
            return "—";
        }
        return Number(numValue).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Precio original antes del descuento (para mostrar tachado)
    const getOriginalPriceBeforeDiscount = () => {
        let discountPct = Number(property?.discount ?? property?.discountShare ?? 0);
        if (discountPct > 0 && discountPct <= 1) discountPct *= 100; // 0.2 → 20
        const finalP = property?.finalPrice ?? property?.officialPrice;
        const gross = Number(property?.grossRate ?? 0);
        if (discountPct > 0 && finalP != null && !isNaN(Number(finalP))) {
            const pct = 1 - discountPct / 100;
            if (pct > 0) return Math.round((Number(finalP) / pct) * 100) / 100;
        }
        if (gross > 0) {
            return Math.round(gross * 100) / 100;
        }
        return null;
    };
    const originalPrice = getOriginalPriceBeforeDiscount();
    const showStrikethrough = shouldShowPrice && originalPrice != null && totalPrice != null &&
        Number(totalPrice) < Number(originalPrice) && Number(totalPrice) > 0;

    const offerCurrency =
        property?.currency === "USD" || property?.currency === "EUR"
            ? property.currency
            : currency;
    const currencyNorm = offerCurrency === "USD" ? "USD" : "EUR";
    const positiveNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
    };
    const showOfferPriceBreakdown =
        shouldShowPrice &&
        !isRealEstate &&
        (positiveNum(property?.grossRate) ||
            positiveNum(property?.finalPrice) ||
            positiveNum(property?.officialPrice));
    const finalOfferTotal = showOfferPriceBreakdown
        ? positiveNum(getVillaOfferFinalTotal(property)) ??
          positiveNum(property?.finalPrice) ??
          positiveNum(property?.officialPrice) ??
          positiveNum(property?.grossRate)
        : null;
    const officialOfferTotal = showOfferPriceBreakdown
        ? positiveNum(getVillaOfferOfficialTotal(property)) ?? finalOfferTotal
        : null;
    const discountOfferLabel = showOfferPriceBreakdown ? formatVillaOfferDiscountLabel(property, currencyNorm) : "";
    const useOfferBreakdown =
        showOfferPriceBreakdown && finalOfferTotal != null && finalOfferTotal > 0;
    const showInitialDiscountRows =
        useOfferBreakdown &&
        villaOfferShowInitialDiscountRows(
            property,
            currencyNorm,
            officialOfferTotal,
            finalOfferTotal
        );
    const perNightFromFinal =
        useOfferBreakdown && finalOfferTotal != null && nightsCount > 0
            ? finalOfferTotal / nightsCount
            : null;

    const securityDepositAmt = Number(property?.securityDeposit);
    const showSecurityDeposit =
        shouldShowPrice &&
        Number.isFinite(securityDepositAmt) &&
        securityDepositAmt > 0;

    const legacyPerNightFromTotal =
        !isRealEstate &&
        totalPrice != null &&
        Number(totalPrice) > 0 &&
        nightsCount > 1
            ? Number(totalPrice) / nightsCount
            : null;

    // Función para obtener el número de bedrooms
    const getBedrooms = () => {
        // Prioridad: property.bedrooms > classification.bedrooms
        const bedrooms = property?.bedrooms ?? property?.classification?.bedrooms;
        return bedrooms !== null && bedrooms !== undefined ? Number(bedrooms) : 0;
    };

    const poolsSpecLabel = formatPoolsJacuzziSpecLine(property?.classification);

    // Función para obtener el número de guests
    const getGuests = () => {
        // Priorizar el campo actualizado en Property (guests) y luego fallback a classification.maxPersons
        const parseGuestValue = (value) => {
            if (value === null || value === undefined) return null;
            if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
            const numMatch = String(value).match(/\d+/);
            if (!numMatch) return null;
            const parsed = Number.parseInt(numMatch[0], 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
        };

        const guestsFromProperty =
            parseGuestValue(property?.guests) ??
            parseGuestValue(property?.maxGuests) ??
            parseGuestValue(property?.max_guests);
        const guestsFromClassification = parseGuestValue(property?.classification?.maxPersons);
        return guestsFromProperty ?? guestsFromClassification ?? 0;
    };

    const cardTitle = displayTitle ?? property?.displayTitle ?? property?.title ?? "Property";
    const cardSubtitle = subtitle ?? property?.displaySubtitle ?? property?.location ?? property?.visibleLocation;

    const subtitleUnderTitle = showAreaRegionCountry
        ? formatPropertyAreaLocationCountry(property || {}) || cardSubtitle || null
        : cardSubtitle || null;

    // Villa custom (offer-scoped, itemType "customVilla"): brochure PDF or pasted website/brochure link.
    const rawBrochureLink = property?.brochureLink || property?.brochureUrl || property?.brochure?.url;
    const brochureUrl = resolveMediaUrl(rawBrochureLink);
    // Uploaded PDFs are always stored as a relative "uploads/..." path; a raw http(s) value means it was pasted as a link.
    const isBrochureExternalLink =
        typeof rawBrochureLink === "string" &&
        /^https?:\/\//i.test(rawBrochureLink.trim()) &&
        !rawBrochureLink.includes("/uploads/");
    const websiteUrl = typeof property?.websiteLink === "string" ? property.websiteLink.trim() : "";
    // Default label reads "View Personalized Offer"; editable per offer item via the "Brochure" column in Loggia.
    // Offers saved before that field existed have brochureName auto-filled with the uploaded file's
    // name (e.g. "villa-brochure.pdf") — treat anything that looks like a filename as "not set".
    const rawBrochureName = typeof property?.brochureName === "string" ? property.brochureName.trim() : "";
    const brochureNameLooksLikeFilename = /\.(pdf|docx?|jpe?g|png|gif|webp)$/i.test(rawBrochureName);
    const brochureDisplayName = rawBrochureName && !brochureNameLooksLikeFilename
        ? rawBrochureName
        : "Personalized Offer";
    const brochureButtonLabel = isBrochureExternalLink ? "View Link" : `View ${brochureDisplayName}`;

    return (
        <div className={`w-full bg-white border border-gray-200 property-card grid grid-rows-subgrid row-span-4 ${containerClassName}`}>
            <div className="relative">
                <img
                    className="w-full h-[200px] sm:h-[260px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    src={primaryImage}
                    alt={cardTitle || "Property image"}
                    onClick={handleImageClick}
                />
                {!disableSelect && <button
                    className={`absolute top-4 right-4 p-2 w-6 h-6 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#D99330]' : 'bg-white border border-gray-300'}`}
                    onClick={toggleSelect}
                    aria-label={isSelected ? "Deselect property" : "Select property"}
                >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                </button>}
                {disableSelect && (showDateBadge || property?.label) && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                        {showDateBadge && (
                            <div className="bg-white px-3 py-1.5 text-xs">
                                <p className="flex items-center gap-2 text-[#172338]">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        {property?.startDate && property?.endDate
                                            ? (() => {
                                                const s = new Date(property.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                const e = new Date(property.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                return s === e ? s : `${s} – ${e}`;
                                              })()
                                            : "Dates"}
                                    </span>
                                    <span className="font-normal">
                                        {nightsBadge != null ? `${nightsBadge} Nights` : "—"}
                                    </span>
                                </p>
                            </div>
                        )}
                        {property?.label && (
                            <div className="bg-white px-3 py-1.5">
                                <p className="font-haas text-xs text-[#172338] leading-snug">{property.label}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="px-5 pt-4 flex flex-col gap-1">
                <h2 className="font-gtsuper-ds text-xl font-light text-[#172338] leading-snug">
                    {cardTitle}
                </h2>
                {subtitleUnderTitle ? (
                    <p className="font-haas text-[calc(0.875rem+2pt)] text-[#506A70] leading-snug">
                        {subtitleUnderTitle}
                    </p>
                ) : null}
                <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-[#D99330]">{getBedrooms()} Bedrooms</span>
                    {!isRealEstate ? (
                        <>
                            <span className="text-[#D99330] opacity-40">|</span>
                            <span className="text-[#D99330]">{getGuests()} Guests</span>
                        </>
                    ) : null}
                    {poolsSpecLabel && poolsSpecLabel !== "0 Pools" ? (
                        <>
                            <span className="text-[#D99330] opacity-40">|</span>
                            <span className="text-[#D99330]">{poolsSpecLabel}</span>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="px-5">
                {useOfferBreakdown ? (
                    <div className="pt-2">
                        <div className="border-t border-gray-100 mb-4" />
                        <div className="flex flex-col items-stretch gap-1.5 w-full">
                        {showInitialDiscountRows ? (
                            <>
                                <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 w-full text-xs font-haas">
                                    <span className="text-[#506A70] shrink-0">Initial price</span>
                                    <span
                                        className={`font-medium tabular-nums text-right ${
                                            officialOfferTotal != null &&
                                            finalOfferTotal != null &&
                                            officialOfferTotal > finalOfferTotal
                                                ? "text-gray-400 line-through"
                                                : "text-[#172338]"
                                        }`}
                                    >
                                        {formatOfferTotalDisplay(officialOfferTotal ?? finalOfferTotal, currencyNorm) ?? "—"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 w-full text-xs font-haas">
                                    <span className="text-[#506A70] shrink-0">Discount</span>
                                    <span className="text-[#172338] font-medium tabular-nums text-right">{discountOfferLabel}</span>
                                </div>
                            </>
                        ) : null}
                        <div
                            className={`flex flex-wrap justify-between gap-x-3 gap-y-0.5 w-full font-haas ${
                                showInitialDiscountRows ? "pt-1 border-t border-gray-100" : ""
                            }`}
                        >
                            <span className="text-[#172338] text-base shrink-0">Total price</span>
                            <span className="text-[#172338] text-base tabular-nums text-right">
                                {formatOfferTotalDisplay(finalOfferTotal, currencyNorm)}
                            </span>
                        </div>
                        {nightsCount > 1 && perNightFromFinal != null ? (
                            <p className="text-[#506A70] text-xs font-haas leading-snug">
                                <span className="text-[#172338] font-medium tabular-nums">
                                    {formatOfferTotalDisplay(perNightFromFinal, currencyNorm)}
                                </span>
                                <span className="text-[#506A70]"> / night</span>
                                <span className="text-[#506A70]">
                                    {" "}
                                    · {nightsBadge ?? nightsCount} nights
                                </span>
                            </p>
                        ) : null}
                        {showSecurityDeposit ? (
                            <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 w-full text-xs font-haas pt-0.5">
                                <span className="text-[#506A70] shrink-0">Security deposit</span>
                                <span className="text-[#172338] font-medium tabular-nums text-right">
                                    {formatOfferTotalDisplay(securityDepositAmt, currencyNorm)}
                                </span>
                            </div>
                        ) : null}
                        </div>
                    </div>
                ) : shouldShowPrice ? (
                    <div className="pt-2">
                        <div className="border-t border-gray-100 mb-4" />
                        <div className="flex flex-col items-start gap-0.5">
                        <p className="flex items-center gap-1.5 flex-wrap font-haas">
                            {showStrikethrough ? (
                                <span className="flex items-center gap-2 flex-wrap items-baseline">
                                    <span className="text-xs text-gray-400 line-through font-normal tabular-nums">
                                        {formatOfferTotalDisplay(originalPrice, currencyNorm)}
                                    </span>
                                    <span className="text-[#172338] text-xl font-semibold tabular-nums">
                                        {formatOfferTotalDisplay(totalPrice, currencyNorm)}
                                    </span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[#172338] text-lg font-normal">
                                    <EuroIcon width={16} height={16} className="flex-shrink-0 text-[#172338]" />
                                    {totalPrice != null && totalPrice > 0
                                        ? (!isRealEstate && nights <= 1 ? `${formatCurrency(totalPrice)} / Night` : formatCurrency(totalPrice))
                                        : !isRealEstate && pricePerNight != null && pricePerNight > 0
                                            ? `${formatCurrency(pricePerNight)} / Night`
                                            : "Price on request"}
                                </span>
                            )}
                        </p>
                        {legacyPerNightFromTotal != null ? (
                            <p className="text-[#506A70] text-xs font-haas leading-snug">
                                <span className="text-[#172338] font-medium tabular-nums">
                                    {formatOfferTotalDisplay(legacyPerNightFromTotal, currencyNorm)}
                                </span>
                                <span className="text-[#506A70]"> / night</span>
                                <span className="text-[#506A70]">
                                    {" "}
                                    · {nightsBadge ?? nightsCount} nights
                                </span>
                            </p>
                        ) : null}
                        {showSecurityDeposit ? (
                            <p className="text-[#506A70] text-xs font-haas w-full">
                                Security deposit: {formatOfferTotalDisplay(securityDepositAmt, currencyNorm)}
                            </p>
                        ) : null}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="px-5 pb-6 flex flex-col h-full">
                {(() => {
                    const hasBottomText = typeof property?.bottomCardText === "string" && property.bottomCardText.trim();
                    const villaServices = !isRealEstate && Array.isArray(property?.classification?.includedServices) && property.classification.includedServices.length > 0
                        ? property.classification.includedServices
                        : null;
                    const extraServices = !isRealEstate && typeof property?.classification?.extraServices === "string" && property.classification.extraServices.trim()
                        ? property.classification.extraServices.trim()
                        : null;
                    if (!hasBottomText && !villaServices && !extraServices) return null;
                    return (
                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                            {hasBottomText ? (
                                <div
                                    className="text-[#506A70] text-[calc(0.8125rem+1pt)] font-haas leading-relaxed [&_p]:m-0"
                                    dangerouslySetInnerHTML={{ __html: property.bottomCardText.trim() }}
                                />
                            ) : null}
                            {villaServices ? (
                                <div className={hasBottomText ? "pt-2 border-t border-gray-100" : ""}>
                                    <p className="font-haas text-xs tracking-widest uppercase text-[#506A70] mb-1.5">Included villa services</p>
                                    <ul className="flex flex-col gap-0.5">
                                        {villaServices.map((svc, i) => (
                                            <li key={i} className="font-haas text-sm text-[#172338] flex items-start gap-1.5">
                                                <span className="text-[#D99330] mt-0.5 flex-shrink-0">·</span>
                                                <span>{svc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {extraServices ? (
                                <div className={hasBottomText || villaServices ? "pt-2 border-t border-gray-100" : ""}>
                                    <p className="font-haas text-xs tracking-widest uppercase text-[#506A70] mb-1.5">Extra included services</p>
                                    <ul className="flex flex-col gap-0.5">
                                        {extraServices.split('\n').filter((line) => line.trim()).map((line, i) => (
                                            <li key={i} className="font-haas text-sm text-[#172338] flex items-start gap-1.5">
                                                <span className="text-[#D99330] mt-0.5 flex-shrink-0">·</span>
                                                <span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    );
                })()}
                {(brochureUrl || websiteUrl) && (
                    <div className="pt-4 flex flex-row gap-2 mt-auto">
                        {brochureUrl && (
                            <a
                                href={brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-none bg-[#28F6EA] hover:bg-[#28F6EA]/90 transition-colors font-haas text-[15px] font-normal text-[#172338]"
                            >
                                {brochureButtonLabel}
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        )}
                        {websiteUrl && (
                            <a
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-none border border-[#172338] hover:bg-[#172338] hover:text-white transition-colors font-haas text-[15px] font-normal text-[#172338]"
                            >
                                View Website
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
