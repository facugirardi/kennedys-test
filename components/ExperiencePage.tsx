"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { GoHeart } from "react-icons/go";
import { BsShare } from "react-icons/bs";
import { cn, slugify } from "@/lib/utils";
import { getActiveExperiences, getExperienceById, getExperiencesByCity } from "@/lib/api/experiences";
import { isExperienceDetailSegment } from "@/lib/experienceRouting";
import {
  experienceViewFallbackMock,
  mapExperienceToView,
  type ExperienceViewModel,
} from "@/lib/experienceViewMap";
import { VillaInquireModal } from "@/components/villa/VillaInquireModal";
import type { Property } from "@/interfaces/property";
import { SITE_NAME } from "@/lib/seo/config";
import { useExperienceLikes } from "@/src/hooks/useExperienceLikes";

/** YYYY-MM-DD en calendario local (misma convención que villa detail). */
function formatDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ImageGalleryModal = dynamic(() => import("@/components/custom/ImageGalleryModal"), { ssr: false });
const ImageGalleryGridModal = dynamic(() => import("@/components/custom/ImageGalleryGridModal"), {
  ssr: false,
});
const PropertyMapWithSidePanel = dynamic(() => import("@/components/custom/PropertyMapWithSidePanel"), {
  ssr: false,
});

export function ExperiencePage({
  citySlug: citySlugProp,
  experienceId: experienceIdProp,
  initialCityExperiences: initialCityExperiencesProp,
  initialExperienceSlug: initialExperienceSlugProp,
}: {
  citySlug?: string;
  experienceId?: string;
  /** SSR: active experiences for this location (segment), already filtered by API */
  initialCityExperiences?: Record<string, unknown>[] | null;
  /** SSR query ?experience=slug — pick default listing card */
  initialExperienceSlug?: string | null;
} = {}) {
  const router = useRouter();
  const {
    isLiked,
    toggleFavorite,
    pendingIds,
    error: likesError,
    clearError: clearLikesError,
  } = useExperienceLikes();
  const [data, setData] = useState<ExperienceViewModel>(() => {
    const list = initialCityExperiencesProp;
    const slugPick = initialExperienceSlugProp;
    if (list?.length && citySlugProp) {
      let sel: unknown = list[0];
      if (slugPick) {
        const hit = list.find((e) => (e as { slug?: string }).slug === slugPick);
        if (hit) sel = hit;
      }
      return mapExperienceToView(
        sel,
        list as any[],
        slugify(citySlugProp) || citySlugProp.toLowerCase()
      );
    }
    return experienceViewFallbackMock;
  });
  const [checkIn, setCheckIn] = useState(() => formatDateInputValue(new Date()));
  const [checkOut, setCheckOut] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDateInputValue(nextWeek);
  });
  const [isPlanCalendarOpen, setIsPlanCalendarOpen] = useState(false);
  const [planCalendarMonth, setPlanCalendarMonth] = useState(() => new Date());
  const [planHoverDate, setPlanHoverDate] = useState<Date | null>(null);
  const planCalendarRef = useRef<HTMLDivElement | null>(null);
  const planCalendarPortalRef = useRef<HTMLDivElement | null>(null);
  const [planCalendarPos, setPlanCalendarPos] = useState<{ top: number; left: number } | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryGridOpen, setGalleryGridOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [experienceInquireOpen, setExperienceInquireOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionNeedsToggle, setDescriptionNeedsToggle] = useState(false);
  const descriptionMeasureRef = useRef<HTMLParagraphElement | null>(null);

  const planIsSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const planGetCalendarDays = (year: number, month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const planTodayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const planHandleDayClick = (day: Date) => {
    if (day < planTodayMidnight) return;
    const dayStr = formatDateInputValue(day);
    const start = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
    const end = checkOut ? new Date(`${checkOut}T00:00:00`) : null;
    if (!start || (start && end)) {
      setCheckIn(dayStr);
      setCheckOut("");
    } else {
      if (day < start) {
        setCheckIn(dayStr);
        setCheckOut("");
      } else if (planIsSameDay(day, start)) {
        setCheckIn("");
        setCheckOut("");
      } else {
        setCheckOut(dayStr);
        setTimeout(() => setIsPlanCalendarOpen(false), 120);
      }
    }
  };

  const updatePlanCalendarPosition = useCallback(() => {
    const root = planCalendarRef.current;
    if (!root || typeof window === "undefined") return;
    const rect = root.getBoundingClientRect();
    const panelW = 280;
    const gutter = 8;
    let left = rect.left;
    left = Math.min(left, window.innerWidth - panelW - gutter);
    left = Math.max(gutter, left);
    setPlanCalendarPos({ top: rect.bottom + 4, left });
  }, []);

  useLayoutEffect(() => {
    if (!isPlanCalendarOpen) {
      setPlanCalendarPos(null);
      return;
    }
    updatePlanCalendarPosition();
  }, [isPlanCalendarOpen, updatePlanCalendarPosition]);

  useEffect(() => {
    if (!isPlanCalendarOpen) return;
    window.addEventListener("scroll", updatePlanCalendarPosition, true);
    window.addEventListener("resize", updatePlanCalendarPosition);
    return () => {
      window.removeEventListener("scroll", updatePlanCalendarPosition, true);
      window.removeEventListener("resize", updatePlanCalendarPosition);
    };
  }, [isPlanCalendarOpen, updatePlanCalendarPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (planCalendarRef.current?.contains(t)) return;
      if (planCalendarPortalRef.current?.contains(t)) return;
      setIsPlanCalendarOpen(false);
    };
    if (isPlanCalendarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPlanCalendarOpen]);

  useLayoutEffect(() => {
    const el = descriptionMeasureRef.current;
    if (!el || !data.description?.trim()) {
      setDescriptionNeedsToggle(false);
      return;
    }
    if (descriptionExpanded) {
      return;
    }
    const measure = () => {
      const needs = el.scrollHeight > el.clientHeight + 2;
      setDescriptionNeedsToggle(needs);
    };
    const id = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame(measure) : 0;
    return () => {
      if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(id as number);
    };
  }, [data.description, descriptionExpanded]);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [data.description]);

  const openGalleryAtViewerIndex = (index: number) => {
    const urls = data.galleryViewerUrls;
    if (index < 0 || index >= urls.length) return;
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const isExperienceDetailRoute = Boolean(experienceIdProp);

  const locationSummaryForMap = data.locationSummary;

  const experienceInquiryProperty = useMemo((): Property => {
    const imgs = data.galleryViewerUrls.filter((u) => u && String(u).trim()).slice(0, 4);
    const images = imgs.map((url) => ({ urlImage: url }));
    const loc = String(data.locationSummary || data.cityLabel || "").trim();
    return {
      id: data.experienceId ?? "experience",
      title: data.title || "",
      images,
      visibleLocation: loc,
      location: loc,
      classification: { idealPersons: 2 },
    };
  }, [
    data.galleryViewerUrls,
    data.locationSummary,
    data.cityLabel,
    data.title,
    data.experienceId,
  ]);

  function relatedExperienceHref(r: (typeof data.related)[number]): string | null {
    if (r.id) return `/experiences/${encodeURIComponent(r.id)}`;
    if (r.slug && r.listingCitySlug) {
      return `/experiences/${encodeURIComponent(r.listingCitySlug)}?experience=${encodeURIComponent(r.slug)}`;
    }
    if (r.listingCitySlug) return `/experiences/${encodeURIComponent(r.listingCitySlug)}`;
    return null;
  }

  useEffect(() => {
    const load = async () => {
      const segment =
        router.isReady && typeof router.query.segment === "string"
          ? router.query.segment
          : undefined;

      const experienceId =
        experienceIdProp ||
        (segment && isExperienceDetailSegment(segment) ? segment : undefined);

      const cityRaw =
        citySlugProp ||
        (segment && !isExperienceDetailSegment(segment) ? segment : undefined);
      const cityParam = cityRaw ? cityRaw.toLowerCase() : undefined;

      const experienceSlug =
        typeof router.query.experience === "string"
          ? router.query.experience
          : undefined;

      if (experienceId) {
        const res = await getExperienceById(experienceId);
        if (!res?.success || !res.data) {
          return;
        }
        const exp: any = res.data;
        let all: any[] = [];
        if (exp?.city) {
          const byCity = await getExperiencesByCity(String(exp.city).toLowerCase());
          if (byCity?.success && Array.isArray(byCity.data)) {
            all = byCity.data;
          }
        }
        if (all.length === 0) {
          const act = await getActiveExperiences();
          if (act?.success && Array.isArray(act.data)) {
            all = act.data;
          }
        }
        const mapped = mapExperienceToView(
          exp,
          all,
          (typeof exp?.city === "string" && exp.city.trim() ? slugify(exp.city) : "") ||
            cityParam ||
            ""
        );
        setData(mapped);
        return;
      }

      if (!cityParam) {
        return;
      }

      const response = await getExperiencesByCity(cityParam);

      if (!response?.success || !Array.isArray(response.data) || response.data.length === 0) {
        return;
      }

      const experiences: any[] = response.data;
      let selected = experiences[0];

      if (experienceSlug) {
        const bySlug = experiences.find((e) => e?.slug === experienceSlug);
        if (bySlug) {
          selected = bySlug;
        }
      }

      const mapped = mapExperienceToView(selected, experiences, slugify(cityParam) || cityParam);
      setData(mapped);
    };

    if (!experienceIdProp && !citySlugProp && !router.isReady) return;

    void load();
  }, [router.isReady, router.query.segment, router.query.experience, citySlugProp, experienceIdProp]);

  const experienceSaved =
    Boolean(data.experienceId) && Boolean(isLiked(data.experienceId ?? undefined));
  const experienceSavePending =
    Boolean(data.experienceId) &&
    pendingIds.has(String(data.experienceId));

  const handleShareExperience = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = data.title?.trim() || SITE_NAME;
    if (navigator.share) {
      void navigator.share({ title, url }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [data.title]);

  const experienceListBackHref = useMemo(() => {
    const slug = (data.citySlug || "").trim().toLowerCase();
    if (!slug) return "/experiences/list";
    return `/experiences/list?city=${encodeURIComponent(slug)}`;
  }, [data.citySlug]);

  /** URLs dedupeadas (misma fuente que el lightbox). */
  const experiencePhotoUrls = useMemo(
    () => data.galleryViewerUrls.filter((u) => u && String(u).trim()),
    [data.galleryViewerUrls]
  );
  const experiencePhotoCount = experiencePhotoUrls.length;
  const showHeroSideThumbs = experiencePhotoCount >= 2;
  /** En la 2.ª celda lateral: más de 2 fotos en total → +N con N = total − 2. */
  const experienceHeroMoreCount =
    experiencePhotoCount > 2 ? experiencePhotoCount - 2 : 0;

  const experienceBookingPrice = useMemo(() => {
    const primaryTrimmed = String(data.price ?? "").trim();
    if (primaryTrimmed) {
      return {
        primary: primaryTrimmed,
        secondary: String(data.priceSuffix ?? "").trim(),
      };
    }
    return { primary: "Price on request", secondary: "" };
  }, [data.price, data.priceSuffix]);

  return (
    <div className="w-full flex flex-col gap-7 md:gap-14 max-w-[1440px] mx-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
      <ImageGalleryModal
        images={data.galleryViewerUrls}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        propertyTitle={data.title}
      />
      <ImageGalleryGridModal
        images={data.galleryViewerUrls}
        isOpen={galleryGridOpen}
        onClose={() => setGalleryGridOpen(false)}
        onImageClick={(index) => {
          setGalleryGridOpen(false);
          openGalleryAtViewerIndex(index);
        }}
        propertyTitle={data.title}
      />

      {/* Hero + columna lateral; 2 fotos = sin hueco duplicado; &gt;2 = 2ª celda con +N. */}
      <section className="pt-2 md:pt-0 px-3 sm:px-4 md:px-[52px] flex flex-col gap-3 md:gap-4">
        {isExperienceDetailRoute ? (
          <Link
            href={experienceListBackHref}
            prefetch={false}
            className="inline-flex items-center gap-2 font-haas font-light text-sm text-[#506A70] hover:text-[#172338] hover:opacity-90 w-fit touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5 text-[#172338]" aria-hidden />
            <span>Go back to list</span>
          </Link>
        ) : null}
        {(experiencePhotoUrls[0] || data.hero) ? (
          <div
            className={cn(
              "grid grid-cols-1 gap-2 md:gap-5",
              showHeroSideThumbs ? "md:grid-cols-3" : "md:grid-cols-1"
            )}
          >
            <button
              type="button"
              className={cn(
                "h-[min(58vw,260px)] sm:h-[300px] md:h-[520px] overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28F6EA] focus-visible:ring-offset-2 text-left p-0 border-0 bg-transparent rounded-none touch-manipulation",
                showHeroSideThumbs ? "md:col-span-2" : "md:col-span-1 w-full"
              )}
              onClick={() => openGalleryAtViewerIndex(0)}
              aria-label="Open image gallery"
            >
              <img
                src={experiencePhotoUrls[0] || data.hero}
                alt=""
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover bg-[#eef2f6]"
              />
            </button>
            {showHeroSideThumbs ? (
              <div
                className={cn(
                  "grid gap-2 md:gap-5 h-[min(28vw,120px)] sm:h-[144px] md:h-[520px]",
                  experiencePhotoCount === 2
                    ? "grid-cols-1 grid-rows-1 md:grid-cols-1 md:grid-rows-1"
                    : "grid-cols-2 md:grid-cols-1 md:grid-rows-2"
                )}
              >
                <button
                  type="button"
                  onClick={() => openGalleryAtViewerIndex(1)}
                  className="overflow-hidden h-full min-h-[100px] md:min-h-0 bg-[#eef2f6] text-left border-0 rounded-none cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28F6EA] focus-visible:ring-offset-2 p-0"
                  aria-label="Open image gallery"
                >
                  <img
                    src={experiencePhotoUrls[1]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>

                {experiencePhotoCount >= 3 ? (
                  experienceHeroMoreCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setGalleryGridOpen(true)}
                      className="relative overflow-hidden h-full min-h-[100px] md:min-h-0 bg-[#506A70]/25 text-left border-0 rounded-none cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28F6EA] focus-visible:ring-offset-2 p-0"
                      aria-label="View all photos"
                    >
                      {experiencePhotoUrls[2] ? (
                        <img
                          src={experiencePhotoUrls[2]}
                          alt=""
                          className="h-full w-full scale-105 object-cover blur-sm"
                          aria-hidden
                        />
                      ) : null}
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center px-2",
                          experiencePhotoUrls[2] ? "bg-black/45" : "bg-[#506A70]/40"
                        )}
                      >
                        <span className="text-center font-haas text-base font-semibold leading-tight text-white md:text-lg">
                          +{experienceHeroMoreCount}{" "}
                          {experienceHeroMoreCount === 1 ? "photo" : "photos"}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openGalleryAtViewerIndex(2)}
                      className="overflow-hidden h-full min-h-[100px] md:min-h-0 bg-[#eef2f6] text-left border-0 rounded-none cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28F6EA] focus-visible:ring-offset-2 p-0"
                      aria-label="Open image gallery"
                    >
                      <img
                        src={experiencePhotoUrls[2]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Title + booking row; included block follows below */}
      <div className="flex flex-col gap-0">
      {/* Title + content + booking card */}
      <section className="px-4 sm:px-5 md:px-[52px]">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-[1.65rem] leading-[1.15] tracking-tight sm:text-3xl md:text-[40px] font-gtsuper-ds font-light text-[#172338]">
              {data.title}
            </h1>
            <div className="mt-4 md:mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
              {data.cityLabel ? (
                <p className="text-[14px] font-medium text-[#172338] mb-0">{data.cityLabel}</p>
              ) : null}
              {data.duration ? (
                <p className="text-[14px] font-medium text-[#172338] mb-0">{data.duration}</p>
              ) : null}
              <div className="flex flex-col items-end gap-1 text-[#506A70] md:hidden ml-auto max-w-[min(100%,12rem)]">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full font-haas font-light gap-2 active:bg-[#f1f5f9] hover:opacity-90 disabled:opacity-40"
                    aria-pressed={experienceSaved}
                    aria-label={experienceSaved ? "Remove from saved experiences" : "Save experience"}
                    disabled={!data.experienceId || experienceSavePending}
                    onClick={() => data.experienceId && void toggleFavorite(String(data.experienceId))}
                  >
                    <GoHeart
                      size={22}
                      aria-hidden
                      className={experienceSaved ? "text-[#ef4444]" : undefined}
                    />
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full font-haas font-light active:bg-[#f1f5f9] hover:opacity-90"
                    aria-label="Share this experience"
                    onClick={handleShareExperience}
                  >
                    <BsShare size={20} aria-hidden />
                  </button>
                </div>
                {likesError ? (
                  <button
                    type="button"
                    className="text-right text-sm text-[#D04444] underline underline-offset-2"
                    onClick={clearLikesError}
                  >
                    {likesError}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 md:mt-4 max-w-[75ch]">
              <div
                ref={descriptionMeasureRef}
                className={cn(
                  "font-haas font-light text-[#172338] text-[15px] sm:text-base leading-relaxed md:leading-7 m-0",
                  "[&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:font-medium",
                  !descriptionExpanded && "line-clamp-6"
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(data.description) }}
              />
              {(descriptionNeedsToggle || descriptionExpanded) && (
                <button
                  type="button"
                  className="mt-3 font-haas text-sm font-light text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-80"
                  aria-expanded={descriptionExpanded}
                  aria-label={descriptionExpanded ? "Collapse description" : "Expand description"}
                  onClick={() => setDescriptionExpanded((v) => !v)}
                >
                  {descriptionExpanded ? "View less" : "View more"}
                </button>
              )}
            </div>
          </div>

          {/* Booking card */}
          <div className="w-full mt-5 md:mt-0 md:w-[400px] shrink-0 flex flex-col">
            <div className="hidden md:flex flex-col gap-1 text-[#506A70] mb-[60px] items-end">
              <div className="flex gap-6 justify-end">
                <button
                  type="button"
                  className="flex items-center font-haas font-light gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed min-h-[44px] hover:opacity-80 transition-opacity"
                  aria-pressed={experienceSaved}
                  disabled={!data.experienceId || experienceSavePending}
                  onClick={() => data.experienceId && void toggleFavorite(String(data.experienceId))}
                >
                  <GoHeart size={22} className={experienceSaved ? "text-[#ef4444]" : undefined} />
                  <span>{experienceSaved ? "Saved" : "Save"}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center font-haas font-light gap-2 cursor-pointer min-h-[44px] hover:opacity-80 transition-opacity"
                  onClick={handleShareExperience}
                >
                  <BsShare size={20} aria-hidden />
                  <span>Share</span>
                </button>
              </div>
              {likesError ? (
                <button
                  type="button"
                  className="text-sm text-[#D04444] underline underline-offset-2"
                  onClick={clearLikesError}
                >
                  {likesError}
                </button>
              ) : null}
            </div>
          <aside className="w-full bg-[#F5F8FE] h-fit rounded-none border border-[#e8ecf2]/80 md:border-0 shadow-sm md:shadow-none overflow-visible">
            <div className="px-4 py-5 sm:px-5 sm:py-5 md:px-5">
              <h3 className="text-center text-xl sm:text-2xl font-gtsuper-ds text-[#3B4B53] mb-4">
                BOOK THIS EXPERIENCE
              </h3>
              <div className="relative mb-5" ref={planCalendarRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsPlanCalendarOpen((p) => {
                      const next = !p;
                      if (!p && checkIn) {
                        const d = new Date(`${checkIn}T12:00:00`);
                        setPlanCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                      }
                      return next;
                    })
                  }
                  className="w-full h-[44px] border border-[#506A70] bg-white px-3 flex items-center justify-between text-left"
                >
                  <span className="font-haas text-sm text-[#172338] truncate">
                    {checkIn && checkOut
                      ? `${checkIn} – ${checkOut}`
                      : checkIn
                        ? `${checkIn} –`
                        : "Select dates"}
                  </span>
                  <Calendar size={15} className="text-[#506A70] shrink-0 ml-2" />
                </button>

                {typeof document !== "undefined" &&
                  isPlanCalendarOpen &&
                  planCalendarPos &&
                  createPortal(
                    <div
                      ref={planCalendarPortalRef}
                      role="dialog"
                      aria-label="Select dates"
                      className="fixed z-[200] bg-white border border-[#506A70] shadow-xl p-4 w-[280px]"
                      style={{ top: planCalendarPos.top, left: planCalendarPos.left }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() =>
                            setPlanCalendarMonth(
                              new Date(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth() - 1)
                            )
                          }
                          className="p-1 hover:bg-[#EEF2F6] transition"
                        >
                          <ChevronRight size={16} className="text-[#172338] rotate-180" />
                        </button>
                        <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                          {planCalendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPlanCalendarMonth(
                              new Date(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth() + 1)
                            )
                          }
                          className="p-1 hover:bg-[#EEF2F6] transition"
                        >
                          <ChevronRight size={16} className="text-[#172338]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                          <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-400 py-1">
                            {d}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7">
                        {planGetCalendarDays(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth()).map(
                          (day, i) => {
                            if (!day) return <div key={`empty-${i}`} />;
                            const isPast = day < planTodayMidnight;
                            const startDate = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
                            const endDate = checkOut ? new Date(`${checkOut}T00:00:00`) : null;
                            const isStart = startDate && planIsSameDay(day, startDate);
                            const isEnd = endDate && planIsSameDay(day, endDate);
                            const inRange =
                              startDate && endDate && day > startDate && day < endDate;
                            const isHovered =
                              startDate && !endDate && planHoverDate && day > startDate && day <= planHoverDate;
                            const disabled = isPast;
                            return (
                              <button
                                key={`day-${i}`}
                                type="button"
                                disabled={disabled}
                                onClick={() => planHandleDayClick(day)}
                                onMouseEnter={() => !disabled && setPlanHoverDate(day)}
                                onMouseLeave={() => setPlanHoverDate(null)}
                                className={[
                                  "text-center text-xs font-haas font-thin py-1.5 transition select-none",
                                  disabled ? "text-gray-300 cursor-not-allowed" : "cursor-pointer",
                                  isStart || isEnd ? "bg-[#D99330] text-white" : "",
                                  inRange ? "bg-[#EEF2F6] text-[#172338]" : "",
                                  isHovered && !inRange && !isStart && !isEnd ? "bg-[#f5f8fa] text-[#172338]" : "",
                                  !disabled && !isStart && !isEnd && !inRange && !isHovered
                                    ? "hover:bg-[#EEF2F6] text-[#172338]"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {day.getDate()}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setCheckIn("");
                            setCheckOut("");
                          }}
                          className="text-xs font-haas font-thin text-[#172338] underline"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPlanCalendarOpen(false)}
                          className="text-xs font-haas font-thin text-[#172338] font-medium"
                        >
                          Done
                        </button>
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
              <div className="mb-5">
                <div className="text-center text-[#D99330] text-lg sm:text-xl font-gtsuper-ds font-medium leading-snug">
                  {experienceBookingPrice.primary}
                </div>
                {experienceBookingPrice.secondary ? (
                  <div className="text-center text-[#506A70] font-haas text-xs mt-0.5">
                    {experienceBookingPrice.secondary}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                disabled={!data.experienceId || !data.title?.trim()}
                onClick={() => {
                  if (!data.experienceId || !data.title?.trim()) return;
                  setExperienceInquireOpen(true);
                }}
                className="w-full bg-[#28F6EA] text-[#172338] min-h-[48px] rounded-none py-3.5 md:py-3 font-haas font-medium text-[15px] md:text-lg md:font-light hover:bg-[#1fd1c5] disabled:opacity-45 disabled:pointer-events-none transition touch-manipulation flex items-center justify-center gap-1"
              >
                Make a Request <ChevronRight size={18} className="inline-block shrink-0" />
              </button>
            </div>
          </aside>
          </div>
        </div>
      </section>

      {/* Included + Things to know — spaced below description/booking */}
      {(data.included.length > 0 || data.know.length > 0 || data.cancellationPolicy) && (
      <section className="px-4 sm:px-5 md:px-[52px] mt-12 border-t border-[#e8ecf2] pt-8 md:mt-10 md:border-t-0 md:pt-0">
        <div className="bg-[#F5F8FE] px-4 py-5 sm:px-6 sm:py-6 md:px-10 md:py-8 w-full md:w-[62.5%] rounded-none border border-[#e8ecf2]/60 md:border-0">
          {data.included.length > 0 && (
            <>
              <h2 className="font-gtsuper-ds text-[20px] sm:text-[22px] md:text-[24px] text-[#172338] mb-3">
                What is included?
              </h2>
              <ul className="space-y-3 text-[#3B4B53] font-haas text-[15px] sm:text-[16px] leading-relaxed md:leading-6">
                {data.included.map((item: any, idx: number) => (
                  <li key={idx} className="list-disc ml-4 sm:ml-5 pl-0.5 marker:text-[#D99330]">
                    <span>{item.title}</span>
                    {Array.isArray(item.sub) && item.sub.length > 0 && (
                      <div className="mt-1 pl-5">
                        {item.sub.map((s: string, i: number) => (
                          <p key={i} className="text-[14px] leading-5">
                            {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {data.know.length > 0 && (
            <>
              <h2 className={`font-gtsuper-ds text-[20px] sm:text-[22px] md:text-[24px] text-[#172338] mb-3${data.included.length > 0 ? ' mt-8 md:mt-10' : ''}`}>
                Things to Know
              </h2>
              <ul className="space-y-3 text-[#3B4B53] font-haas text-[15px] sm:text-[16px] leading-relaxed md:leading-6">
                {data.know.map((item, idx) => (
                  <li key={idx} className="list-disc ml-4 sm:ml-5 pl-0.5 marker:text-[#D99330]">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {data.cancellationPolicy && (
            <div className="mt-6 pt-5 border-t border-[#dce6ee]/80 md:border-0 md:pt-0">
              <p className="text-[#172338] font-haas text-[13px] sm:text-sm font-semibold">Cancellation policy</p>
              <p className="text-[#3B4B53] font-haas text-[13px] sm:text-sm leading-relaxed mt-1">
                {data.cancellationPolicy}
              </p>
            </div>
          )}
        </div>
      </section>
      )}
      </div>

      {/* Photo Gallery Section */}
      {experiencePhotoUrls.length > 0 ? (
        <section className="w-full bg-[#F0F3F5] px-4 py-8 md:px-32 md:py-12">
          <h2 className="mb-5 text-center font-gtsuper-ds text-2xl font-light text-[#172338] md:mb-7 md:text-[32px]">
            More Photos
          </h2>
          {(() => {
            const n = experiencePhotoUrls.length;
            const title = data.title ?? '';
            const imgBtn = (idx: number, className: string) => (
              <button
                key={idx}
                type="button"
                onClick={() => openGalleryAtViewerIndex(idx)}
                className={`overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] p-0 border-0 bg-transparent ${className}`}
                aria-label="Open photo gallery"
              >
                <img
                  src={experiencePhotoUrls[idx]}
                  alt={idx === 0 ? title : `${title} - ${idx + 1}`}
                  className="h-full w-full object-cover transition duration-300 hover:opacity-90"
                />
              </button>
            );

            // 1 image — full width, 16:9
            if (n === 1) {
              return <div className="aspect-[16/9] w-full">{imgBtn(0, 'w-full h-full')}</div>;
            }

            // 2 images — equal halves, 4:3 each
            if (n === 2) {
              return (
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="aspect-[4/3]">{imgBtn(i, 'w-full h-full')}</div>
                  ))}
                </div>
              );
            }

            // 3 images — big left (aspect 4:3) + 2 stacked right
            if (n === 3) {
              return (
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <div className="aspect-[4/3]">{imgBtn(0, 'w-full h-full')}</div>
                  <div className="grid grid-rows-2 gap-2" style={{ aspectRatio: '1/1.5' }}>
                    {[1, 2].map((i) => (
                      <div key={i} className="overflow-hidden">{imgBtn(i, 'w-full h-full')}</div>
                    ))}
                  </div>
                </div>
              );
            }

            // 4+ images — big top (16:9) + row of thumbnails (fixed height)
            const moreCount = Math.max(0, n - 4);
            const previewSrc = experiencePhotoUrls[4] ?? experiencePhotoUrls[n - 1];
            return (
              <div className="flex flex-col gap-2">
                <div className="aspect-[16/9] w-full">{imgBtn(0, 'w-full h-full')}</div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3].map((i) => {
                    const src = experiencePhotoUrls[i];
                    if (!src) return <div key={i} aria-hidden />;
                    return <div key={i} className="aspect-[4/3]">{imgBtn(i, 'w-full h-full')}</div>;
                  })}
                  {moreCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => setGalleryGridOpen(true)}
                      className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#506A70]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] p-0 border-0"
                      aria-label="View all photos"
                    >
                      {previewSrc && <img src={previewSrc} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm" aria-hidden />}
                      <div className={`absolute inset-0 flex items-center justify-center px-2 ${previewSrc ? 'bg-black/45' : 'bg-[#506A70]/40'}`}>
                        <span className="text-center font-haas text-sm font-semibold text-white">
                          +{moreCount} {moreCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })()}
        </section>
      ) : null}

      {/* Other Experiences — solo si hay al menos 4 */}
      {data.related.length >= 4 ? (
      <section className="px-4 sm:px-5 md:px-[52px] pb-16 md:pb-24 mt-10 md:mt-[60px]">
        <h2 className="text-center font-gtsuper-ds font-light text-[26px] sm:text-[30px] md:text-[36px] text-[#3B4B53] mb-5 md:mb-6 px-2">
          Other Experiences
        </h2>
         <div className="relative md:px-10">
          <button
            type="button"
            aria-label="Previous"
             className="hidden md:flex absolute -left-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-[#506A70] text-[#506A70] items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#506A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            role="region"
            aria-label="Other experiences"
            className={cn(
              "flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6",
              "overflow-x-auto md:overflow-visible overscroll-x-contain pb-2 md:pb-0",
              "snap-x snap-mandatory md:snap-none touch-pan-x",
              "scroll-pl-4 scroll-pr-4 sm:scroll-pl-5 sm:scroll-pr-5 md:scroll-pl-0 md:scroll-pr-0",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "md:px-0"
            )}
          >
            {data.related.map((r, idx) => {
              const href = relatedExperienceHref(r);
              const cardInner = (
                <>
                  <div className="h-[240px] overflow-hidden bg-gray-100 rounded-none">
                    <img
                      src={r.img}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                    />
                  </div>
                  <div className="mt-3 px-0">
                    <h3 className="text-[#172338] font-haas text-[14px] group-hover:text-[#506A70] transition-colors">
                      {r.title}
                    </h3>
                    <div className="mt-2 flex flex-col gap-2">
                      <span className="h-px w-full bg-[#172338] transition-colors group-hover:bg-[#506A70]" />
                      <span className="text-sm underline text-[#172338] self-end group-hover:text-[#506A70] transition-colors">
                        More info
                      </span>
                    </div>
                  </div>
                </>
              );
              const carouselSlide =
                "shrink-0 snap-start w-[min(280px,calc(100vw-3.5rem))] sm:w-[min(280px,calc(100vw-4.5rem))] md:w-auto md:shrink md:snap-none";
              const cardShell =
                "group block rounded-none outline-none border-0 bg-transparent shadow-none overflow-visible md:transition-shadow md:hover:shadow-[0_12px_40px_rgba(23,35,56,0.12)] focus-visible:ring-2 focus-visible:ring-[#28F6EA] focus-visible:ring-offset-2 [&_*]:cursor-pointer touch-manipulation";
              return href ? (
                <Link
                  key={`${href}-${idx}`}
                  href={href}
                  prefetch={false}
                  style={{ cursor: "pointer" }}
                  className={cn(carouselSlide, cardShell)}
                >
                  <article className="h-full" style={{ cursor: "pointer" }}>
                    {cardInner}
                  </article>
                </Link>
              ) : (
                <article
                  key={`${r.title}-${idx}`}
                  className={cn(carouselSlide, "group cursor-default overflow-visible")}
                >
                  {cardInner}
                </article>
              );
            })}
            <div className="shrink-0 w-4 sm:w-5 md:hidden" aria-hidden />
          </div>
          <button
            type="button"
            aria-label="Next"
             className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-[#506A70] text-[#506A70] items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#506A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
      ) : null}
      {Boolean(data.experienceId && data.title?.trim()) && (
        <VillaInquireModal
          isOpen={experienceInquireOpen}
          onClose={() => setExperienceInquireOpen(false)}
          property={experienceInquiryProperty}
          inquiryMode="experience"
          experienceId={data.experienceId}
          experienceDuration={data.duration?.trim() ? data.duration.trim() : null}
          defaultCheckIn={checkIn || undefined}
          defaultCheckOut={checkOut || undefined}
        />
      )}
    </div>
  );
}

export default ExperiencePage;

