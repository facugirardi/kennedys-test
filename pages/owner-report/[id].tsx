import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { useRouter } from 'next/router'
import { useAuth } from '@/src/contexts/AuthContext'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME, getPublicSiteOriginFromRequest } from '@/lib/seo/config'
import { resolveMediaUrl } from '@/lib/utils'
import {
  downloadOwnerReportPdf,
  downloadOwnerReportPdfByLink,
  getOwnerPropertyReportMeta,
  getOwnerPropertyReportMetaByLink,
} from '@/lib/api/ownerReports'
import { SingleOwnerReport } from '@/components/owner-reports/OwnerReportPage'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import type { OwnerReport } from '@/src/types/ownerReport'
import type { GetServerSidePropsContext } from 'next'

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  a.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.setTimeout(() => URL.revokeObjectURL(url), 2500)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type InitialSeoMeta = { title: string; description: string; imageUrl: string | null } | null

export default function OwnerReportStandalonePage({
  initialSeoMeta,
  siteOrigin,
}: {
  initialSeoMeta?: InitialSeoMeta
  siteOrigin?: string
}) {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const idParam = typeof router.query.id === 'string' ? router.query.id : undefined
  const tokenParam = typeof router.query.token === 'string' ? router.query.token : undefined
  // Old-style links used the real propertyId (a UUID) in the path with a `?token=<jwt>` — those
  // must keep working forever, so a UUID `id` always takes the legacy propertyId/viewToken path.
  // New short links use a villa-name slug in the path instead, resolved server-side by `token`
  // alone (see ownerReportLinkService) — never a UUID, so this check can't misfire on a real one.
  const isLegacyId = !!idParam && UUID_RE.test(idParam)
  const propertyId = isLegacyId ? idParam : undefined
  const viewToken = isLegacyId ? tokenParam : undefined
  const linkToken = !isLegacyId && idParam ? tokenParam : undefined
  const [villaName, setVillaName] = useState<string | null>(null)
  const [villaSeo, setVillaSeo] = useState<{ location: string; image: string | null } | null>(null)
  const [navHeight, setNavHeight] = useState(96)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  // Below `md` the navbar sits in normal flow and scrolls away, so only the section
  // nav stays pinned (at top:0). From `md` up the navbar is fixed, so the content is
  // pushed down by its height and the section nav sticks just under it.
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    if (downloadingPdf || (!propertyId && !linkToken)) return
    setDownloadingPdf(true)
    try {
      const { blob, fileName } = linkToken
        ? await downloadOwnerReportPdfByLink(linkToken)
        : await downloadOwnerReportPdf(propertyId!, viewToken)
      triggerBlobDownload(blob, fileName)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Owner report PDF download failed', e)
      }
    } finally {
      setDownloadingPdf(false)
    }
  }, [propertyId, viewToken, linkToken, downloadingPdf])

  useEffect(() => {
    if (viewToken || linkToken) return
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router, viewToken, linkToken])

  const handleLoaded = useCallback((report: OwnerReport) => {
    setVillaName(report.villa.name || null)
    const heroPhoto = report.villa.photos?.[0]
    setVillaSeo({
      location: report.villa.location || '',
      image: heroPhoto ? resolveMediaUrl(heroPhoto) : null,
    })
  }, [])

  const seoTitle = villaName
    ? `${villaName} — Owner Report | ${SITE_NAME}`
    : initialSeoMeta?.title || `Owner Report | ${SITE_NAME}`
  const seoDescription = villaName
    ? `Bookings, revenue and performance report for ${villaName}${villaSeo?.location ? `, ${villaSeo.location}` : ''}.`
    : initialSeoMeta?.description || "This villa's bookings, revenue and performance report."
  const seoImage = villaSeo?.image ?? initialSeoMeta?.imageUrl ?? undefined

  if (!idParam) return null
  if (!viewToken && !linkToken && !isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        siteOrigin={siteOrigin}
        canonicalPath={`/owner-report/${idParam}`}
        imageUrl={seoImage}
        noindex
      />
      <div className="pdf-exclude-from-capture">
        <Navbar textBlack={true} className="bg-white" onHeightChange={setNavHeight} staticBelowMd />
      </div>
      <div
        className="flex-1 max-w-[1140px] w-full mx-auto px-4 sm:px-6 pb-8"
        style={{
          paddingTop: isDesktop ? navHeight + 24 : 24,
          // Consumed by SectionNav in OwnerReportPage: pin below the fixed navbar on
          // desktop, flush to the top on mobile (navbar scrolls away there).
          ['--owner-report-nav-offset' as string]: isDesktop ? `${navHeight}px` : '0px',
        }}
      >
        {!viewToken && !linkToken && (
          <div className="mb-8 pdf-exclude-from-capture">
            <Link
              href="/my-profile?tab=reports"
              className="inline-flex items-center gap-2 border border-[#172338]/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#172338] hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D99330]"
            >
              <ArrowLeft className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
              <span>Go back</span>
            </Link>
          </div>
        )}
        <SingleOwnerReport
          propertyId={propertyId}
          viewToken={viewToken}
          linkToken={linkToken}
          onLoaded={handleLoaded}
          headerAction={
            villaName ? (
              <button
                type="button"
                disabled={downloadingPdf}
                onClick={() => {
                  void handleDownloadPdf()
                }}
                className="pdf-exclude-from-capture inline-flex items-center gap-2 border border-[#172338]/20 px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#172338] hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D99330] disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <span aria-live="polite">Generating…</span>
                ) : (
                  <>
                    <Download className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            ) : undefined
          }
        />
      </div>
      <div className="pdf-exclude-from-capture">
        <Footer disableTravelSection={true} />
      </div>
    </div>
  )
}

// Only the two token-based share flows (viewToken on a legacy propertyId, or the short
// linkToken) can be fetched here without a logged-in session's cookies/localStorage JWT —
// those are exactly the links that get pasted into WhatsApp/Slack/email and unfurled by a
// crawler that never runs the client-side fetch in SingleOwnerReport. Without this, social
// crawlers only ever saw the pre-fetch fallback title/image (looks like "a default").
//
// Deliberately uses the lightweight .../meta endpoint here, not the full report — that one
// aggregates years of bookings/negotiations/rate cards and was slow enough (2-3s+) to risk
// Facebook/WhatsApp's short crawler timeout, which shows no preview at all rather than a
// wrong one. The full report is still fetched client-side by SingleOwnerReport as before.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const idParam = context.params?.id
  const siteOrigin = getPublicSiteOriginFromRequest(context.req)
  if (typeof idParam !== 'string') {
    return { props: { siteOrigin } }
  }

  const tokenParam = typeof context.query.token === 'string' ? context.query.token : undefined
  const isLegacyId = UUID_RE.test(idParam)
  const linkToken = !isLegacyId ? tokenParam : undefined
  const viewToken = isLegacyId ? tokenParam : undefined
  if (!linkToken && !viewToken) {
    return { props: { siteOrigin } }
  }

  try {
    const res: any = linkToken
      ? await getOwnerPropertyReportMetaByLink(linkToken)
      : await getOwnerPropertyReportMeta(idParam, viewToken)
    const meta = res?.data as { propertyId: string; name: string | null; location: string | null; photos: string[] } | undefined
    if (!meta?.name) {
      return { props: { siteOrigin } }
    }

    const villaName = meta.name || null
    const location = meta.location || ''
    const heroPhoto = meta.photos?.[0]
    // Same og:image pipeline as villa/real-estate detail pages (buildPropertyDetailInitialSeoMeta):
    // proxied through /api/property-og-image so social crawlers get a small, same-origin,
    // Facebook-recommended-size (1200x630) JPEG instead of the raw multi-MB source upload — pointing
    // og:image straight at api.kennedys.group's large webp originals was making WhatsApp/Facebook
    // show no preview at all.
    const imageUrl =
      meta.propertyId && siteOrigin
        ? `${siteOrigin.replace(/\/+$/, '')}/api/property-og-image?identifier=${encodeURIComponent(meta.propertyId)}`
        : heroPhoto
          ? resolveMediaUrl(heroPhoto)
          : null

    return {
      props: {
        siteOrigin,
        initialSeoMeta: villaName
          ? {
              title: `${villaName} — Owner Report | ${SITE_NAME}`,
              description: `Bookings, revenue and performance report for ${villaName}${location ? `, ${location}` : ''}.`,
              imageUrl,
            }
          : null,
      },
    }
  } catch {
    return { props: { siteOrigin } }
  }
}
