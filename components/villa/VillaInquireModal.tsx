"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { trackContactFormSubmit } from "@/lib/utils/googleAdsConversions"
import { createPortal } from "react-dom"
import { useForm, Controller } from "react-hook-form"
import { format, parseISO, isValid } from "date-fns"
import { Calendar, X } from "lucide-react"
import { TbBed, TbBath, TbUser, TbPool } from "react-icons/tb"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button1"
import Label from "@/components/label"
import { VillaFilterDateRangeCalendar } from "@/components/custom/VillaFilterDateRangeCalendar"
import { createProporsal } from "@/lib/api/proporsal"
import { resolveMediaUrl, formatCurrency } from "@/lib/utils"
import type { Property } from "@/interfaces/property"

const VILLA_PHONE_DISPLAY = "+30 698 096 0467"
const VILLA_PHONE_TEL = "+306980960467"
const CONCIERGE_EMAIL = "concierge@kennedysgroup.com"
const VILLA_EMAIL = "reservations@kennedysgroup.com"
const inputClass =
  "w-full h-12 bg-white border border-[#172338] px-3 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] rounded-none focus:outline-none focus:ring-1 focus:ring-[#172338]/20"
const dateButtonClass = `${inputClass} flex h-12 items-center justify-between gap-2 text-left`

const DATE_FLEXIBILITY_OPTIONS = [
  { value: "exact", label: "Exact date" },
  { value: "flexible-2", label: "Flexible ± 2 days" },
  { value: "flexible-week", label: "Flexible ± 1 week" },
  { value: "fully-flexible", label: "Fully flexible" },
] as const

type DateFlexibility = (typeof DATE_FLEXIBILITY_OPTIONS)[number]["value"]

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  guestCount: string
  dateFlexibility: DateFlexibility
  message: string
  privacyPolicy: boolean
}

function parseYmdToDate(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  try {
    const d = parseISO(s)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}

export type VillaInquireModalProps = {
  isOpen: boolean
  onClose: () => void
  property: Property
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultGuests?: number
  /** Same `/proporsal` flow & recipients as villas; distinguishes leads in CRM. */
  inquiryMode?: "villa" | "experience"
  /** When `inquiryMode` is experience, echoed in outbound message body (avoid storing in propertyids UUID[]). */
  experienceId?: string | null
  experienceDuration?: string | null
  /** Nightly price for a given check-in date (yyyy-MM-dd). Mirrors the booking widget logic. */
  getNightlyPrice?: (checkInStr: string) => number | null
  /** Currency symbol for price formatting (e.g. "€ "). */
  currencySymbol?: string
}

export function VillaInquireModal({
  isOpen,
  onClose,
  property,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  inquiryMode = "villa",
  experienceId = null,
  experienceDuration,
  getNightlyPrice,
  currencySymbol = "€ ",
}: VillaInquireModalProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

  const locationLabel = useMemo(() => {
    if (!property) return "Location upon request"
    return (
      [property.visibleLocation, property.location, property.country].filter(Boolean).join(", ") ||
      "Location upon request"
    )
  }, [property])

  const guestDefault = String(
    defaultGuests && defaultGuests > 0 ? defaultGuests : property?.classification?.idealPersons || 2
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      guestCount: guestDefault,
      dateFlexibility: "exact" as DateFlexibility,
      message: "",
      privacyPolicy: false,
    },
  })

  const onDateRangeChange = (range: [Date | null, Date | null]) => {
    setDateRange(range)
    setDateError(null)
  }

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    setSubmitError(null)
    setSubmitted(false)
    setIsDatePickerOpen(false)
    setDateError(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const gc =
      defaultGuests && defaultGuests > 0
        ? String(defaultGuests)
        : String(property?.classification?.idealPersons || 2)
    reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      guestCount: gc,
      dateFlexibility: "exact",
      message: "",
      privacyPolicy: false,
    })
    setDateRange([parseYmdToDate(defaultCheckIn) ?? null, parseYmdToDate(defaultCheckOut) ?? null])
  }, [isOpen, defaultCheckIn, defaultCheckOut, defaultGuests, property, reset])

  useEffect(() => {
    if (!isDatePickerOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDatePickerOpen])

  const [startDate, endDate] = dateRange

  const dateFieldLabel =
    startDate && endDate
      ? `${format(startDate, "d MMM yyyy")} – ${format(endDate, "d MMM yyyy")}`
      : startDate
        ? `${format(startDate, "d MMM yyyy")} – …`
        : ""

  const selectedNights = useMemo(() => {
    if (!startDate || !endDate) return null
    const nights = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : null
  }, [startDate, endDate])

  const nightlyPrice = useMemo(() => {
    if (inquiryMode === "experience" || !startDate || !getNightlyPrice) return null
    return getNightlyPrice(format(startDate, "yyyy-MM-dd"))
  }, [inquiryMode, startDate, getNightlyPrice])

  const totalPrice = useMemo(() => {
    if (nightlyPrice == null || nightlyPrice <= 0) return null
    if (selectedNights == null || selectedNights <= 0) return null
    return nightlyPrice * selectedNights
  }, [nightlyPrice, selectedNights])

  const photoUrls = useMemo(() => {
    const raw = Array.isArray(property?.images) ? property.images : []
    const fromGallery = raw
      .map((img: { urlImage?: string; url?: string; filename?: string }) => {
        const p = img?.urlImage || img?.url || img?.filename
        if (!p || !String(p).trim()) return null
        return resolveMediaUrl(p)
      })
      .filter((u: string | null): u is string => Boolean(u && String(u).trim()))
      .slice(0, 4)

    if (fromGallery.length > 0) return fromGallery

    const main = (property as Property & { mainImage?: string; image?: string })?.mainImage
      || (property as Property & { image?: string })?.image
    if (main) {
      const u = resolveMediaUrl(main)
      return u ? [u] : []
    }
    return []
  }, [property])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    setDateError(null)
    if (inquiryMode === "experience") {
      if (!startDate) {
        setDateError("Please select your preferred experience date.")
        return
      }
    } else {
      if (!startDate || !endDate) {
        setDateError("Select check-in and check-out using the calendar.")
        return
      }
    }
    setIsSubmitting(true)
    try {
      const startStr = startDate ? format(startDate, "yyyy-MM-dd") : defaultCheckIn || null
      const endStr = endDate ? format(endDate, "yyyy-MM-dd") : defaultCheckOut || null
      const prefixLines: string[] = []
      if (inquiryMode === "experience" && experienceId?.trim()) {
        prefixLines.push(`Experience ID: ${experienceId.trim()}`)
      }

      const flexLabel = DATE_FLEXIBILITY_OPTIONS.find((o) => o.value === data.dateFlexibility)?.label
      const dateLineExp = startStr
        ? `Preferred date: ${startStr}${flexLabel && data.dateFlexibility !== "exact" ? ` (${flexLabel})` : ""}`
        : ""

      const messageLines =
        inquiryMode === "experience"
          ? [
              ...prefixLines,
              data.message?.trim() || "",
              `Number of guests: ${data.guestCount.trim() || "—"}`,
              dateLineExp,
            ].filter(Boolean)
          : [
              ...prefixLines,
              data.message?.trim() || "",
              `Guests: ${data.guestCount.trim() || "—"}`,
              startStr && endStr ? `Stay: ${startStr} – ${endStr}` : "",
              selectedNights != null && selectedNights > 0 ? `Nights: ${selectedNights}` : "",
              nightlyPrice != null && nightlyPrice > 0
                ? `Price per night: ${formatCurrency(nightlyPrice, currencySymbol)}`
                : "",
              totalPrice != null && totalPrice > 0
                ? `Total: ${formatCurrency(totalPrice, currencySymbol)}`
                : "",
            ].filter(Boolean)

      await createProporsal({
        leadType: inquiryMode === "experience" ? "experience-inquiry" : "villa-inquiry",
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        message: messageLines.join("\n\n"),
        propertyids:
          inquiryMode === "experience" ? [] : property?.id ? [String(property.id)] : [],
        propertyName: property?.title ?? null,
        propertyLocation: locationLabel,
        preferredStartDate: startStr,
        preferredEndDate: endStr,
      })
      trackContactFormSubmit()
      setSubmitted(true)
      reset()
      setDateRange([null, null])
    } catch (error: unknown) {
      console.error("Villa inquiry failed", error)
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setSubmitError(msg || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const modal = (
    <div
      className="fixed inset-0 z-[220] flex h-full w-full min-h-0 flex-col bg-white [overscroll-behavior:contain]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="villa-inquiry-title"
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-[#506A70]/20 bg-white/95 px-4 py-3 backdrop-blur-sm pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <span className="font-gtsuper-ds text-base font-light uppercase tracking-[0.12em] text-[#172338] md:text-lg">
          {inquiryMode === "experience" ? "Experience inquiry" : "Villa inquiry"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-none p-2 text-[#172338] transition hover:bg-[#F5F5F5]"
          aria-label="Close"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable]">
        <div className="mx-auto box-border w-full min-w-0 max-w-[min(100%,1200px)] px-3 pt-0 [padding-bottom:max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 md:px-6 md:[padding-bottom:max(3.5rem,env(safe-area-inset-bottom))] lg:px-8">
          <div className="mt-3 border-b border-[#506A70]/20 pb-4 pt-0 md:mt-4 md:pb-5">
            <h2 className="font-gtsuper-ds text-2xl font-light text-[#172338] sm:text-3xl">Request a quote</h2>
            <p className="mt-2 font-haas text-sm font-light leading-relaxed text-[#506A70] md:mt-3">
              Share a few details and our reservations team will respond as soon as possible, usually within 24
              hours.
            </p>
          </div>
          <div className="grid min-h-0 min-w-0 gap-4 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start md:gap-0 md:pt-5">
            <div className="order-2 min-w-0 bg-white md:order-1 md:pr-8">
              {photoUrls.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-1.5 sm:mb-5">
                  {photoUrls.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="relative aspect-[4/3] min-h-0 overflow-hidden border border-[#506A70]/15 bg-[#EEF2F6]"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <h1
                id="villa-inquiry-title"
                className="font-gtsuper-ds text-2xl font-light leading-tight text-[#172338] sm:text-3xl md:text-[2.5rem] md:leading-[1.1] md:tracking-[-0.01em]"
              >
                {property?.title || "Villa"}
              </h1>
              <p className="mt-2 font-haas text-sm font-light text-[#506A70]">{locationLabel}</p>
              {inquiryMode === "experience" ? (
                experienceDuration?.trim() ? (
                  <p className="mt-4 font-haas text-sm font-light text-[#172338]">{experienceDuration.trim()}</p>
                ) : null
              ) : (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#172338]">
                <span className="flex items-center gap-1.5">
                  <TbBed size={22} strokeWidth={1.25} />
                  {property?.classification?.bedrooms ?? "—"} bed
                </span>
                <span className="flex items-center gap-1.5">
                  <TbBath size={22} strokeWidth={1.25} />
                  {property?.classification?.baths ?? "—"} bath
                </span>
                <span className="flex items-center gap-1.5">
                  <TbUser size={22} strokeWidth={1.25} />
                  {property?.classification?.idealPersons ?? property?.classification?.maxPersons ?? "—"} guests
                </span>
                <span className="flex items-center gap-1.5">
                  <TbPool size={22} strokeWidth={1.25} />
                  {(property?.classification as { pools?: unknown[] } | undefined)?.pools?.length ?? "—"} pools
                </span>
              </div>
              )}
              <div className="mt-6 border-t border-[#506A70]/20 pt-6 md:mt-8 md:pt-8">
                <h3 className="font-gtsuper-ds text-lg font-normal uppercase tracking-wide text-[#506A70] md:text-xl">
                  Other ways to get in contact
                </h3>
                <ol className="mt-5 space-y-6 font-haas text-sm font-light text-[#172338]">
                  <li className="flex gap-3">
                    <span className="w-6 shrink-0 text-xs text-[#506A70]">01</span>
                    <div>
                      <span className="text-[10px] font-normal uppercase tracking-[0.12em] text-[#506A70]">
                        Speak to us
                      </span>
                      <p className="mt-1">
                        <a
                          href={`tel:${VILLA_PHONE_TEL}`}
                          className="underline decoration-[#506A70]/40 underline-offset-2 transition-colors hover:text-[#28F6EA]"
                        >
                          {VILLA_PHONE_DISPLAY}
                        </a>
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 shrink-0 text-xs text-[#506A70]">02</span>
                    <div>
                      <span className="text-[10px] font-normal uppercase tracking-[0.12em] text-[#506A70]">
                        Write to us
                      </span>
                      <p className="mt-1">
                        <a
                          href={`mailto:${inquiryMode === "experience" ? CONCIERGE_EMAIL : VILLA_EMAIL}`}
                          className="break-all underline decoration-[#506A70]/40 underline-offset-2 transition-colors hover:text-[#28F6EA]"
                        >
                          {inquiryMode === "experience" ? CONCIERGE_EMAIL : VILLA_EMAIL}
                        </a>
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="order-1 box-border flex min-w-0 flex-col items-stretch justify-start rounded-none border border-[#506A70]/20 bg-white md:order-2 md:px-4 md:py-3 lg:px-5 lg:py-4">
              <div className="box-border mx-auto w-full max-w-md px-4 py-3 sm:px-5 sm:py-4">
                {submitted ? (
                  <div className="py-2">
                    <h3 className="font-gtsuper-ds text-xl font-light text-[#172338]">Thank you</h3>
                    <p className="mt-3 font-haas text-sm font-light leading-relaxed text-[#506A70]">
                      We have received your inquiry and will be in touch shortly.
                    </p>
                    <Button
                      type="button"
                      className="mt-8 h-12 w-full rounded-none bg-[#28F6EA] font-haas text-[15px] font-normal text-[#172338] hover:bg-[#28F6EA]/90"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
                      <div className="min-w-0">
                        <Label label="First name" mandatory className="mb-1.5" />
                        <input
                          id="vi-first"
                          type="text"
                          autoComplete="given-name"
                          placeholder="First name"
                          className={inputClass}
                          {...register("firstName", { required: "Required" })}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                      </div>
                      <div className="min-w-0">
                        <Label label="Last name" mandatory className="mb-1.5" />
                        <input
                          id="vi-last"
                          type="text"
                          autoComplete="family-name"
                          placeholder="Last name"
                          className={inputClass}
                          {...register("lastName", { required: "Required" })}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <Label label="Email" mandatory className="mb-1.5" />
                      <input
                        id="vi-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@email.com"
                        className={inputClass}
                        {...register("email", {
                          required: "Required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 sm:items-start">
                      <div className="min-w-0">
                        <Label label="Phone" mandatory className="mb-1.5" />
                        <input
                          id="vi-phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="Include country code"
                          className={inputClass}
                          {...register("phone", { required: "Required" })}
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                      </div>
                      <div className="min-w-0">
                        <Label label={inquiryMode === "experience" ? "Number of guests" : "Guests"} mandatory className="mb-1.5" />
                        <input
                          id="vi-guests"
                          type="number"
                          min={1}
                          max={99}
                          inputMode="numeric"
                          placeholder="e.g. 2"
                          className={inputClass}
                          {...register("guestCount", {
                            required: "Required",
                            min: { value: 1, message: "At least 1" },
                          })}
                        />
                        {errors.guestCount && <p className="mt-1 text-xs text-red-600">{errors.guestCount.message}</p>}
                      </div>
                    </div>

                    <div className="relative min-w-0 w-full" ref={datePickerRef}>
                      <Label label={inquiryMode === "experience" ? "Preferred experience date" : "Stay dates"} mandatory className="mb-1.5" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsDatePickerOpen((o) => !o)
                          setDateError(null)
                        }}
                        className={dateButtonClass}
                        aria-expanded={isDatePickerOpen}
                        aria-haspopup="dialog"
                      >
                        <span
                          className={`min-w-0 flex-1 truncate text-left font-haas text-sm font-light ${
                            !dateFieldLabel ? "text-[#9CA3AF]" : "text-[#172338]"
                          }`}
                        >
                          {dateFieldLabel || (inquiryMode === "experience" ? "Select preferred date" : "Check-in and check-out")}
                        </span>
                        <Calendar className="h-5 w-5 shrink-0 text-[#172338]" aria-hidden />
                      </button>
                      {isDatePickerOpen && (
                        <div className="absolute left-0 right-0 z-[230] mt-2 flex justify-center sm:justify-end">
                          <VillaFilterDateRangeCalendar
                            value={dateRange}
                            onChange={onDateRangeChange}
                            showDoneButton
                            onRangeComplete={() => setIsDatePickerOpen(false)}
                            onDone={() => setIsDatePickerOpen(false)}
                            className="!mx-0 w-full max-w-[320px] shadow-xl sm:max-w-[340px]"
                          />
                        </div>
                      )}
                      {dateError && <p className="mt-2 text-xs text-red-600">{dateError}</p>}
                    </div>

                    {inquiryMode !== "experience" &&
                      startDate &&
                      endDate &&
                      selectedNights != null &&
                      selectedNights > 0 && (
                        <div className="border border-black bg-white px-4 py-3.5">
                          <div className="flex items-center justify-between">
                            <span className="font-haas text-sm font-light text-[#506A70]">
                              {selectedNights} night{selectedNights > 1 ? "s" : ""}
                            </span>
                            <span className="font-haas text-sm font-light text-[#506A70]">
                              {nightlyPrice != null && nightlyPrice > 0
                                ? `${formatCurrency(nightlyPrice, currencySymbol)} / night`
                                : "Price upon request"}
                            </span>
                          </div>
                          <div className="mt-2.5 flex items-baseline justify-between border-t border-[#172338]/10 pt-2.5">
                            <span className="font-haas text-xs font-normal uppercase tracking-[0.1em] text-[#506A70]">
                              Total
                            </span>
                            <span className="font-haas text-base font-normal leading-none text-[#172338]">
                              {totalPrice != null && totalPrice > 0
                                ? formatCurrency(totalPrice, currencySymbol)
                                : "Upon request"}
                            </span>
                          </div>
                        </div>
                      )}

                    {inquiryMode === "experience" && (
                      <div className="min-w-0">
                        <Label label="Date flexibility" className="mb-1.5" />
                        <select
                          className={`${inputClass} appearance-none cursor-pointer`}
                          {...register("dateFlexibility")}
                        >
                          {DATE_FLEXIBILITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <Label
                        label={
                          inquiryMode === "experience"
                            ? "Tell us about this experience"
                            : "Tell us about your stay"
                        }
                        mandatory
                        className="mb-1.5"
                      />
                      <textarea
                        id="vi-message"
                        rows={5}
                        className={`${inputClass} min-h-[7.5rem] resize-y py-3 leading-relaxed`}
                        placeholder={
                          inquiryMode === "experience"
                            ? "Share preferred dates, group size, and any special requests for this experience."
                            : "Share your travel dates, preferences, or special requests so we can personalize your stay."
                        }
                        {...register("message", { required: "Required" })}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <Controller
                          name="privacyPolicy"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Checkbox
                              id="vi-privacy"
                              className="mt-0.5 h-4 w-4 border-[#506A70] data-[state=checked]:bg-[#172338] data-[state=checked]:border-[#172338]"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label
                          htmlFor="vi-privacy"
                          className="font-haas text-xs font-light leading-snug text-[#506A70] sm:text-sm"
                        >
                          I accept the{" "}
                          <a href="/privacy" className="font-medium text-[#172338] underline" onClick={(e) => e.stopPropagation()}>
                            Privacy Policy
                          </a>
                          .
                        </label>
                      </div>
                      {errors.privacyPolicy && (
                        <p className="mt-1 text-xs text-red-600">{errors.privacyPolicy.message}</p>
                      )}
                    </div>

                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full rounded-none bg-[#28F6EA] font-haas text-[15px] font-normal text-[#172338] hover:bg-[#28F6EA]/90 disabled:opacity-60"
                    >
                      {isSubmitting ? "Sending…" : "Request a quote"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (portalReady) {
    return createPortal(modal, document.body)
  }
  return modal
}
