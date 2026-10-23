"use client"

import React, { useEffect, useRef, useState } from "react"
import { trackContactFormSubmit } from "@/lib/utils/googleAdsConversions"
import { createPortal } from "react-dom"
import { useForm, Controller } from "react-hook-form"
import { format } from "date-fns"
import { Calendar, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { mutateAPI } from "@/lib/api/fetcher"
import { Button } from "@/components/ui/button1"
import { VillaFilterDateRangeCalendar } from "@/components/custom/VillaFilterDateRangeCalendar"

const CONCIERGE_PHONE_DISPLAY = "+30 694 789 2716"
const CONCIERGE_PHONE_TEL = "+306947892716"

const labelClass =
  "block text-[10px] font-haas font-normal uppercase tracking-[0.2em] text-[#506A70] mb-2"
const inputClass =
  "w-full h-12 bg-white border border-[#506A70] px-4 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] rounded-none focus:outline-none focus:ring-1 focus:ring-[#172338]/20"

type FormData = {
  firstName: string
  lastName: string
  phone: string
  guestCount: string
  privacyPolicy: boolean
}

export type ConciergeEnquiryModalProps = {
  isOpen: boolean
  onClose: () => void
  serviceName: string
  pagePath: string
  /** When set, team email uses "Inquiry" instead of "Request a quote" (service already shows a list price). */
  serviceHasListPrice?: boolean
  /** agents-portfolio / agentOffer=1: sin referencias a Kennedy's Group. */
  agentOfferView?: boolean
}

export function ConciergeEnquiryModal({
  isOpen,
  onClose,
  serviceName,
  pagePath,
  serviceHasListPrice = false,
  agentOfferView = false,
}: ConciergeEnquiryModalProps) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      guestCount: "2",
      privacyPolicy: false,
    },
  })

  const [startDate, endDate] = dateRange

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
    if (isOpen) {
      setSubmitError(null)
      setSubmitted(false)
      setIsDatePickerOpen(false)
    }
  }, [isOpen])

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

  const dateFieldLabel =
    startDate && endDate
      ? `${format(startDate, "d MMM yyyy")} – ${format(endDate, "d MMM yyyy")}`
      : startDate
        ? `${format(startDate, "d MMM yyyy")} – …`
        : ""

  const dateSummary = dateFieldLabel

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const guests = data.guestCount.trim() || ""
      const messageLines = [
        `Concierge service: ${serviceName}`,
        `Page: ${pagePath}`,
        guests ? `Number of guests: ${guests}` : "",
      ].filter(Boolean)
      const travelDates = dateSummary || undefined
      const payload = {
        inquiryType: "CONCIERGE" as const,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: "",
        phone: data.phone.replace(/\s/g, "") ? data.phone.trim() : undefined,
        message: messageLines.join("\n"),
        travelDates,
        requestQuote: true,
        newsletter: false,
        conciergeHasListPrice: serviceHasListPrice,
      }
      const res = await mutateAPI("contact", "POST", payload)
      if (res?.success === false) {
        setSubmitError((res as { message?: string })?.message || "Something went wrong. Please try again.")
        return
      }
      trackContactFormSubmit()
      setSubmitted(true)
      reset()
      setDateRange([null, null])
    } catch {
      setSubmitError("Failed to send your request. Please try again.")
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
      aria-labelledby="concierge-enquiry-title"
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-[#506A70]/20 bg-white/95 px-4 py-3 backdrop-blur-sm pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <span className="font-gtsuper-ds text-base font-light uppercase tracking-[0.12em] text-[#172338] md:text-lg">
          Concierge enquiry
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
        <div className="mx-auto box-border w-full min-h-full min-w-0 max-w-[min(100%,1200px)] px-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 sm:px-5 md:px-6 md:pt-8 md:pb-12 lg:px-8">
          <div className="grid min-h-0 min-w-0 gap-4 md:gap-0 md:min-h-[min(480px,calc(100dvh-10rem))] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-stretch">
            <div className="order-2 min-w-0 bg-white py-8 md:order-1 md:py-0 md:pr-10">
              <h2
                id="concierge-enquiry-title"
                className="font-gtsuper-ds text-2xl font-light leading-tight text-[#172338] sm:text-3xl md:text-[2.5rem] md:leading-[1.1] md:tracking-[-0.01em]"
              >
                Request a quote
              </h2>
              <p className="mt-4 font-haas text-sm font-light leading-relaxed text-[#506A70]">
                {agentOfferView
                  ? "Share a few details and our team will respond as soon as possible, usually within 24 hours."
                  : "Share a few details and our concierge team will respond as soon as possible, usually within 24 hours."}
              </p>
              {!agentOfferView ? (
              <div className="mt-8 border-t border-[#506A70]/20 pt-8">
                <h3 className="font-gtsuper-ds text-lg font-normal uppercase tracking-wide text-[#506A70] md:text-xl">
                  Other ways to get in contact
                </h3>
                <ol className="mt-5 space-y-6 font-haas text-sm font-light text-[#172338]">
                  <li className="flex gap-3">
                    <span className="w-6 shrink-0 text-xs text-[#506A70]">01</span>
                    <div>
                      <span className="text-[10px] font-normal uppercase tracking-[0.12em] text-[#506A70]">Speak to us</span>
                      <p className="mt-1">
                        <a
                          href={`tel:${CONCIERGE_PHONE_TEL}`}
                          className="underline decoration-[#506A70]/40 underline-offset-2 transition-colors hover:text-[#28F6EA]"
                        >
                          {CONCIERGE_PHONE_DISPLAY}
                        </a>
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 shrink-0 text-xs text-[#506A70]">02</span>
                    <div>
                      <span className="text-[10px] font-normal uppercase tracking-[0.12em] text-[#506A70]">Write to us</span>
                      <p className="mt-1">
                        <a
                          href="mailto:concierge@kennedysgroup.com"
                          className="underline decoration-[#506A70]/40 underline-offset-2 transition-colors hover:text-[#28F6EA]"
                        >
                          concierge@kennedysgroup.com
                        </a>
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
              ) : (
              <div className="mt-8 border-t border-[#506A70]/20 pt-8">
                <p className="font-haas text-sm font-light text-[#506A70]">
                  Prefer to speak directly? Call{" "}
                  <a
                    href={`tel:${CONCIERGE_PHONE_TEL}`}
                    className="text-[#172338] underline decoration-[#506A70]/40 underline-offset-2"
                  >
                    {CONCIERGE_PHONE_DISPLAY}
                  </a>
                  .
                </p>
              </div>
              )}
            </div>

            <div className="order-1 box-border flex min-w-0 flex-col items-center justify-start rounded-none border border-[#506A70]/20 bg-[#F5F5F5] md:order-2 md:justify-center md:px-5 md:py-6 lg:px-6 lg:py-8">
              <div className="box-border mx-auto w-full max-w-md px-5 py-6 sm:px-6">
                {submitted ? (
                  <div className="py-4">
                    <h3 className="font-gtsuper-ds text-xl font-light text-[#172338]">Thank you</h3>
                    <p className="mt-3 font-haas text-sm font-light leading-relaxed text-[#506A70]">
                      We have received your enquiry and will be in touch shortly.
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
                  <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                    <div>
                      <p className="text-[10px] font-haas font-normal uppercase tracking-[0.2em] text-[#506A70]">Request details</p>
                      <p className="mt-1 font-haas text-sm font-light text-[#172338]">{serviceName}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="ce-first">
                          Name
                        </label>
                        <input
                          id="ce-first"
                          type="text"
                          autoComplete="given-name"
                          className={inputClass}
                          {...register("firstName", { required: "Required" })}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="ce-last">
                          Surname
                        </label>
                        <input
                          id="ce-last"
                          type="text"
                          autoComplete="family-name"
                          className={inputClass}
                          {...register("lastName", { required: "Required" })}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="ce-phone">
                        Phone number
                      </label>
                      <input
                        id="ce-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder={CONCIERGE_PHONE_DISPLAY}
                        className={inputClass}
                        {...register("phone", { required: "Required" })}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                      <div>
                        <label className={labelClass} htmlFor="ce-guests">
                          Number of guests
                        </label>
                        <input
                          id="ce-guests"
                          type="number"
                          min={1}
                          max={99}
                          inputMode="numeric"
                          className={inputClass}
                          {...register("guestCount", {
                            required: "Required",
                            min: { value: 1, message: "At least 1" },
                          })}
                        />
                        {errors.guestCount && <p className="mt-1 text-xs text-red-600">{errors.guestCount.message}</p>}
                      </div>

                      <div className="relative min-w-0" ref={datePickerRef}>
                        <p className={labelClass}>Dates (optional)</p>
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen((o) => !o)}
                          className={`${inputClass} flex h-12 w-full items-center justify-between gap-2 text-left`}
                          aria-expanded={isDatePickerOpen}
                          aria-haspopup="dialog"
                        >
                          <span
                            className={`min-w-0 flex-1 truncate font-haas text-sm font-light ${
                              !dateFieldLabel ? "text-[#9CA3AF]" : "text-[#172338]"
                            }`}
                          >
                            {dateFieldLabel || "Select dates"}
                          </span>
                          <Calendar className="h-5 w-5 shrink-0 text-[#172338]" aria-hidden />
                        </button>
                        <p className="mt-1.5 font-haas text-[11px] font-light leading-snug text-[#506A70] sm:text-xs">
                          Tap to open the calendar, or leave empty if unsure.
                        </p>
                        {isDatePickerOpen && (
                          <div className="absolute left-0 right-0 z-[230] mt-2 flex justify-center sm:left-auto sm:right-0 sm:block sm:justify-end">
                            <VillaFilterDateRangeCalendar
                              value={dateRange}
                              onChange={setDateRange}
                              showDoneButton
                              onRangeComplete={() => setIsDatePickerOpen(false)}
                              onDone={() => setIsDatePickerOpen(false)}
                              className="!mx-0 w-full max-w-[280px] shadow-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <Controller
                          name="privacyPolicy"
                          control={control}
                          rules={{ required: "Required" }}
                          render={({ field }) => (
                            <Checkbox
                              id="ce-privacy"
                              className="mt-0.5 h-4 w-4 border-[#506A70] data-[state=checked]:bg-[#172338] data-[state=checked]:border-[#172338]"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label htmlFor="ce-privacy" className="font-haas text-xs font-light leading-snug text-[#506A70]">
                          {agentOfferView ? (
                            "I accept the privacy policy for this enquiry."
                          ) : (
                            <>
                              I accept the{" "}
                              <a href="/privacy" className="font-medium underline text-[#172338]" onClick={(e) => e.stopPropagation()}>
                                Privacy Policy
                              </a>{" "}
                              for this enquiry.
                            </>
                          )}
                        </label>
                      </div>
                      {errors.privacyPolicy && <p className="mt-1 text-xs text-red-600">{errors.privacyPolicy.message}</p>}
                    </div>

                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full rounded-none bg-[#28F6EA] font-haas text-[15px] font-normal text-[#172338] hover:bg-[#28F6EA]/90 disabled:opacity-60"
                    >
                      {isSubmitting ? "Requesting…" : "Request a quote"}
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
