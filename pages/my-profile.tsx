import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { MyProfilePage } from '@/components/myProfilePage'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { useAuth } from '@/src/contexts/AuthContext'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'

export const MyProfile = () => {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [navbarHeight, setNavbarHeight] = useState(0)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
    }
  }, [isAuthenticated, loading, router])

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title={`My profile | ${SITE_NAME}`}
        description=""
        canonicalPath="/my-profile"
        noindex
      />
      <Navbar textBlack={true} className="bg-white" onHeightChange={setNavbarHeight} />
      <main className="flex-1" style={{ paddingTop: navbarHeight }}>
        {isAuthenticated ? <MyProfilePage initialTab={router.query.tab as string | undefined} /> : null}
      </main>
      <Footer disableTravelSection={true} />
    </div>
  )
}

export default MyProfile
