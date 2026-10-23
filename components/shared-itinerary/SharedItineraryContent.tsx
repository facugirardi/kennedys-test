"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/custom/footerNew";
import { cn, resolveMediaUrl } from "@/lib/utils";

// ─── Utilities ───────────────────────────────────────────────────────────────

function formatTimeDisplay(t?: string | null): string {
  if (t == null || String(t).trim() === "") return "";
  const s = String(t).trim();
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export function asStringList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return p.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    } catch {
      return [v.trim()];
    }
    return [v.trim()];
  }
  return [];
}

export function htmlHasContent(v?: string | null): boolean {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s) return false;
  if (/<(img|iframe|video|audio|source|svg|picture)\b/i.test(s)) return true;
  const text = s.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;|&#xa0;/gi, " ").replace(/\s+/g, " ").trim();
  return text.length > 0;
}

export function RichHtml({ html, className }: { html?: string | null; className?: string }) {
  const trimmed = typeof html === "string" ? html.trim() : "";
  if (!htmlHasContent(trimmed)) return null;
  return (
    <div
      className={cn(
        "text-sm text-[#506A70] leading-relaxed [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#D99330] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-[#172338]",
        className
      )}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}

export function toIsoDateOnly(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatDateOnlyLabel(value: unknown, opts?: { withYear?: boolean; withWeekday?: boolean }): string {
  const iso = toIsoDateOnly(value);
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00.000Z`);
  return d.toLocaleDateString("en-US", {
    ...(opts?.withWeekday ? { weekday: "long" as const } : {}),
    month: opts?.withYear ? "short" : "long",
    day: "numeric",
    ...(opts?.withYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  });
}

function ordinalDay(value: unknown): { day: string; suffix: string; weekday: string; month: string } {
  const iso = toIsoDateOnly(value);
  if (!iso) return { day: "—", suffix: "", weekday: "", month: "" };
  const d = new Date(`${iso}T00:00:00.000Z`);
  const n = d.getUTCDate();
  const suffix = n === 1 || n === 21 || n === 31 ? "st" : n === 2 || n === 22 ? "nd" : n === 3 || n === 23 ? "rd" : "th";
  return {
    day: String(n),
    suffix,
    weekday: d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toUpperCase(),
    month: d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }).toUpperCase(),
  };
}

function bookingMediaUrl(b: Record<string, unknown>): string | null {
  const raw = (b.imageUrl ?? b.image_url) as string | null | undefined;
  if (raw != null && String(raw).trim() !== "") return resolveMediaUrl(String(raw).trim());
  const main = (b.mainImage ?? b.main_image) as string | null | undefined;
  if (main != null && String(main).trim() !== "") return resolveMediaUrl(String(main).trim());
  const imgs = b.images ?? b.Images;
  if (Array.isArray(imgs)) {
    for (const row of imgs) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const u = (o.urlImage ?? o.url_image ?? o.url) as string | null | undefined;
      if (u != null && String(u).trim() !== "") return resolveMediaUrl(String(u).trim());
    }
  }
  return null;
}

/** CSS object-position ("X% Y%" or "center") set by manually dragging the photo in the booking editor; mobile-only, desktop always stays centered. */
function bookingMobileImagePosition(b: Record<string, unknown>): string {
  const raw = (b.mobileImagePosition ?? b.mobile_image_position) as string | null | undefined;
  const v = String(raw ?? "").trim();
  return v || "center";
}

// ─── BookingModal ─────────────────────────────────────────────────────────────

function BookingModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgUrl = bookingMediaUrl(booking);
  const mobileImgObjectPosition = bookingMobileImagePosition(booking);
  const stRaw = formatTimeDisplay(booking.startTime ?? booking.start_time);
  const etRaw = formatTimeDisplay(booking.endTime ?? booking.end_time);
  const sameTime = Boolean(stRaw && etRaw && stRaw === etRaw);
  const st = sameTime ? "" : stRaw;
  const et = sameTime ? "" : etRaw;
  const addr = (booking.address ?? "").trim();
  const cf = (booking.confirmedFor ?? booking.confirmed_for ?? "").trim();
  const cb = (booking.confirmedBy ?? booking.confirmed_by ?? "").trim();
  const cancel = booking.CancellationPolicy ?? booking.cancellation_policy ?? "";
  const importantNotes = booking.importantNotes ?? booking.important_notes;
  const collaboratorNotes = booking.collaboratorNotes ?? booking.collaborator_notes;
  const hasAddr = htmlHasContent(addr);
  const hasCancel = htmlHasContent(cancel);
  const hasImportantNotes = htmlHasContent(importantNotes);
  const hasCollaboratorNotes = htmlHasContent(collaboratorNotes);
  const guestsRaw = booking.numberOfGuests ?? booking.number_of_guests;
  const numberOfGuests = guestsRaw != null && String(guestsRaw).trim() !== "" && Number(guestsRaw) > 0 ? Number(guestsRaw) : null;
  const reservationStatus = typeof (booking.reservationStatus ?? booking.reservation_status) === "string" && (booking.reservationStatus ?? booking.reservation_status).trim() !== "" ? (booking.reservationStatus ?? booking.reservation_status).trim() : null;
  const paymentLink = typeof (booking.paymentLink ?? booking.payment_link) === "string" && (booking.paymentLink ?? booking.payment_link).trim() !== "" ? (booking.paymentLink ?? booking.payment_link).trim() : null;
  const bookingStart = booking.startDate ?? booking.start_date;
  const bookingEnd = booking.endDate ?? booking.end_date;
  const priceRaw = booking.price;
  const priceNum = priceRaw !== null && priceRaw !== undefined && String(priceRaw).trim() !== "" ? Number(priceRaw) : NaN;
  const hasNotes = hasImportantNotes || hasCollaboratorNotes;

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] h-full w-full flex items-center justify-center bg-black/70 overflow-hidden"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-white w-full h-full max-w-none max-h-none flex flex-col md:flex-row overflow-hidden shadow-2xl rounded-none">
        <button
          onClick={onClose}
          aria-label="Go back"
          className="absolute top-4 left-6 md:left-10 z-20 inline-flex items-center gap-2 h-10 md:h-9 pl-3 pr-4 bg-white transition-colors rounded-none border border-gray-300 hover:border-[#172338] shadow-sm text-sm font-medium text-[#172338]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go back
        </button>

        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 md:max-w-[calc(100%-512px-80px)] pb-6 md:pb-0">
          {imgUrl && (
            <div className="relative h-56 shrink-0 md:hidden">
              <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: mobileImgObjectPosition }} />
            </div>
          )}

          <div className="px-6 md:px-10 pt-16 md:pt-24 pb-5 md:pb-8">
            {(st || et) && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D99330] mb-3">
                {st || "—"}{et ? ` – ${et}` : ""}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-gtsuper-ds font-light text-[#172338] leading-tight pr-10">{booking.title}</h2>
            {bookingStart && (
              <p className="mt-3 text-sm text-[#506A70]">
                {formatDateOnlyLabel(bookingStart, { withYear: true })}
                {bookingEnd && bookingEnd !== bookingStart ? ` — ${formatDateOnlyLabel(bookingEnd, { withYear: true })}` : ""}
              </p>
            )}
            {!Number.isNaN(priceNum) && priceNum > 0 && (
              <p className="text-[#D99330] text-xl md:text-2xl font-light mt-4 tracking-tight">
                € {priceNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            )}
            {(numberOfGuests != null || reservationStatus != null) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {numberOfGuests != null && (
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs text-[#506A70]">
                    {numberOfGuests} guest{numberOfGuests === 1 ? "" : "s"}
                  </span>
                )}
                {reservationStatus != null && (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                    reservationStatus.toLowerCase() === "booked"
                      ? "bg-green-100 text-green-700"
                      : reservationStatus.toLowerCase() === "pending confirmation" || reservationStatus.toLowerCase() === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-[#E4EAF6] text-[#506A70]"
                  )}>
                    {reservationStatus}
                  </span>
                )}
              </div>
            )}
          </div>

          {((booking.menuUrl ?? booking.menu_url ?? booking.menuLink ?? booking.menu_link) || (booking.instagramUrl ?? booking.instagram_url) || paymentLink) ? (
            <div className="flex flex-wrap gap-3 px-6 md:px-10 pb-6">
              {(booking.menuUrl ?? booking.menu_url ?? booking.menuLink ?? booking.menu_link) && (
                <a href={booking.menuUrl ?? booking.menu_url ?? booking.menuLink ?? booking.menu_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#172338] text-white text-sm rounded-full hover:bg-[#172338]/90 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Menu
                </a>
              )}
              {(booking.instagramUrl ?? booking.instagram_url) && (
                <a href={booking.instagramUrl ?? booking.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#172338]/20 text-[#172338] text-sm rounded-full hover:bg-gray-50 transition-colors">
                  Instagram
                </a>
              )}
              {paymentLink && (
                <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D99330] text-white text-sm rounded-full hover:bg-[#D99330]/90 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Pay now
                </a>
              )}
            </div>
          ) : null}

          <div className="mx-6 md:mx-10 h-px bg-gray-200" />

          {htmlHasContent(booking.description) && (
            <div className="px-6 md:px-10 py-5 md:py-7">
              <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-3">Description</p>
              <RichHtml html={booking.description} className="text-base leading-relaxed text-[#506A70]" />
            </div>
          )}

          {(hasAddr || cf || cb) && (
            <div className="mx-6 md:mx-10 border-t border-gray-200 pt-6 pb-10 grid grid-cols-1 gap-5">
              {hasAddr && (
                <div className="flex gap-3">
                  <div className="w-px bg-[#D99330] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-1">Address</p>
                    <div className="text-sm text-[#172338] [&_a]:underline [&_a]:text-[#198092] [&_p]:m-0" dangerouslySetInnerHTML={{ __html: addr }} />
                  </div>
                </div>
              )}
              {cf && (
                <div className="flex gap-3">
                  <div className="w-px bg-[#D99330] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-1">Confirmed for</p>
                    <p className="text-sm text-[#172338]">{cf}</p>
                  </div>
                </div>
              )}
              {cb && (
                <div className="flex gap-3">
                  <div className="w-px bg-[#D99330] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-1">Confirmed by</p>
                    <p className="text-sm text-[#172338]">{cb}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(hasCancel || hasNotes) && (
            <div className="mx-6 md:mx-10 border-t border-gray-200 pt-6 pb-16 space-y-6">
              {hasImportantNotes && (
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-2">Important Notes</p>
                  <RichHtml html={importantNotes} className="text-sm text-[#506A70]" />
                </div>
              )}
              {hasCancel && (
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-2">Cancellation Policy</p>
                  <RichHtml html={cancel} className="text-sm text-[#506A70]" />
                </div>
              )}
              {hasCollaboratorNotes && (
                <div>
                  <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-2">Collaborator Notes</p>
                  <RichHtml html={collaboratorNotes} className="text-sm text-[#506A70]" />
                </div>
              )}
            </div>
          )}
        </div>

        {imgUrl && (
          <div className="hidden md:block w-[592px] shrink-0 relative">
            <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  itinerary: any | null;
  loading?: boolean;
  error?: boolean;
}

export default function SharedItineraryContent({ itinerary, loading, error }: Props) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const shell = (inner: ReactNode) => (
    <div className="flex flex-col min-h-screen w-full bg-white text-gray-900 font-haas">
      <header className="sticky top-0 z-[100] w-full shrink-0 border-b border-[#e6e8ed] border-t-[5px] border-t-[#D99330] bg-white shadow-sm">
        <nav className="mx-auto flex h-14 max-w-[1440px] items-center px-4 md:h-16 md:px-12" aria-label="Site navigation">
          <Link href="/" className="inline-flex items-center py-2 transition-opacity hover:opacity-90">
            <img src="/images/capa-1-3.svg" alt="Kennedy's Group" className="max-h-8 w-auto max-w-[200px] object-contain object-left md:max-h-9" />
          </Link>
        </nav>
      </header>
      <div className="flex-1">{inner}</div>
      <Footer disableTravelSection={true} />
    </div>
  );

  if (loading) {
    return shell(
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 border-2 border-[#D99330] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#506A70] tracking-wide uppercase">Loading itinerary</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return shell(
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-[#F6F4F0] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#506A70]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-xl font-gtsuper-ds font-light text-[#172338] mb-2">Itinerary not found</h1>
          <p className="text-sm text-[#506A70]">The link may be invalid or the itinerary is not published.</p>
        </div>
      </div>
    );
  }

  const imageUrl = itinerary.imageUrl ? resolveMediaUrl(itinerary.imageUrl) : null;
  const title = itinerary.title || itinerary.name || "Itinerary";
  const destination = itinerary.destination || "";
  const startDate = itinerary.startDate ? formatDateOnlyLabel(itinerary.startDate, { withYear: true }) : "";
  const endDate = itinerary.endDate ? formatDateOnlyLabel(itinerary.endDate, { withYear: true }) : "";
  const days = Array.isArray(itinerary.days)
    ? [...itinerary.days].sort((a: any, b: any) => toIsoDateOnly(a?.date).localeCompare(toIsoDateOnly(b?.date)))
    : [];
  const staff = asStringList(itinerary.staff);
  const colleagues = asStringList(itinerary.colleagues);

  const apiPrice = itinerary.totalPrice ?? itinerary.price ?? itinerary.budget ?? null;
  const totalPrice = apiPrice != null && Number.isFinite(Number(apiPrice))
    ? Number(apiPrice)
    : days.reduce((sum: number, day: any) => {
        return sum + (day.bookings || []).reduce((s: number, b: any) => {
          const n = Number(b.price);
          return s + (Number.isFinite(n) ? n : 0);
        }, 0);
      }, 0);

  const bookingPhotos: { url: string; title: string; mobilePosition: string }[] = [];
  for (const day of days) {
    for (const b of day.bookings || []) {
      const url = bookingMediaUrl(b as Record<string, unknown>);
      if (url) bookingPhotos.push({ url, title: b.title || "", mobilePosition: bookingMobileImagePosition(b as Record<string, unknown>) });
    }
  }
  const galleryRow = bookingPhotos.slice(0, 4);
  const carouselSlides: { url: string; title: string; mobilePosition: string }[] = [
    ...(imageUrl ? [{ url: imageUrl, title: "", mobilePosition: "center" }] : []),
    ...bookingPhotos,
  ];

  return shell(
    <>
      {/* Title block */}
      <div className="px-4 md:px-[80px] pt-10 md:pt-16 pb-8 md:pb-12 flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-5xl font-gtsuper-ds font-light text-[#172338] leading-tight tracking-wide">
            {title}
          </h1>
          {itinerary.description && (
            <RichHtml html={itinerary.description} className="mt-10 text-lg text-[#506A70]" />
          )}
        </div>
        <div className="shrink-0 md:text-right space-y-2 md:space-y-3 md:pt-1">
          {destination && (
            <p className="text-lg md:text-xl font-normal text-[#172338]">{destination}</p>
          )}
          {(startDate || endDate) && (
            <p className="flex items-center md:justify-end gap-2 text-sm md:text-base text-[#506A70]">
              <svg className="w-4 h-4 text-[#506A70] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate}{endDate && startDate !== endDate ? ` - ${endDate}` : ""}
            </p>
          )}
          {totalPrice > 0 && (
            <p className="text-3xl md:text-[40px] font-light text-[#D99330] leading-none">
              € {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* Hero + Gallery */}
      <>
        {/* Mobile carousel */}
        <div className="md:hidden">
          {carouselSlides.length > 0 ? (
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setCarouselIdx(Math.round(el.scrollLeft / el.offsetWidth));
                }}
              >
                {carouselSlides.map((slide, idx) => (
                  <div key={idx} className="relative w-full shrink-0 h-[280px] snap-start bg-[#172338]">
                    <Image src={slide.url} alt={slide.title} fill className="object-cover" style={{ objectPosition: slide.mobilePosition }} priority={idx === 0} sizes="100vw" unoptimized={slide.url.startsWith("http")} />
                  </div>
                ))}
              </div>
              {carouselSlides.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        carouselRef.current?.scrollTo({ left: idx * carouselRef.current.offsetWidth, behavior: "smooth" });
                        setCarouselIdx(idx);
                      }}
                      className={cn("w-1.5 h-1.5 rounded-full transition-all", idx === carouselIdx ? "bg-white w-4" : "bg-white/50")}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-[280px] bg-gradient-to-br from-[#172338] to-[#0d1825]" />
          )}
        </div>

        {/* Desktop: hero + grid */}
        <div className="hidden md:block">
          <div className="md:px-[80px]">
            <div className="relative w-full h-[520px] bg-[#172338] overflow-hidden">
              {imageUrl ? (
                <Image src={imageUrl} alt="" fill className="object-cover" priority sizes="100vw" unoptimized={imageUrl.startsWith("http")} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#172338] to-[#0d1825]" />
              )}
            </div>
          </div>
          {galleryRow.length > 0 && (
            <div className="md:px-[80px] pt-1">
              <div className="grid grid-cols-4 gap-1">
                {galleryRow.map((photo, idx) => (
                  <div key={idx} className="relative aspect-[4/3] overflow-hidden bg-[#172338]">
                    <Image src={photo.url} alt={photo.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="25vw" unoptimized={photo.url.startsWith("http")} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>

      {/* Main content */}
      <main className="py-10 md:py-14 w-full space-y-8">

        {(itinerary.pdfFile || staff.length > 0 || colleagues.length > 0) && (
          <div className="px-4 md:px-[80px]">
            <div className="bg-white border border-gray-100 overflow-hidden">
              {itinerary.pdfFile && resolveMediaUrl(itinerary.pdfFile) && (
                <div className="p-6 md:p-8">
                  <a
                    href={resolveMediaUrl(itinerary.pdfFile) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#172338] text-white text-sm rounded-full hover:bg-[#172338]/90 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              )}
              {(staff.length > 0 || colleagues.length > 0) && (
                <div className={cn("grid gap-6 sm:grid-cols-2 px-6 md:px-8 py-6", itinerary.pdfFile && "border-t border-gray-200")}>
                  {staff.length > 0 && (
                    <div>
                      <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-3">Staff</p>
                      <ul className="space-y-1.5">
                        {staff.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#172338]">
                            <span className="w-1 h-1 rounded-full bg-[#D99330] shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {colleagues.length > 0 && (
                    <div>
                      <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#D99330] mb-3">Colleagues</p>
                      <ul className="space-y-1.5">
                        {colleagues.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#172338]">
                            <span className="w-1 h-1 rounded-full bg-[#D99330] shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {days.length > 0 && (
          <div className="px-4 md:px-[80px] space-y-3">
            {days.map((day: any, dayIdx: number) => {
              const { day: dayNum, suffix, weekday, month } = ordinalDay(day.date);
              const dayBookings = [...(day.bookings || [])]
                .filter((b: any) => !b.hiddenFromClient && !b.hidden_from_client)
                .sort((a: any, b: any) => (Number(a.position) || 0) - (Number(b.position) || 0));
              if (dayBookings.length === 0) return null;
              return (
                <div key={day.id ?? dayIdx} className="bg-[#F6F8FB] overflow-hidden">
                  <div className={cn("flex", dayBookings.length === 1 ? "items-center" : "items-stretch")}>
                    <div className={cn("w-[72px] md:w-[160px] shrink-0 flex flex-col items-center justify-center px-2 md:px-4 text-center bg-[#172338]", dayBookings.length === 1 ? "py-4" : "py-6 md:py-8")}>
                      <span className="text-[9px] md:text-[13px] font-gtsuper-ds font-medium text-white/60 uppercase tracking-widest">{weekday}</span>
                      <div className="text-white font-gtsuper-ds font-light leading-none mt-0.5 md:mt-1 mb-[10px]">
                        <span className="text-4xl md:text-6xl">{dayNum}</span>
                        <span className="text-base md:text-2xl align-super">{suffix}</span>
                      </div>
                      <span className="text-[10px] md:text-[13px] font-gtsuper-ds font-medium text-white uppercase tracking-widest">{month}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-evenly">
                      {dayBookings.map((b: any, bIdx: number) => {
                        const stRaw = formatTimeDisplay(b.startTime ?? b.start_time);
                        const etRaw = formatTimeDisplay(b.endTime ?? b.end_time);
                        const sameTime = Boolean(stRaw && etRaw && stRaw === etRaw);
                        const st = sameTime ? "" : stRaw;
                        const et = sameTime ? "" : etRaw;
                        const timeLabel = st ? `${st}${et ? ` – ${et}` : ""}` : "";
                        const bStatus = ((b.reservationStatus ?? b.reservation_status) ?? "").trim();
                        const bStatusLower = bStatus.toLowerCase();
                        const bStatusClass = bStatusLower === "booked"
                          ? "bg-green-100 text-green-700"
                          : bStatusLower === "pending confirmation" || bStatusLower === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "";
                        return (
                          <div key={b.id ?? bIdx}>
                            {bIdx > 0 && <div className="h-px bg-[#172338]/10 mx-4 md:mx-8" />}
                            <button
                              type="button"
                              onClick={() => setActiveBooking(b)}
                              className={cn("w-full flex items-center gap-3 md:gap-5 px-4 md:px-8 text-left hover:bg-white/60 transition-colors group", dayBookings.length === 1 ? "py-4" : "py-4 md:py-5")}
                            >
                              {(st || et) && (
                                <span className="shrink-0 font-semibold text-[#172338] w-auto md:w-[110px] text-xs md:text-base leading-tight">
                                  {st && et ? (
                                    <span className="flex flex-col md:block">
                                      <span>{st}</span>
                                      <span className="text-[#172338]/40 md:text-[#172338]">
                                        <span className="hidden md:inline"> – </span>
                                        {et}
                                      </span>
                                    </span>
                                  ) : (
                                    <span>{st || et}</span>
                                  )}
                                </span>
                              )}
                              <span className="flex-1 text-base text-[#172338] min-w-0">{b.title}</span>
                              <span className="shrink-0 flex items-center gap-0 md:gap-2">
                                {bStatus && bStatusClass && (
                                  <span className={cn("hidden md:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-tight", bStatusClass)}>
                                    {bStatus}
                                  </span>
                                )}
                                <span className="flex flex-col items-center gap-1">
                                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#48A4B4] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                  {bStatus && bStatusClass && (
                                    <span className={cn("md:hidden inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-center leading-tight", bStatusClass)}>
                                      {bStatus}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeBooking && (
          <BookingModal booking={activeBooking} onClose={() => setActiveBooking(null)} />
        )}
      </main>
    </>
  );
}
