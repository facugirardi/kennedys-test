import { fetchAPI, axiosInstance } from './fetcher'

export async function getMyOwnedProperties() {
  return fetchAPI('/owner-reports/my-properties')
}

export async function getOwnerPropertyReport(propertyId: string, viewToken?: string) {
  const qs = viewToken ? `?token=${encodeURIComponent(viewToken)}` : ''
  return fetchAPI(`/owner-reports/${encodeURIComponent(propertyId)}${qs}`)
}

/** All-time (not year-scoped) bookings — feeds the owner profile's Property Bookings/Contracts/Client Complaints tabs. */
export async function getOwnerPropertyBookings(propertyId: string) {
  return fetchAPI(`/owner-reports/${encodeURIComponent(propertyId)}/bookings`)
}

/**
 * Fast, meta-only lookup (villa name/location/hero photo) — used for SSR Open Graph tags instead of
 * the full report, which fetches years of bookings/negotiations/rates and was slow enough to risk
 * social crawlers (Facebook/WhatsApp have short fetch timeouts) timing out with no preview at all.
 */
export async function getOwnerPropertyReportMeta(propertyId: string, viewToken?: string) {
  const qs = viewToken ? `?token=${encodeURIComponent(viewToken)}` : ''
  return fetchAPI(`/owner-reports/${encodeURIComponent(propertyId)}/meta${qs}`)
}

/**
 * Real PDF (puppeteer-rendered, native print — not a screenshot), streamed back as a blob.
 * Takes ~2-5s server-side; the caller is responsible for a loading state.
 */
export async function downloadOwnerReportPdf(propertyId: string, viewToken?: string): Promise<{ blob: Blob; fileName: string }> {
  const qs = viewToken ? `?token=${encodeURIComponent(viewToken)}` : ''
  const res = await axiosInstance.get(`/owner-reports/${encodeURIComponent(propertyId)}/pdf${qs}`, {
    responseType: 'blob',
  })
  const disposition = String(res.headers?.['content-disposition'] || '')
  const match = disposition.match(/filename="([^"]+)"/)
  const fileName = match?.[1] || 'owner-report.pdf'
  return { blob: res.data as Blob, fileName }
}

// Short share-link variants — `owner-report/:slug?token=:token`. The slug in the URL is
// cosmetic; the short DB-backed `token` alone resolves the property server-side.
export async function getOwnerPropertyReportByLink(linkToken: string) {
  return fetchAPI(`/owner-reports/link/${encodeURIComponent(linkToken)}`)
}

/** Meta-only counterpart of getOwnerPropertyReportByLink — see getOwnerPropertyReportMeta. */
export async function getOwnerPropertyReportMetaByLink(linkToken: string) {
  return fetchAPI(`/owner-reports/link/${encodeURIComponent(linkToken)}/meta`)
}

export async function downloadOwnerReportPdfByLink(linkToken: string): Promise<{ blob: Blob; fileName: string }> {
  const res = await axiosInstance.get(`/owner-reports/link/${encodeURIComponent(linkToken)}/pdf`, {
    responseType: 'blob',
  })
  const disposition = String(res.headers?.['content-disposition'] || '')
  const match = disposition.match(/filename="([^"]+)"/)
  const fileName = match?.[1] || 'owner-report.pdf'
  return { blob: res.data as Blob, fileName }
}
