import React from 'react'
import type { GetServerSideProps } from 'next'
import { ExperiencePage } from '@/components/ExperiencePage'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { getPublicSiteOriginFromRequest, SITE_NAME } from '@/lib/seo/config'
import { stripHtmlToText, truncateMetaDescription } from '@/lib/seo/text'
import { resolveMediaUrl } from '@/lib/utils'
import { isExperienceDetailSegment } from '@/lib/experienceRouting'
import { getExperienceById, getExperiencesByCity } from '@/lib/api/experiences'

type PageMode = 'city' | 'detail'

type ExperiencesSegmentProps = {
    segment: string
    pageMode: PageMode
    detailTitle?: string | null
    /** Optional CMS/meta title for `<title>` / OG (detail routes). */
    seoHeadTitle?: string | null
    initialCityExperiences: Record<string, unknown>[] | null
    initialExperienceSlug: string | null
    siteOrigin?: string
    seoImageUrl?: string | null
    seoDescription?: string | null
    /** SSR meta for `_app` OG tags (same pattern as shared-properties / agent-property). */
    initialSeoMeta?: { title: string; description: string; imageUrl?: string | null }
}

function titleCaseCity(slug: string): string {
    if (!slug.trim()) return 'Destinations'
    return slug
        .split(/[-_]/g)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
}

const ExperiencesSegmentPage = ({
    segment,
    pageMode,
    detailTitle,
    seoHeadTitle = null,
    initialCityExperiences,
    initialExperienceSlug,
    siteOrigin = '',
    seoImageUrl = null,
    seoDescription = null,
    initialSeoMeta: _initialSeoMeta,
}: ExperiencesSegmentProps) => {
    const isDetail = pageMode === 'detail'
    const cityLabel = titleCaseCity(segment)
    const detailLabel = detailTitle?.trim() || 'Experience'
    const headDetailLabel = (seoHeadTitle && seoHeadTitle.trim()) || detailLabel
    const fallbackDesc = isDetail
      ? `${detailLabel} — book this curated experience with Kennedys.`
      : `Curated experiences and activities in ${cityLabel} — book private tours, adventures, and lifestyle add-ons.`

    return (
        <>
        <SeoHead
          title={isDetail ? `${headDetailLabel} | ${SITE_NAME}` : `${cityLabel} experiences | ${SITE_NAME}`}
          description={(seoDescription && seoDescription.trim()) || fallbackDesc}
          siteOrigin={siteOrigin || undefined}
          canonicalPath={segment ? `/experiences/${encodeURIComponent(segment)}` : '/experiences'}
          imageUrl={seoImageUrl || undefined}
          type="website"
        />
        <div className='flex flex-col gap-5'>
            <div className='pt-16 md:pt-32'>
                <Navbar textBlack />
            </div>
            <ExperiencePage
              citySlug={isDetail ? undefined : segment}
              experienceId={isDetail ? segment : undefined}
              initialCityExperiences={isDetail ? null : initialCityExperiences}
              initialExperienceSlug={isDetail ? null : initialExperienceSlug}
            />
        </div>
        <Footer disableTravelSection={true} />
        </>
    )
}

const PREVIEW_MOCK_EXPERIENCE: Record<string, unknown> = {
    id: 'preview-mock-id',
    slug: 'private-catamaran-sunset',
    title: 'Private Catamaran Sunset Cruise',
    duration: '4 hours',
    city: 'Mykonos',
    description:
        'Sail the deep Aegean aboard a private catamaran as the sun melts into the horizon. Your personal crew will guide you past iconic windmills and secret coves while a curated mezze spread and chilled champagne await on deck. The experience is completely private — designed for couples, families, or a small group of friends who want Mykonos from a different angle.',
    price: 'From €1,200',
    priceSuffix: 'per group · up to 8 guests',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80',
    gallery: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80',
        'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&q=80',
        'https://images.unsplash.com/photo-1473854688914-f4aa0d1a1a93?w=800&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
    ],
    included: [
        { title: 'Private catamaran with professional skipper & crew' },
        { title: 'Welcome champagne & premium open bar', sub: ['Prosecco, rosé, spirits, soft drinks & water'] },
        { title: 'Greek mezze selection & seasonal fresh fruit' },
        { title: 'Snorkeling equipment & paddleboards' },
        { title: 'Hotel pickup & drop-off in Mykonos Town' },
        { title: 'Bluetooth sound system & curated playlist' },
    ],
    thingsToKnow: [
        'Maximum 8 guests per cruise.',
        'Departure point: Tourlos Port — 15 minutes from Mykonos Town.',
        'Recommended for guests 5 years and older.',
        'Cruise may be rescheduled in case of adverse weather; full refund if cancelled by operator.',
        'Swimwear & sunscreen recommended.',
        'Dietary requirements accommodated with 48 h notice.',
    ],
    relatedExperiences: [
        {
            title: 'Private Villa Chef Dinner',
            img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
            slug: 'private-villa-chef-dinner',
        },
        {
            title: 'ATV Island Adventure',
            img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75',
            slug: 'atv-island-adventure',
        },
        {
            title: 'Helicopter Island Tour',
            img: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=600&q=75',
            slug: 'helicopter-island-tour',
        },
        {
            title: 'Deep-Sea Fishing Charter',
            img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75',
            slug: 'deep-sea-fishing-charter',
        },
    ],
    latitude: 37.4467,
    longitude: 25.3289,
    mapCountry: 'Greece',
    mapRegion: 'South Aegean',
    mapLocation: 'Mykonos, Greece',
    locationLine1: 'Tourlos Port',
    locationLine2: 'Mykonos, South Aegean, Greece',
    googleMapUrl: 'https://maps.google.com/?q=37.4467,25.3289',
}

export const getServerSideProps: GetServerSideProps<ExperiencesSegmentProps> = async (ctx) => {
    const raw = ctx.params?.segment
    const segment = typeof raw === 'string' ? raw.trim() : ''
    if (!segment) {
        return { notFound: true }
    }

    const siteOrigin = getPublicSiteOriginFromRequest(ctx.req)

    if (segment === 'preview') {
        const previewDesc = truncateMetaDescription(
            stripHtmlToText(String(PREVIEW_MOCK_EXPERIENCE.description)),
            160
        )
        return {
            props: {
                segment,
                pageMode: 'city',
                detailTitle: null,
                seoHeadTitle: null,
                initialCityExperiences: [
                    PREVIEW_MOCK_EXPERIENCE,
                    { ...PREVIEW_MOCK_EXPERIENCE, id: 'preview-mock-2', slug: 'private-villa-chef-dinner', title: 'Private Villa Chef Dinner', heroImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80', gallery: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80'] },
                    { ...PREVIEW_MOCK_EXPERIENCE, id: 'preview-mock-3', slug: 'atv-island-adventure', title: 'ATV Island Adventure', heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80', gallery: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80'] },
                    { ...PREVIEW_MOCK_EXPERIENCE, id: 'preview-mock-4', slug: 'helicopter-island-tour', title: 'Helicopter Island Tour', heroImage: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=1400&q=80', gallery: ['https://images.unsplash.com/photo-1540339832862-474599807836?w=1400&q=80'] },
                ],
                initialExperienceSlug: null,
                siteOrigin,
                seoImageUrl: String(PREVIEW_MOCK_EXPERIENCE.heroImage),
                seoDescription: previewDesc,
                initialSeoMeta: {
                    title: `${titleCaseCity(segment)} experiences | ${SITE_NAME}`,
                    description: previewDesc,
                    imageUrl: String(PREVIEW_MOCK_EXPERIENCE.heroImage),
                },
            },
        }
    }

    const pageMode: PageMode = isExperienceDetailSegment(segment) ? 'detail' : 'city'

    let detailTitle: string | null = null
    let seoHeadTitle: string | null = null
    let seoImageUrl: string | null = null
    let seoDescription: string | null = null

    if (pageMode === 'detail') {
        const res = await getExperienceById(segment)
        const row =
            res?.success && res?.data && typeof res.data === 'object'
                ? (res.data as Record<string, unknown>)
                : null
        if (row) {
            if (typeof row.title === 'string' && row.title.trim()) {
                detailTitle = row.title
            }
            const metaTitleRaw = row.metaTitle ?? row.meta_title
            if (typeof metaTitleRaw === 'string' && metaTitleRaw.trim()) {
                seoHeadTitle = metaTitleRaw.trim()
            }
            const metaDescRaw = row.metaDescription ?? row.meta_description
            const desc = row.description
            if (typeof metaDescRaw === 'string' && metaDescRaw.trim()) {
                seoDescription = truncateMetaDescription(
                    stripHtmlToText(metaDescRaw).replace(/\s+/g, ' ').trim().slice(0, 160),
                    160
                )
            } else if (typeof desc === 'string' && desc.trim()) {
                seoDescription = truncateMetaDescription(stripHtmlToText(desc), 160)
            }
            const hero = row.heroImage ?? row.hero_image
            if (typeof hero === 'string' && hero.trim()) {
                const abs = resolveMediaUrl(hero)
                if (abs) seoImageUrl = abs
            }
        }
    }

    let initialCityExperiences: Record<string, unknown>[] | null = null
    let initialExperienceSlug: string | null = null

    if (pageMode === 'city') {
        const cityRes = await getExperiencesByCity(segment)
        if (
            !cityRes?.success ||
            !Array.isArray(cityRes.data) ||
            cityRes.data.length === 0
        ) {
            return { notFound: true }
        }
        initialCityExperiences = cityRes.data as Record<string, unknown>[]
        const exQ = ctx.query.experience
        initialExperienceSlug =
            typeof exQ === 'string' && exQ.trim() !== '' ? exQ.trim() : null

        const first = initialCityExperiences[0]
        if (first && typeof first === 'object') {
            const f = first as Record<string, unknown>
            const hero = f.heroImage ?? f.hero_image
            if (typeof hero === 'string' && hero.trim()) {
                const abs = resolveMediaUrl(hero)
                if (abs) seoImageUrl = abs
            }
            if (!seoDescription) {
                const d = f.description
                if (typeof d === 'string' && d.trim()) {
                    seoDescription = truncateMetaDescription(stripHtmlToText(d), 160)
                }
            }
        }
    }

    const cityLabel = titleCaseCity(segment)
    const detailLabelForMeta = detailTitle?.trim() || 'Experience'
    const headDetailLabelForMeta = (seoHeadTitle && seoHeadTitle.trim()) || detailLabelForMeta
    const initialSeoMeta = {
        title:
            pageMode === 'detail'
                ? `${headDetailLabelForMeta} | ${SITE_NAME}`
                : `${cityLabel} experiences | ${SITE_NAME}`,
        description:
            (seoDescription && seoDescription.trim()) ||
            (pageMode === 'detail'
                ? `${detailLabelForMeta} — book this curated experience with Kennedys.`
                : `Curated experiences and activities in ${cityLabel} — book private tours, adventures, and lifestyle add-ons.`),
        imageUrl: seoImageUrl || null,
    }

    return {
        props: {
            segment,
            pageMode,
            detailTitle,
            seoHeadTitle,
            initialCityExperiences,
            initialExperienceSlug,
            siteOrigin,
            seoImageUrl,
            seoDescription,
            initialSeoMeta,
        },
    }
}

export default ExperiencesSegmentPage
