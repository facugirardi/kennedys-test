import React from 'react'
import type { OwnerReportBooking } from '@/src/types/ownerReport'
import { EmptyState, fmtDate, bookingHasStayReport, StayReportBody } from './OwnerReportPage'

export function ComplaintsList({ bookings, currency }: { bookings: OwnerReportBooking[]; currency: string }) {
  const withReports = bookings.filter(bookingHasStayReport)

  if (!withReports.length) {
    return <EmptyState>No client feedback, damages or stay issues have been recorded for this property yet.</EmptyState>
  }

  return (
    <div className="flex flex-col gap-3">
      {withReports.map((b) => (
        <div key={b.id} className="border border-[#e5e0d8] bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium text-[#172338]">{b.guest || b.reference || 'Reservation'}</div>
            <div className="text-[13px] text-[#506A70]">
              {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#e5e0d8]">
            <StayReportBody b={b} currency={currency} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComplaintsList
