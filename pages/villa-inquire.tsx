"use client"

import { useEffect } from "react"
import Head from "next/head"
import { useRouter } from "next/router"

/**
 * Legacy URL: /villa-inquire?propertyId=…&checkIn=…&checkOut=…&guests=…
 * Redirects to the rental detail page and opens the inquiry modal via query.
 */
const VillaInquireRedirect = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query
    const pid = typeof q.propertyId === "string" ? q.propertyId : undefined
    if (!pid) {
      void router.replace("/villas")
      return
    }
    const next = new URLSearchParams()
    next.set("villaInquire", "1")
    const checkIn = typeof q.checkIn === "string" ? q.checkIn : undefined
    const checkOut = typeof q.checkOut === "string" ? q.checkOut : undefined
    const guests = typeof q.guests === "string" ? q.guests : undefined
    if (checkIn) next.set("checkIn", checkIn)
    if (checkOut) next.set("checkOut", checkOut)
    if (guests) next.set("guests", guests)
    const search = next.toString()
    void router.replace(search ? `/villas/${encodeURIComponent(pid)}?${search}` : `/villas/${encodeURIComponent(pid)}`)
  }, [router, router.isReady, router.query])

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex min-h-[40vh] items-center justify-center px-4 pt-24">
        <p className="font-haas text-sm text-[#506A70]">Redirecting…</p>
      </div>
    </>
  )
}

export default VillaInquireRedirect
