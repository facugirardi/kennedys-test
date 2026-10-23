import React from 'react'
import type { OwnerReportBooking } from '@/src/types/ownerReport'
import { EmptyState, fmtDate, ContractLink, StayReportLink, DamageReportLink } from './OwnerReportPage'

export function ContractsList({ bookings }: { bookings: OwnerReportBooking[] }) {
  const withDocs = bookings.filter((b) => b.contractUrl || b.stayReportUrl || b.damageReportUrls?.length)

  if (!withDocs.length) {
    return <EmptyState>No contracts or reports have been uploaded for this property&apos;s bookings yet.</EmptyState>
  }

  return (
    <div className="flex flex-col gap-3">
      {withDocs.map((b) => (
        <div key={b.id} className="border border-[#e5e0d8] bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-medium text-[#172338]">{b.guest || b.reference || 'Reservation'}</div>
            <div className="text-[13px] text-[#506A70] mt-0.5">
              {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {b.contractUrl && <ContractLink url={b.contractUrl} />}
            {b.stayReportUrl && <StayReportLink url={b.stayReportUrl} />}
            {b.damageReportUrls?.map((url, idx) => (
              <DamageReportLink key={url} url={url} label={`Damage report ${idx + 1}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContractsList
