export type OwnedPropertySummary = {
  id: string
  title: string
  location: string
}

export type OwnerReportRateCardPeriod = {
  label: string
  start: string | null
  end: string | null
  official: number
  fee: number
  commission: number
  netOwner: number
  minStay: number | null
  vs2025: string | null
  includedServices: string | null
}

export type PaymentInstallment = {
  id: string
  label: string | null
  amount: string
  dueDate: string | null
  status: 'PENDING' | 'DONE' | string
  paidDate: string | null
}

export type OwnerReportBooking = {
  id: string
  reference: string | null
  guest: string | null
  checkIn: string | null
  checkOut: string | null
  nights: number
  netPrice: number
  officialNetPrice: number | null
  discountPercent: number | null
  bookedDate: string | null
  payment: 'PENDING' | 'DONE' | string
  paymentPlan: PaymentInstallment[]
  securityDepositTaken: boolean
  securityDepositAmount: number | null
  hasDamage: boolean
  guestFeedback: string | null
  housekeepingFeedback: string | null
  damages: string | null
  damageReportUrls: string[]
  contractUrl: string | null
  stayReportUrl: string | null
}

/** An offer actually sent to a prospective guest (kennedys-loggia's "Offers" module / SharedProperty). */
export type OwnerReportOffer = {
  id: string
  reference: string | null
  client: string | null
  requestDate: string | null
  checkIn: string | null
  checkOut: string | null
  amount: number
  currency: string
  slug: string
}

/** A negotiation in progress, sourced from the owner's own NEGOTIATED BOOKINGS Excel sheet. */
export type OwnerReportNegotiation = {
  id: string
  reference: string | null
  requestDate: string | null
  checkIn: string | null
  checkOut: string | null
  nights: number
  amount: number
  avgPerNight: number
  /** Net-to-owner/night for comparison: from the villa's own Official Rate Card for these dates, or staff's manual override (Loggia's officialNetOverride) when no rate-card period covers them — null if neither is available. */
  officialNetPerNight: number | null
  status: 'OPEN' | 'WON' | 'LOST' | string
  info: string | null
  /** Why this negotiation didn't turn into a booking — set from Loggia when marked "Not Booked" (LOST). */
  feedback: string | null
}

export type OwnerReportOccupiedRange = {
  start: string
  end: string
  nights: number
  netPrice: number
}

export type OwnerReportYearlyPerformance = {
  year: number
  bookingCount: number
  nights: number
  netRevenue: number
  avgPerNight: number
}

export type OwnerReportRecommendation = {
  id: string
  title: string
  details: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string
  estCost: number | null
  status: 'PROPOSED' | 'APPROVED' | 'DONE' | string
  pdfUrl: string | null
  pdfOriginalName: string | null
}

export type OwnerReport = {
  villa: {
    id: string
    name: string
    location: string
    currency: string
    isRealEstate: boolean
    season: { start: string; end: string }
    photos: string[]
    rates: OwnerReportRateCardPeriod[]
    /** Staff-entered forecast pricing for `suggestedRatesYear`, manually keyed in kennedys-loggia (no Excel import). */
    suggestedRates: OwnerReportRateCardPeriod[]
    suggestedRatesYear: number
    occupiedRanges: OwnerReportOccupiedRange[]
    blockedDates: string[]
    /** Section ids hidden for this villa exclusively (Loggia's Property Management > Sections tab), e.g. ["rates", "live-availability"]. */
    hiddenSections: string[]
  }
  generatedAt: string
  currentYear: number
  stats: {
    totalNet: number
    totalNights: number
    avgPerNight: number
    bookingCount: number
    negotiationsCount: number
    negotiationsValue: number
  }
  monthly: Record<string, { revenue: number; nights: number }>
  yearlyPerformance: OwnerReportYearlyPerformance[]
  bookings: OwnerReportBooking[]
  negotiations: OwnerReportNegotiation[]
  offers: OwnerReportOffer[]
  recommendations: OwnerReportRecommendation[]
}
