import React from 'react'
import { WeManageYourVillaPage } from '@/components/weManageYourVillaPage'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { getProperty } from '@/lib/api/properties'
import { getActiveWeManageSections } from '@/lib/api/weManageSections'
import { MANAGED_WE_MANAGE_VILLA_AGENT_IDS, mapWeManagePropertyToCard } from '@/lib/weManageManagedVillas'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage } from '@/lib/pageHeroBanner'

const WE_MANAGE_PROPERTY_IMAGE_KEYS = [
  PAGE_HERO_KEYS.weManageYourPropertyHero,
  PAGE_HERO_KEYS.weManagePropertyUnmatchedExpertise,
  PAGE_HERO_KEYS.weManagePropertyGridItem1,
  PAGE_HERO_KEYS.weManagePropertyGridItem2,
  PAGE_HERO_KEYS.weManagePropertyGridItem3,
  PAGE_HERO_KEYS.weManagePropertyGridItem4,
  PAGE_HERO_KEYS.weManagePropertyLegalOperational,
  PAGE_HERO_KEYS.weManagePropertyOperationalSupport,
  PAGE_HERO_KEYS.weManagePropertyGallery1,
  PAGE_HERO_KEYS.weManagePropertyGallery2,
  PAGE_HERO_KEYS.weManagePropertyGallery3,
  PAGE_HERO_KEYS.weManagePropertyGallery4,
  PAGE_HERO_KEYS.weManagePropertyTailoredServices,
  PAGE_HERO_KEYS.weManagePropertyRestRoom,
  PAGE_HERO_KEYS.weManagePropertyExceptionalServices1,
  PAGE_HERO_KEYS.weManagePropertyExceptionalServices2,
] as const;

function resolveImageOverrides(pages: Array<{ heroBannerPath?: string | null } | null>): Record<string, string> {
  const overrides: Record<string, string> = {};
  WE_MANAGE_PROPERTY_IMAGE_KEYS.forEach((key, i) => {
    overrides[key] = resolvePageHeroImage(key, pages[i]?.heroBannerPath);
  });
  return overrides;
}

type WeManageYourVillaProps = {
  initialProperties?: any[];
  initialSections?: Record<string, any>;
  imageOverrides?: Record<string, string>;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const WeManageYourVilla = ({ initialProperties = [], initialSections = {}, imageOverrides = {}, initialSeoMeta }: WeManageYourVillaProps) => {
  return (
    <>
    <SeoHead
      title={initialSeoMeta?.title || `Villa management | ${SITE_NAME}`}
      description={initialSeoMeta?.description || "Professional management for luxury villa owners — marketing, operations, and guest experience."}
      canonicalPath="/we-manage-your-property"
      imageUrl={initialSeoMeta?.imageUrl || imageOverrides[PAGE_HERO_KEYS.weManageYourPropertyHero]}
    />
    <div className='w-full'>
      <Navbar textBlack={true} />
    </div>
      <div className='pt-32'>
        <WeManageYourVillaPage initialProperties={initialProperties} initialSections={initialSections} imageOverrides={imageOverrides} />
      </div>
      <Footer disableTravelSection={true} />
    </>
  )
}

export async function getServerSideProps() {
  try {
    const [villaResponses, sectionsRes, imagePages, seoRow] = await Promise.all([
      Promise.all(MANAGED_WE_MANAGE_VILLA_AGENT_IDS.map((id) => getProperty(id))),
      getActiveWeManageSections(),
      Promise.all(WE_MANAGE_PROPERTY_IMAGE_KEYS.map((key) => fetchPageByKeyServer(key).catch(() => null))),
      fetchPageByKeyServer("we-manage-your-property").catch(() => null),
    ]);
    const imageOverrides = resolveImageOverrides(imagePages);

    const mappedProperties = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.map((requestedId, index) => {
      const raw = villaResponses[index] as any
      const parsed = raw?.data ?? raw
      const card = mapWeManagePropertyToCard(parsed)
      if (!card) {
        console.log('[we-manage-managed-villas] getServerSideProps missing', { requestedId })
      }
      return card
    }).filter(Boolean) as any[]

    console.log('[we-manage-managed-villas] getServerSideProps summary', {
      requested: MANAGED_WE_MANAGE_VILLA_AGENT_IDS.length,
      resolvedCards: mappedProperties.length,
    })

    let sectionsMap: Record<string, any> = {};
    if (sectionsRes?.success && Array.isArray(sectionsRes.data)) {
      sectionsRes.data.forEach((section: any) => {
        sectionsMap[section.sectionKey] = section;
      });
    }

    return {
      props: {
        initialProperties: mappedProperties,
        initialSections: sectionsMap,
        imageOverrides,
        initialSeoMeta: {
          title: seoRow?.metaTitle || null,
          description: seoRow?.metaDescription || null,
          imageUrl: seoRow?.metaImageUrl || null,
        },
      },
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps we-manage-your-property:', err);
    return { props: { initialProperties: [], initialSections: {}, imageOverrides: resolveImageOverrides([]) } };
  }
}

export default WeManageYourVilla
