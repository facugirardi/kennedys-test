import React from 'react'
import { RealStatePage } from '@/components/RealStatePage'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage, resolvePageHeroPosition } from '@/lib/pageHeroBanner'

const REAL_ESTATE_TOP_SEARCH_KEYS = [
  PAGE_HERO_KEYS.realEstateTopMykonos,
  PAGE_HERO_KEYS.realEstateTopAthensRiviera,
  PAGE_HERO_KEYS.realEstateTopParos,
] as const

type RealEstateIndexProps = {
  initialHeroBannerUrl: string
  initialHeroBannerPosition: string
  topSearchImages: Record<string, string>
  topSearchPositions: Record<string, string>
  unlockingImages?: string[]
  premiumPortfolioImage?: string
  topNetworkingImage?: string
  heroTitle?: string | null
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null }
}

const RealState = ({ initialHeroBannerUrl, initialHeroBannerPosition, topSearchImages, topSearchPositions, unlockingImages, premiumPortfolioImage, topNetworkingImage, heroTitle, initialSeoMeta }: RealEstateIndexProps) => {

    return (
    <>
        <SeoHead
          title={initialSeoMeta?.title || `Luxury real estate for sale | ${SITE_NAME}`}
          description={initialSeoMeta?.description || "Browse prime luxury homes and investment properties for sale in Greece, Spain, France, and selected global destinations."}
          canonicalPath="/real-estate"
          imageUrl={initialSeoMeta?.imageUrl || initialHeroBannerUrl}
        />
        <div className='flex flex-col gap-5'>
            <div>
                {/* Scrolls away: only the search bar stays pinned under the top edge. */}
                <Navbar textBlack scrollsAway="flow" />
            </div>
            <RealStatePage initialHeroBannerUrl={initialHeroBannerUrl} initialHeroBannerPosition={initialHeroBannerPosition} topSearchImages={topSearchImages} topSearchPositions={topSearchPositions} unlockingImages={unlockingImages} premiumPortfolioImage={premiumPortfolioImage} topNetworkingImage={topNetworkingImage} heroTitle={heroTitle ?? undefined} />
        </div>
        <Footer disableTravelSection={true} />
    </>
    )
}

const UNLOCKING_KEYS = [
  PAGE_HERO_KEYS.realEstateUnlocking1,
  PAGE_HERO_KEYS.realEstateUnlocking2,
  PAGE_HERO_KEYS.realEstateUnlocking3,
  PAGE_HERO_KEYS.realEstateUnlocking4,
] as const

export async function getServerSideProps() {
  try {
    const allKeys = [
      PAGE_HERO_KEYS.realEstateIndex,
      ...REAL_ESTATE_TOP_SEARCH_KEYS,
      ...UNLOCKING_KEYS,
      PAGE_HERO_KEYS.realEstatePremiumPortfolio,
      PAGE_HERO_KEYS.realEstateTopNetworking,
    ]
    const pageRows = await Promise.all(allKeys.map(key => fetchPageByKeyServer(key).catch(() => null)))

    let idx = 0
    const pageRow = pageRows[idx++]
    const initialHeroBannerUrl = resolvePageHeroImage(PAGE_HERO_KEYS.realEstateIndex, pageRow?.heroBannerPath)
    const initialHeroBannerPosition = resolvePageHeroPosition(pageRow?.heroBannerPosition)

    const topSearchImages: Record<string, string> = {}
    const topSearchPositions: Record<string, string> = {}
    REAL_ESTATE_TOP_SEARCH_KEYS.forEach(key => {
      const row = pageRows[idx++]
      topSearchImages[key] = resolvePageHeroImage(key, row?.heroBannerPath)
      topSearchPositions[key] = resolvePageHeroPosition(row?.heroBannerPosition)
    })

    const unlockingImages = UNLOCKING_KEYS.map(key => resolvePageHeroImage(key, pageRows[idx++]?.heroBannerPath))
    const premiumPortfolioImage = resolvePageHeroImage(PAGE_HERO_KEYS.realEstatePremiumPortfolio, pageRows[idx++]?.heroBannerPath)
    const topNetworkingImage = resolvePageHeroImage(PAGE_HERO_KEYS.realEstateTopNetworking, pageRows[idx++]?.heroBannerPath)

    return {
      props: {
        initialHeroBannerUrl,
        initialHeroBannerPosition,
        topSearchImages,
        topSearchPositions,
        unlockingImages,
        premiumPortfolioImage,
        topNetworkingImage,
        heroTitle: pageRow?.heroTitle || null,
        initialSeoMeta: {
          title: pageRow?.metaTitle || null,
          description: pageRow?.metaDescription || null,
          imageUrl: pageRow?.metaImageUrl || null,
        },
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps real-estate index:', err)
    return {
      props: {
        initialHeroBannerUrl: resolvePageHeroImage(PAGE_HERO_KEYS.realEstateIndex, null),
        initialHeroBannerPosition: '50% 50%',
        topSearchImages: {},
        topSearchPositions: {},
        unlockingImages: UNLOCKING_KEYS.map(key => resolvePageHeroImage(key, null)),
        premiumPortfolioImage: resolvePageHeroImage(PAGE_HERO_KEYS.realEstatePremiumPortfolio, null),
        topNetworkingImage: resolvePageHeroImage(PAGE_HERO_KEYS.realEstateTopNetworking, null),
      },
    }
  }
}

export default RealState
