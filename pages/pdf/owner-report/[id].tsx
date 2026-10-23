/**
 * Print-only rendering of an owner report. Never browsed to directly by a person — puppeteer
 * (kennedys-api's propertyPdfService.generateOwnerReportPdf) navigates here with a property-scoped
 * `?token=` link token and calls Chrome's native page.pdf(), so the download is real text/vector
 * output paginated by print CSS, not a screenshot stretched across pages.
 */
import { useState } from 'react'
import { useRouter } from 'next/router'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { SingleOwnerReport } from '@/components/owner-reports/OwnerReportPage'

export default function OwnerReportPdfPage() {
  const router = useRouter()
  const propertyId = typeof router.query.id === 'string' ? router.query.id : undefined
  const viewToken = typeof router.query.token === 'string' ? router.query.token : undefined
  // Set only once the report has actually rendered — puppeteer waits on this instead of a flat
  // timeout, since the report's data fetch takes a variable amount of time.
  const [reportLoaded, setReportLoaded] = useState(false)

  if (!propertyId) return null

  return (
    <div className="owner-report-pdf-page bg-white">
      <SeoHead title={`Owner Report | ${SITE_NAME}`} description="" noindex />
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <SingleOwnerReport propertyId={propertyId} viewToken={viewToken} forPrint onLoaded={() => setReportLoaded(true)} />
      </div>
      {reportLoaded && <div data-pdf-report-ready="true" style={{ display: 'none' }} />}
    </div>
  )
}
