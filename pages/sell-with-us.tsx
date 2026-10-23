import React from 'react'
import Navbar from '@/components/custom/Navbar'
import { SellWithUsPage } from '@/components/SellWithUsPage'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'

type SellWithUsProps = {
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const SellWithUs = ({ initialSeoMeta }: SellWithUsProps) => {
    return (
        <div className='flex flex-col'>
            <SeoHead
              title={initialSeoMeta?.title || `Sell with us | ${SITE_NAME}`}
              description={initialSeoMeta?.description || "List your luxury property with Kennedy's Group — sales strategy, marketing, and international buyers."}
              canonicalPath="/sell-with-us"
              imageUrl={initialSeoMeta?.imageUrl ?? undefined}
            />
            <div className='pt-32'>
                <Navbar textBlack />
            </div>
            <SellWithUsPage />
        </div>
    )
}

export async function getServerSideProps() {
  const seoRow = await fetchPageByKeyServer("sell-with-us").catch(() => null);
  return {
    props: {
      initialSeoMeta: {
        title: seoRow?.metaTitle || null,
        description: seoRow?.metaDescription || null,
        imageUrl: seoRow?.metaImageUrl || null,
      },
    },
  };
}

export default SellWithUs
