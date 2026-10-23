import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/custom/Navbar'
import { Button } from '@/components/ui/button1'
import { CalendarOff, ChevronRightIcon } from 'lucide-react'
import Footer from '@/components/custom/footerNew'
import EventSearch from '@/components/custom/EventSearch'
import { useContact } from '@/src/contexts/ContactContext'
import { getAllEvents } from '@/lib/api/events'
import { getAllEventServicesOffered } from '@/lib/api/eventServiceOffered'
import { getLatestNews } from '@/lib/api/news'
import { resolveMediaUrl, slugify } from '@/lib/utils'
import { WeAreOnTheNews, UnforgettableExperiencesBanner } from '@/components/promotional-blocks'
import { getPageBlocksData, getBlockDataForType } from '@/lib/utils/contentBlocks'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage } from '@/lib/pageHeroBanner'

/** Fallback estático del hero (/events) si falla la URL del CMS o el archivo en API. */
const EVENTS_PAGE_FALLBACK_HERO_URL = resolvePageHeroImage(PAGE_HERO_KEYS.eventsIndex, null)

/** Carrusel “Unforgettable Events”: primeros N en el mismo orden que el listado (listOrder en API). */
const EVENTS_CAROUSEL_MAX = 3

/** Extrae el array data de la respuesta de la API (evita fallos si la forma varía). */
function getDataArray(res: any): any[] {
  if (!res) return []
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  return []
}

/** Mismas proporciones que Global Concierge Services en el home. */
const EVENT_SERVICES_DESKTOP_WRAP = [
  { width: 332, height: 322 },
  { width: 338, height: 192 },
  { width: 338, height: 192 },
  { width: 332, height: 322 },
] as const

function eventServiceImgSrc(service: { image?: string }) {
  const r = service.image || ''
  if (!r) return ''
  return r.startsWith('/') ? r : (resolveMediaUrl(r) || '')
}

function formatEventServiceLabel(name: string, index: number) {
  const u = name.toUpperCase()
  const words = u.split(' ')
  if (index === 2) {
    return words.length > 1 ? (
      <span className="text-[#D99330]">
        {words[0]}
        <br />
        {words.slice(1).join(' ')}
      </span>
    ) : (
      <span className="text-[#D99330]">{u}</span>
    )
  }
  if (index === 0 && words.length > 1) {
    return (
      <>
        {words[0]}
        <br />
        {words.slice(1).join(' ')}
      </>
    )
  }
  return u
}

/** Sello circular junto a “Contact Our Event Planner” (solo tablet/desktop). */
function EventsPlannerSealSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 141 141"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="70.4178" cy="70.4178" r="65" transform="rotate(5 70.4178 70.4178)" fill="#D99330" />
      <g clipPath="url(#eventsIndexPlannerSealClip)">
        <path d="M47.0425 33.9128L42.7927 26.4592L43.4912 26.061L45.7557 30.0328L47.5151 23.7667L48.422 23.2496L47.0347 28.0603L52.8594 30.5962L52.0254 31.0717L46.8286 28.8133L46.2431 30.8876L47.7409 33.5146L47.0425 33.9128Z" fill="white" />
        <path d="M54.6726 30.0074L51.9317 21.877L57.4581 20.0139L57.6843 20.6848L52.9197 22.291L53.9049 25.2134L58.2715 23.7414L58.4938 24.4009L54.1273 25.8729L55.1968 29.0455L60.0864 27.3971L60.3241 28.1021L54.6726 30.0074Z" fill="white" />
        <path d="M62.609 27.6939L61.5218 19.1831L62.3907 19.072L67.0702 24.5472C67.5809 25.1352 68.0948 25.8438 68.0948 25.8438L68.1186 25.8408L67.1758 18.4608L67.9376 18.3634L69.0249 26.8743L68.1916 26.9807L63.5331 21.5755C63.0643 21.0305 62.4564 20.2492 62.4564 20.2492L62.4326 20.2523L63.3708 27.5966L62.609 27.6939Z" fill="white" />
        <path d="M71.5402 26.9682L72.1492 18.4098L73.023 18.472L76.5334 24.761C76.9184 25.438 77.2828 26.2339 77.2828 26.2339L77.3067 26.2356L77.8348 18.8144L78.6008 18.8689L77.9919 27.4272L77.154 27.3676L73.6504 21.1513C73.298 20.5247 72.8557 19.6391 72.8557 19.6391L72.8318 19.6374L72.3063 27.0227L71.5402 26.9682Z" fill="white" />
        <path d="M80.4086 28.0355L82.713 19.7708L88.3307 21.3371L88.1406 22.0191L83.2973 20.6687L82.469 23.6394L86.9077 24.877L86.7208 25.5474L82.2821 24.3098L81.3829 27.5348L86.3533 28.9207L86.1534 29.6373L80.4086 28.0355Z" fill="white" />
        <path d="M89.3094 30.322L91.2148 31.2874C93.0452 32.2148 94.4611 31.3852 95.4427 29.4477C96.4244 27.5102 96.3581 25.8622 94.5276 24.9348L92.5473 23.9314L89.3094 30.322ZM88.2722 30.5902L92.1501 22.9365L94.869 24.3141C97.1276 25.4585 97.3419 27.558 96.1921 29.8273C95.0422 32.0966 93.1748 33.0742 90.9162 31.9298L88.2722 30.5902Z" fill="white" />
        <path d="M97.4625 36.1036L99.7365 33.1293L100.214 27.4071L100.92 27.9464L100.476 32.8338L100.495 32.8483L105.114 31.1534L105.801 31.6782L100.37 33.644L98.1107 36.5992L97.4625 36.1036Z" fill="white" />
        <path d="M108.3 36.469L109.959 36.0254L110.623 36.7516L108.737 36.9473L108.3 36.469Z" fill="white" />
        <path d="M108.058 48.1822C106.854 46.2745 107.334 44.6518 108.693 43.6803L109.122 44.3602C107.939 45.2063 107.774 46.4739 108.633 47.8337C109.305 48.8992 110.342 49.3512 111.327 48.7299C112.352 48.083 112.166 47.2494 111.501 45.4983C110.919 43.9922 110.729 42.7923 111.998 41.9917C113.155 41.2615 114.531 41.7553 115.446 43.2064C116.465 44.8198 116.105 46.1825 114.94 47.1022L114.523 46.4426C115.471 45.674 115.538 44.6103 114.885 43.5752C114.186 42.4691 113.236 42.1324 112.434 42.6384C111.572 43.1829 111.731 44.0192 112.307 45.4718C112.923 47.0552 113.315 48.44 111.793 49.4008C110.504 50.2142 109.019 49.7044 108.058 48.1822Z" fill="white" />
        <path d="M112.988 59.8779C112.317 57.4613 113.751 55.5815 116.225 54.8948C118.665 54.2177 120.915 55.1002 121.611 57.6094C122.083 59.3091 121.554 60.8134 119.961 61.5793L119.739 60.7815C120.906 60.1837 121.29 59.0559 120.941 57.7955C120.35 55.6679 118.45 55.1491 116.45 55.7042C114.415 56.269 113.128 57.7345 113.673 59.7002C114.203 61.6081 115.749 62.0632 117.183 61.6653L117.472 61.5851L116.734 58.9256L117.416 58.7363L118.366 62.159L114.122 63.3366L113.971 62.7932L115.245 62.2655L115.235 62.2308C114.446 61.9891 113.412 61.4043 112.988 59.8779Z" fill="white" />
        <path d="M114.297 65.6242L122.86 65.0854L123.1 68.9059C123.197 70.4508 122.367 71.3928 120.942 71.4825C119.888 71.5488 119.164 71.1374 118.791 70.1749L118.755 70.1772C118.512 71.0823 117.883 71.4104 116.557 71.5539C115.184 71.7004 114.846 71.878 114.748 72.0405L114.701 72.0435L114.646 71.1812C114.766 70.9813 115.086 70.913 116.543 70.7492C118.023 70.584 118.41 70.0426 118.332 68.7971L118.168 66.1862L114.347 66.4266L114.297 65.6242ZM118.85 66.1433L119.023 68.8859C119.101 70.1314 119.752 70.7277 120.818 70.6606C121.884 70.5936 122.464 70.0761 122.383 68.7827L122.204 65.9323L118.85 66.1433Z" fill="white" />
        <path d="M114.525 77.8551C114.232 79.8982 115.727 81.2276 117.782 81.5219C119.837 81.8162 121.645 80.9598 121.937 78.9166C122.228 76.8853 120.732 75.5679 118.677 75.2736C116.622 74.9793 114.816 75.8238 114.525 77.8551ZM113.812 77.753C114.156 75.3535 116.266 74.0797 118.796 74.4421C121.326 74.8044 122.994 76.6192 122.65 79.0187C122.305 81.4301 120.193 82.7157 117.663 82.3534C115.133 81.991 113.467 80.1644 113.812 77.753Z" fill="white" />
        <path d="M111.524 86.4489C112.169 84.6914 113.432 83.8254 115.28 84.503L120.778 86.5193L120.501 87.2742L115.071 85.2827C113.584 84.7373 112.682 85.3141 112.165 86.7223C111.674 88.063 111.968 89.1424 113.455 89.6878L118.886 91.6793L118.609 92.4341L113.111 90.4178C111.241 89.7319 110.884 88.1952 111.524 86.4489Z" fill="white" />
        <path d="M109.346 91.6219L116.684 96.0679L114.937 98.9519C114.452 99.7524 113.902 100.149 113.256 100.291C112.708 100.408 112.134 100.313 111.528 99.9457C110.174 99.1249 109.913 97.8869 110.846 96.3474L112.121 94.2434L108.929 92.3096L109.346 91.6219ZM112.706 94.5979L111.462 96.6505C110.741 97.8411 111.007 98.6757 111.931 99.2353C112.875 99.8074 113.74 99.56 114.381 98.5029L115.662 96.3887L112.706 94.5979Z" fill="white" />
        <path d="M104.571 103.19L105.044 103.667L102.862 105.829L102.389 105.352L104.571 103.19Z" fill="white" />
        <path d="M94.9445 107.376L99.294 114.772L98.601 115.18L96.2832 111.239L94.6083 117.528L93.7083 118.057L95.0309 113.228L89.1726 110.771L90.0001 110.284L95.2269 112.472L95.7844 110.39L94.2514 107.784L94.9445 107.376Z" fill="white" />
        <path d="M87.4083 111.373L90.2667 119.462L84.7679 121.405L84.532 120.738L89.2728 119.063L88.2453 116.155L83.9006 117.69L83.6687 117.034L88.0135 115.499L86.8981 112.342L82.0328 114.061L81.785 113.359L87.4083 111.373Z" fill="white" />
        <path d="M79.4897 113.802L80.6971 122.296L79.8298 122.419L75.0734 117.011C74.5545 116.43 74.0306 115.729 74.0306 115.729L74.0068 115.732L75.0538 123.098L74.2935 123.206L73.086 114.712L73.9177 114.594L78.6521 119.932C79.1286 120.471 79.7475 121.243 79.7475 121.243L79.7712 121.24L78.7293 113.91L79.4897 113.802Z" fill="white" />
        <path d="M70.5787 114.669L70.0415 123.232L69.1672 123.177L65.6041 116.918C65.2135 116.244 64.8425 115.451 64.8425 115.451L64.8185 115.45L64.3526 122.875L63.5861 122.827L64.1234 114.264L64.9617 114.316L68.5173 120.503C68.875 121.127 69.3246 122.009 69.3246 122.009L69.3486 122.01L69.8122 114.621L70.5787 114.669Z" fill="white" />
        <path d="M61.6446 113.702L59.4515 121.997L53.8132 120.507L53.9942 119.822L58.8551 121.107L59.6435 118.126L55.1885 116.948L55.3665 116.275L59.8214 117.453L60.6772 114.216L55.6886 112.897L55.8788 112.178L61.6446 113.702Z" fill="white" />
        <path d="M52.7339 111.551L50.8154 110.612C48.9724 109.71 47.5681 110.559 46.6132 112.51C45.6584 114.461 45.7474 116.108 47.5905 117.01L49.5845 117.986L52.7339 111.551ZM53.7673 111.269L49.9954 118.975L47.2577 117.635C44.9835 116.522 44.7404 114.426 45.8588 112.141C46.9772 109.856 48.8309 108.853 51.1051 109.966L53.7673 111.269Z" fill="white" />
        <path d="M44.5074 105.868L42.2736 108.872L41.8727 114.601L41.1601 114.071L41.538 109.178L41.5188 109.164L36.9229 110.92L36.2295 110.405L41.633 108.366L43.8525 105.381L44.5074 105.868Z" fill="white" />
        <path d="M33.6566 105.647L32.0035 106.113L31.3299 105.396L33.213 105.175L33.6566 105.647Z" fill="white" />
        <path d="M33.7624 93.9662C34.9937 95.8565 34.537 97.4859 33.1918 98.4767L32.753 97.8031C33.9238 96.9402 34.0704 95.6703 33.1928 94.3229C32.505 93.2672 31.4612 92.83 30.4859 93.4653C29.4704 94.1269 29.6679 94.9577 30.3583 96.6992C30.9614 98.1967 31.1684 99.3938 29.9115 100.213C28.7652 100.959 27.3823 100.485 26.4457 99.0473C25.4043 97.4486 25.7451 96.0809 26.8967 95.1446L27.3224 95.7981C26.3855 96.5803 26.3342 97.6449 27.0023 98.6705C27.7162 99.7664 28.6713 100.089 29.4656 99.5721C30.3203 99.0153 30.1495 98.1814 29.5524 96.7372C28.9135 95.1627 28.5021 93.7837 30.0104 92.8013C31.2874 91.9694 32.7799 92.458 33.7624 93.9662Z" fill="white" />
        <path d="M28.6568 82.3368C29.3615 84.7437 27.9547 86.6436 25.4902 87.3652C23.0602 88.0767 20.798 87.2261 20.0663 84.727C19.5706 83.0341 20.0783 81.5225 21.6605 80.7341L21.8932 81.5288C20.7351 82.143 20.3667 83.2761 20.7343 84.5314C21.3547 86.6505 23.2618 87.1424 25.2541 86.559C27.281 85.9656 28.5472 84.482 27.9739 82.5242C27.4176 80.624 25.8653 80.1907 24.4372 80.6088L24.1493 80.6931L24.9249 83.3419L24.2454 83.5409L23.2473 80.132L27.4738 78.8945L27.6323 79.4358L26.3666 79.9814L26.3768 80.0159C27.1695 80.2465 28.2117 80.8166 28.6568 82.3368Z" fill="white" />
        <path d="M27.2718 76.6072L18.7172 77.2669L18.4229 73.4503C18.3039 71.9069 19.1209 70.9532 20.5447 70.8434C21.5976 70.7622 22.3266 71.1633 22.7133 72.1204L22.7492 72.1177C22.9801 71.2092 23.604 70.8723 24.9274 70.71C26.2987 70.5441 26.6337 70.3618 26.7294 70.1979L26.7773 70.1942L26.8437 71.0557C26.7268 71.2573 26.4075 71.33 24.9534 71.5144C23.4753 71.7006 23.0962 72.2474 23.1922 73.4917L23.3933 76.0999L27.21 75.8056L27.2718 76.6072ZM22.7114 76.1525L22.5001 73.4127C22.4041 72.1684 21.745 71.5813 20.6802 71.6634C19.6153 71.7455 19.0421 72.2712 19.1417 73.5633L19.3613 76.4109L22.7114 76.1525Z" fill="white" />
        <path d="M26.8692 64.3836C27.1336 62.3366 25.6208 61.028 23.5619 60.7621C21.503 60.4962 19.7073 61.3774 19.4429 63.4244C19.18 65.4595 20.6944 66.7561 22.7533 67.0221C24.8122 67.288 26.6063 66.4187 26.8692 64.3836ZM27.5833 64.4758C27.2727 66.8799 25.1806 68.1826 22.6457 67.8552C20.1107 67.5277 18.4183 65.7362 18.7288 63.3321C19.0409 60.9162 21.1345 59.6016 23.6695 59.929C26.2044 60.2564 27.8953 62.0599 27.5833 64.4758Z" fill="white" />
        <path d="M29.7608 55.7395C29.1408 57.5058 27.8896 58.3893 26.0327 57.7376L20.5071 55.7982L20.7734 55.0396L26.231 56.9551C27.7256 57.4797 28.6192 56.8904 29.116 55.475C29.5889 54.1276 29.2795 53.0524 27.7849 52.5279L22.3273 50.6124L22.5935 49.8537L28.1191 51.7931C29.9987 52.4528 30.3768 53.9844 29.7608 55.7395Z" fill="white" />
        <path d="M31.8718 50.5197L24.473 46.1754L26.1803 43.2676C26.6542 42.4604 27.1979 42.056 27.8427 41.9058C28.3889 41.7812 28.964 41.8684 29.5745 42.2269C30.9404 43.0289 31.2176 44.2632 30.3062 45.8154L29.0607 47.9368L32.2789 49.8264L31.8718 50.5197ZM28.4708 47.5904L29.686 45.5208C30.3908 44.3204 30.1134 43.4895 29.182 42.9427C28.23 42.3837 27.3681 42.643 26.7422 43.7088L25.4906 45.8405L28.4708 47.5904Z" fill="white" />
        <path d="M36.4883 38.8875L36.0089 38.4166L38.1617 36.2251L38.6411 36.696L36.4883 38.8875Z" fill="white" />
        <path d="M64.9958 54.9468C65.4651 54.5161 66.1037 54.331 66.9006 54.4007L66.9695 53.6137L59.508 52.9609L59.4391 53.7479L59.8077 53.7802C60.4453 53.836 60.9198 54.1485 61.2513 54.7196C61.5729 55.2898 61.6985 56.0335 61.6192 56.9401L59.3793 82.5423C59.2878 83.5883 59.0115 84.3371 58.5603 84.7895C58.0992 85.241 57.4706 85.4269 56.6737 85.3572L56.6083 86.1043L64.0698 86.7571L64.1352 86.01L63.7168 85.9734C63.0792 85.9176 62.6046 85.605 62.2732 85.034C61.9516 84.4638 61.8268 83.7101 61.9088 82.7736L64.1487 57.1714C64.2402 56.1254 64.5165 55.3767 64.9858 54.9459L64.9958 54.9468Z" fill="white" />
        <path d="M83.7345 87.7841C83.1274 87.3796 82.3793 86.752 81.4827 85.8705C80.5852 84.999 79.5094 83.8709 78.2744 82.4981C77.0294 81.1243 75.5606 79.4399 73.8771 77.4557L65.6173 67.799L78.5847 58.4135L78.6245 58.417C81.12 56.6277 83.1787 55.814 84.8125 55.9569L84.8813 55.1699L79.9103 54.735L79.8415 55.522C80.0606 55.5412 80.2083 55.5742 80.2746 55.6201C80.3408 55.6661 80.3663 55.7185 80.3611 55.7783C80.3297 56.1369 79.7425 56.7681 78.6093 57.6728L63.1544 68.758L71.8224 78.9121C73.3184 80.629 74.6552 82.1011 75.8626 83.3311C77.0601 84.5601 78.1554 85.5794 79.1503 86.3692C80.1345 87.168 81.0464 87.7597 81.8752 88.1534C82.704 88.5472 83.487 88.7763 84.2342 88.8417L85.2702 88.9323L85.3138 88.4342C84.8755 88.3959 84.3524 88.1794 83.7453 87.775L83.7345 87.7841Z" fill="white" />
      </g>
      <defs>
        <clipPath id="eventsIndexPlannerSealClip">
          <rect width="102.72" height="102.72" fill="white" transform="translate(24.0568 15.167) rotate(5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

function EventsListEmptyState() {
  return (
    <div className="w-full py-12 text-center md:py-16" role="status">
      <span className="sr-only">No events published yet</span>
      <CalendarOff className="mx-auto mb-4 h-10 w-10 text-[#506A70]/45" strokeWidth={1.25} aria-hidden />
      <p className="font-gtsuper-ds text-lg font-light text-[#506A70] md:text-xl">No events yet</p>
      <p className="mx-auto mt-2 max-w-md font-haas text-sm font-light leading-relaxed text-[#172338]/75">
        New experiences will appear here soon. In the meantime, get in touch and we&apos;ll help plan yours.
      </p>
    </div>
  )
}

function EventsListSkeleton() {
  return (
    <div className="flex flex-col gap-10 w-full animate-pulse" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading events</span>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
        >
          <div className="w-full md:w-[635px] h-56 md:h-[364px] shrink-0 bg-gray-200" />
          <div className="flex flex-col gap-4 flex-1 w-full max-w-[700px] pt-1">
            <div className="h-12 md:h-14 w-[85%] max-w-md bg-gray-200 rounded-sm" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ServicesOfferedSkeleton() {
  const desktopWrap = [
    { width: 332, height: 322 },
    { width: 338, height: 192 },
    { width: 338, height: 192 },
    { width: 332, height: 322 },
  ] as const
  return (
    <div className="mx-auto text-center px-4 pb-10 animate-pulse" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading services</span>
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="relative w-full pb-[100%]">
              <div className="absolute inset-0 bg-gray-200" />
            </div>
            <div className="mx-auto mt-[10px] h-4 w-3/4 max-w-[140px] bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="hidden md:flex justify-center px-15 gap-6 -translate-x-5">
        {desktopWrap.map((dim, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1 mt-10 ${
              index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-64 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
            } ${
              index === 1 ? 'translate-y-72 z-10 translate-x-16 mt-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-32' : ''
            } ${
              index === 2 ? '-translate-x-40 mt-10 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-60' : ''
            } ${
              index === 3 ? '-translate-x-36 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-56' : ''
            }`}
          >
            <div
              className={`relative overflow-hidden bg-gray-200 ${index === 1 ? '-mt-3' : ''} ${index === 2 ? 'mt-3' : ''}`}
              style={{ width: dim.width, height: dim.height }}
            />
            <div className={`mx-auto mt-[10px] h-5 w-32 bg-gray-200 rounded-sm ${index === 2 ? 'md:ml-auto' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function UnforgettableEventsCarouselSkeleton() {
  return (
    <div
      className="flex justify-center gap-3 md:gap-4 min-h-[200px] items-center max-w-full animate-pulse"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading event carousel</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[260px] md:w-[372px] h-[360px] md:h-[468px] bg-gray-200"
        />
      ))}
    </div>
  )
}

const DEFAULT_HERO_TITLE = 'EVENTS'
const DEFAULT_HERO_SUBTITLE = "Let's face it, we've all been to events that were a bit of a letdown. But here's the big secret: a memorable event isn't just about the budget. Whether it's personal or corporate, it's about creating something truly special and unforgettable."

type EventsPageProps = {
  initialEvents?: any[];
  initialServicesOffered?: any[];
  initialNews?: any[];
  initialPageBlocks?: any[];
  initialHeroBannerUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const KennedysEvents = ({
  initialEvents = [],
  initialServicesOffered = [],
  initialNews = [],
  initialPageBlocks = [],
  initialHeroBannerUrl,
  heroTitle = DEFAULT_HERO_TITLE,
  heroSubtitle = DEFAULT_HERO_SUBTITLE,
  initialSeoMeta,
}: EventsPageProps) => {
  const [heroBannerSrc, setHeroBannerSrc] = useState(
    () => (initialHeroBannerUrl?.trim() || EVENTS_PAGE_FALLBACK_HERO_URL)
  )
  const heroFallbackAppliedRef = useRef(false)

  useEffect(() => {
    setHeroBannerSrc(initialHeroBannerUrl?.trim() || EVENTS_PAGE_FALLBACK_HERO_URL)
    heroFallbackAppliedRef.current = false
  }, [initialHeroBannerUrl])

  const router = useRouter()
    const { openContactForm } = useContact()
    const [location, setLocation] = useState('')
    const [area, setArea] = useState('')
    const [eventType, setEventType] = useState('')
    const [priceMin, setPriceMin] = useState('')
    const [priceMax, setPriceMax] = useState('')
    const availableLocations: string[] = []
    const [events, setEvents] = useState<any[]>(initialEvents)
    const [isLoadingEvents, setIsLoadingEvents] = useState(!initialEvents.length)
    const [servicesOffered, setServicesOffered] = useState<any[]>(initialServicesOffered)
    const [isLoadingServicesOffered, setIsLoadingServicesOffered] = useState(!initialServicesOffered.length)
    const [news, setNews] = useState<any[]>(initialNews)
    const [isLoadingNews, setIsLoadingNews] = useState(!initialNews.length)
    const [pageBlocks, setPageBlocks] = useState<any[]>(initialPageBlocks)

    useEffect(() => {
        if (initialEvents.length) return
        let isMounted = true
        const loadEvents = async () => {
            setIsLoadingEvents(true)
            try {
                const response = await getAllEvents({ listing: 1 })
                const data = getDataArray(response)
                if (!isMounted) return
                const mapped = data.map((event: any) => ({
                    id: event.id,
                    name: event.name || '',
                    summary: event.summary || '',
                    image: resolveMediaUrl(event.image || '') || '',
                }))
                if (isMounted) setEvents(mapped)
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Failed to load events', error)
                if (isMounted) setEvents([])
            } finally {
                if (isMounted) setIsLoadingEvents(false)
            }
        }
        loadEvents()
        return () => { isMounted = false }
    }, [initialEvents.length])

    useEffect(() => {
        if (initialServicesOffered.length) return
        let isMounted = true
        const loadServicesOffered = async () => {
            setIsLoadingServicesOffered(true)
            try {
                const response = await getAllEventServicesOffered()
                const data = getDataArray(response)
                if (!isMounted) return
                if (isMounted) setServicesOffered(data)
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Failed to load services offered', error)
                if (isMounted) setServicesOffered([])
            } finally {
                if (isMounted) setIsLoadingServicesOffered(false)
            }
        }
        loadServicesOffered()
        return () => { isMounted = false }
    }, [initialServicesOffered.length])

    useEffect(() => {
        if (initialNews.length) return
        let isMounted = true
        const loadNews = async () => {
            setIsLoadingNews(true)
            try {
                const response = await getLatestNews(3)
                const data = getDataArray(response)
                if (!isMounted) return
                if (isMounted) setNews(data)
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Failed to load news', error)
                if (isMounted) setNews([])
            } finally {
                if (isMounted) setIsLoadingNews(false)
            }
        }
        loadNews()
        return () => { isMounted = false }
    }, [initialNews.length])

    useEffect(() => {
        if (initialEvents.length || initialServicesOffered.length || initialNews.length) return
        let isMounted = true
        const loadBlocks = async () => {
            try {
                const blocks = await getPageBlocksData('events-index')
                if (isMounted) setPageBlocks(blocks ?? [])
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Error loading page blocks:', error)
            }
        }
        loadBlocks()
        return () => { isMounted = false }
    }, [initialEvents.length, initialServicesOffered.length, initialNews.length])

    const handleEventClick = (eventName: string) => {
        const slug = slugify(eventName)
        router.push(`/events/${slug}`)
    }

    const displayEvents = useMemo(() => {
        if (isLoadingEvents) return []
        return events
    }, [isLoadingEvents, events])

    const carouselEvents = useMemo(() => {
        return displayEvents.slice(0, EVENTS_CAROUSEL_MAX)
    }, [displayEvents])

    const displayServicesOffered = useMemo(() => {
        if (isLoadingServicesOffered) return []
        return servicesOffered
    }, [isLoadingServicesOffered, servicesOffered])

    return (
        <>
            <SeoHead
              title={initialSeoMeta?.title || `Event production & celebrations | ${SITE_NAME}`}
              description={initialSeoMeta?.description || "Destination weddings, corporate events, MICE, and private celebrations — full-service production worldwide."}
              canonicalPath="/events"
              imageUrl={initialSeoMeta?.imageUrl || heroBannerSrc}
            />
            <section className='flex flex-col items-center'>
                <section className='mb-6 md:mb-10 pt-10 flex flex-col w-full gap-5 relative h-[260px] sm:h-[300px] md:h-[600px] items-center justify-center px-4 bg-[#172338]'>
                    <Navbar textBlack={true} stickyOnScroll className="absolute top-0 left-0 w-full z-20 bg-transparent" />
                    <img
                      className='absolute top-0 left-0 w-full h-full object-cover'
                      src={heroBannerSrc}
                      alt=''
                      onError={() => {
                        if (heroFallbackAppliedRef.current) return
                        heroFallbackAppliedRef.current = true
                        setHeroBannerSrc(EVENTS_PAGE_FALLBACK_HERO_URL)
                      }}
                    />
                    <h1 className='text-white text-4xl sm:text-5xl md:text-8xl font-light pt-6 md:pt-8 font-gtsuper-ds z-10 text-center max-w-full'>{heroTitle}</h1>
                </section>
                
                {/* Search and Filter Bar (Figma: Location, Event Type, Price Range, Filter, Show X Services) */}
                <EventSearch
                    location={location}
                    area={area}
                    eventType={eventType}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    onLocationChange={setLocation}
                    onAreaChange={setArea}
                    onEventTypeChange={setEventType}
                    onPriceMinChange={setPriceMin}
                    onPriceMaxChange={setPriceMax}
                    availableLocations={availableLocations}
                    hidePriceRange
                    hideFiltersButton
                />
                <section className='relative flex flex-col items-center gap-5 max-w-[1440px] mb-8 md:mb-10 px-4 sm:px-5 mt-6 md:mt-10'>
                    <p className='text-sm sm:text-base md:text-xl text-[#172338] font-haas font-thin text-center max-w-[800px] leading-relaxed whitespace-pre-line'>{heroSubtitle}</p>
                    <div className='relative w-full flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-6 md:mb-10'>
                        <Button 
                            type='button'
                            onClick={() => openContactForm('EVENTS')}
                            className='bg-[#28F6EA] hover:bg-[#28F6EA]/80 py-3 md:py-6 px-4 sm:px-5 min-h-[44px] h-auto font-haas font-light rounded-none text-soft-gray-dark whitespace-normal text-center gap-1 relative z-10'
                        >
                            <span className='inline-flex flex-wrap items-center justify-center gap-1'>
                              Contact Our Agent <ChevronRightIcon className='shrink-0' size={16} />
                            </span>
                        </Button>
                        <div
                          className='pointer-events-none absolute max-[1000px]:hidden'
                          style={{ top: 'calc(50% + 30px)', transform: 'translateY(-50%)', right: '120px' }}
                          aria-hidden
                        >
                            <EventsPlannerSealSvg className='aspect-square w-[clamp(4.5rem,10vw,8.8125rem)] max-w-[141px] shrink-0' />
                        </div>

                        {/* Social sidebar */}
                        <div className='pointer-events-auto absolute top-1/2 -translate-y-1/2 max-[1000px]:hidden flex flex-col items-center gap-6' style={{ right: '-4px' }}>
                          <a href="https://www.facebook.com/kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                          </a>
                          <a href="https://www.instagram.com/kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                          </a>
                          <a href="https://www.linkedin.com/company/kennedys-group" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                          <a href="https://www.tiktok.com/@kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                          </a>
                          <div className="w-[1px] h-16 bg-[#506A70]/40" />
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#48A4B4">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                    </div>
                    <section className='flex flex-col gap-10 w-full'>
                        {isLoadingEvents ? (
                            <EventsListSkeleton />
                        ) : displayEvents.length === 0 ? (
                            <EventsListEmptyState />
                        ) : (
                            <div className='flex flex-col gap-10'>
                                {displayEvents.map((event: any, index: number) => {
                                    const eventImage = event.image || ''
                                    const isEven = index % 2 === 0
                                    const titleColor = isEven ? '#D99330' : '#506A70'
                                    const titleHeadingClass =
                                      'font-light font-gtsuper-ds pt-2 md:pt-3 pb-0 leading-[1.05] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[60px] break-words max-w-full'
                                    const titleLineClass = 'w-full border-b-[0.5px] border-soft-gray-dark mt-3 md:mt-4'
                                    const titleBlockOffset = 'w-full mt-3 md:mt-6 lg:mt-8'
                                    return (
                                        <div key={event.id} className={`flex flex-col md:flex-row gap-6 md:gap-8 items-start ${!isEven ? 'md:justify-between' : ''}`}>
                                            {isEven ? (
                                                <>
                                                    <div className='relative w-full md:w-[635px] h-56 md:h-[364px] shrink-0 bg-[#E8EBED]'>
                                                      {eventImage ? (
                                                        <img src={eventImage} alt={event.name || ''} className='w-full h-full object-cover'/>
                                                      ) : null}
                                                    </div>
                                                    <div className='flex flex-col gap-4 md:gap-5 items-start'>
                                                        <div className={titleBlockOffset}>
                                                            <h2
                                                                className={titleHeadingClass}
                                                                style={{ color: titleColor }}
                                                            >
                                                                {event.name.toUpperCase()}
                                                            </h2>
                                                            <div className={titleLineClass} />
                                                        </div>
                                                        <p className='font-haas font-light max-w-[700px] text-[#303D40]'>{event.summary}</p>
                                                        <Button variant={"ghost"} className='underline text-soft-gray-dark font-bold px-0' onClick={() => router.push(`/events/${slugify(event.name)}`)}>More info</Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className='flex flex-col gap-4 md:gap-5 items-start order-2 md:order-1'>
                                                        <div className={titleBlockOffset}>
                                                            <h2 className={titleHeadingClass} style={{ color: titleColor }}>
                                                                {(() => {
                                                                    const parts = event.name.toUpperCase().split(' ')
                                                                    if (parts.length <= 2) return parts.join(' ')
                                                                    return <>{parts[0]}<br />{parts.slice(1).join(' ')}</>
                                                                })()}
                                                            </h2>
                                                            <div className={titleLineClass} />
                                                        </div>
                                                        <p className='font-haas font-light max-w-[700px] text-[#303D40]'>{event.summary}</p>
                                                        <Button variant={"ghost"} className='underline text-soft-gray-dark font-bold px-0' onClick={() => router.push(`/events/${slugify(event.name)}`)}>More info</Button>
                                                    </div>
                                                    <div className='relative w-full md:w-[635px] h-56 md:h-[364px] shrink-0 order-1 md:order-2 bg-[#E8EBED]'>
                                                      {eventImage ? (
                                                        <img src={eventImage} alt={event.name || ''} className='w-full h-full object-cover'/>
                                                      ) : null}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                </section>
                {(isLoadingServicesOffered || servicesOffered.length > 0) ? (
                <section className="mb-10 w-full bg-white pb-12 md:mb-14 md:pb-[80px] [font-family:'Abhaya_Libre',serif]">
                    <div className='mx-auto text-center px-4 py-10 sm:py-14 md:py-16'>
                        <h2 className='text-center font-gtsuper-ds text-3xl sm:text-4xl md:text-5xl mb-3 md:mb-4 font-thin text-[#506A70] px-1'>
                            Services Offered
                        </h2>
                        <p className='text-center font-haas text-sm sm:text-base md:text-lg font-light text-[#172338] mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed'>
                            Planning, production, and on-the-ground support for weddings, corporate programs, and private celebrations.
                        </p>
                        {isLoadingServicesOffered ? (
                            <ServicesOfferedSkeleton />
                        ) : (
                            <>
                                {/* Mobile/tablet: misma grilla 2×2 que Global Concierge Services */}
                                <div className='grid grid-cols-2 gap-4 md:hidden'>
                                    {displayServicesOffered.slice(0, 4).map((service: any, index: number) => (
                                        <div key={service.id} className='text-center'>
                                            <div className='relative w-full pb-[100%] bg-[#E8EBED]'>
                                                {eventServiceImgSrc(service) ? (
                                                  <img
                                                      src={eventServiceImgSrc(service)}
                                                      alt={service.name || ''}
                                                      className='absolute inset-0 h-full w-full object-cover'
                                                  />
                                                ) : null}
                                            </div>
                                            <p className='mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]'>
                                                {formatEventServiceLabel(service.name, index)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop: collage alineado con el home */}
                                <div className='hidden md:flex justify-center px-15 gap-6 -translate-x-5'>
                                    {displayServicesOffered.slice(0, 4).map((service: any, index: number) => {
                                        const wrap = EVENT_SERVICES_DESKTOP_WRAP[index] ?? EVENT_SERVICES_DESKTOP_WRAP[0]
                                        return (
                                            <div
                                                key={service.id}
                                                className={`flex flex-col gap-1 mt-10 ${
                                                    index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-64 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
                                                } ${
                                                    index === 1 ? 'translate-y-72 z-10 translate-x-16 mt-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-32' : ''
                                                } ${
                                                    index === 2 ? '-translate-x-40 mt-10 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-60' : ''
                                                } ${
                                                    index === 3 ? '-translate-x-36 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-56' : ''
                                                }`}
                                            >
                                                <div
                                                    className={`relative overflow-hidden bg-[#E8EBED] ${index === 1 ? '-mt-3' : ''} ${index === 2 ? 'mt-3' : ''}`}
                                                    style={{ width: wrap.width, height: wrap.height }}
                                                >
                                                    {eventServiceImgSrc(service) ? (
                                                      <img
                                                          src={eventServiceImgSrc(service)}
                                                          alt={service.name || ''}
                                                          className='h-full w-full object-cover'
                                                      />
                                                    ) : null}
                                                </div>
                                                <p
                                                    className={`mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50] ${
                                                        index === 2 ? 'md:text-right' : 'md:text-left'
                                                    }`}
                                                >
                                                    {formatEventServiceLabel(service.name, index)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </section>
                ) : null}
                <section className='flex flex-col bg-soft-gray-dark items-center gap-8 md:gap-10 w-full py-12 sm:py-16 md:py-20 px-4 sm:px-5'>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl text-center text-primary font-light font-gtsuper-ds px-2'>Why We Stand Out</h2>
                    <div className='w-full max-w-[1440px] flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 overflow-x-auto md:overflow-visible snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] px-4 md:px-0 -mx-4 md:mx-0'>
                        <div className='flex flex-col gap-3 md:gap-5 shrink-0 snap-start snap-always w-[85vw] sm:w-[70vw] md:w-auto'>
                            <h3 className='text-[#F0F3F5] text-xl sm:text-2xl font-gtsuper-ds font-light'>TAILORED APPROACH</h3>
                            <p className='text-[#F0F3F5] leading-6 sm:leading-7 font-haas font-light text-sm sm:text-base'>We understand that every event is <br className="hidden md:block" /> unique, which is why we tailor our <br className="hidden md:block" /> services to meet your specific needs and <br className="hidden md:block" /> preferences, ensuring a truly <br className="hidden md:block" /> personalized experience.</p>
                        </div>
                        <div className='flex flex-col gap-3 md:gap-5 shrink-0 snap-start snap-always w-[85vw] sm:w-[70vw] md:w-auto'>
                            <h3 className='text-[#F0F3F5] text-xl sm:text-2xl font-gtsuper-ds font-light'>CREATIVE VISION</h3>
                            <p className='text-[#F0F3F5] leading-6 sm:leading-7 font-haas font-light text-sm sm:text-base'>Our team is dedicated to bringing your <br className="hidden md:block" /> vision to life, whether it&apos;s a fairy-tale <br className="hidden md:block" /> wedding or a themed party. We go above <br className="hidden md:block" /> and  beyond to create unforgettable <br className="hidden md:block" /> experiences  that leave a lasting <br className="hidden md:block" /> impression.</p>
                        </div>
                        <div className='flex flex-col gap-3 md:gap-5 shrink-0 snap-start snap-always w-[85vw] sm:w-[70vw] md:w-auto'>
                            <h3 className='text-[#F0F3F5] text-xl sm:text-2xl font-gtsuper-ds font-light'>ATTENTION TO DETAIL</h3>
                            <p className='text-[#F0F3F5] leading-6 sm:leading-7 font-haas font-light text-sm sm:text-base'>From the moment you contact us until the <br className="hidden md:block" /> last guest leaves, we pay meticulous <br className="hidden md:block" /> attention to every detail to ensure that <br className="hidden md:block" /> your event is flawless and exceeds your <br className="hidden md:block" /> expectations.</p>
                        </div>
                        <div className='flex flex-col gap-3 md:gap-5 shrink-0 snap-start snap-always w-[85vw] sm:w-[70vw] md:w-auto'>
                            <h3 className='text-[#F0F3F5] text-xl sm:text-2xl font-gtsuper-ds font-light'>EXCEPTIONAL SERVICE</h3>
                            <p className='text-[#F0F3F5] leading-6 sm:leading-7 font-haas font-light text-sm sm:text-base'>Our commitment to excellence is evident <br className="hidden md:block" /> in everything we do. From our prompt and <br className="hidden md:block" /> professional communication to our <br className="hidden md:block" /> seamless coordination on the day of the <br className="hidden md:block" /> event, we strive to provide exceptional <br className="hidden md:block" /> service at every step of the way.</p>
                        </div>
                    </div>
                    <Button type='button' onClick={() => openContactForm('EVENTS')} className='font-haas font-light bg-[#28F6EA] hover:bg-[#28F6EA]/80 py-3 md:py-5 px-5 min-h-[44px] h-auto rounded-none text-soft-gray-dark whitespace-normal inline-flex items-center justify-center gap-1'>Contact Now <ChevronRightIcon className='shrink-0' size={16} /></Button>
                </section>
                {(() => {
                    const bannerBlockData = getBlockDataForType(pageBlocks, 'unforgettable-experiences-banner');
                    const data = bannerBlockData ? {
                        image: bannerBlockData.image ?? undefined,
                        text: bannerBlockData.text ?? undefined,
                    } : undefined;
                    return <UnforgettableExperiencesBanner data={data} />;
                })()}
                {!isLoadingEvents && displayEvents.length > 0 ? (
                <section className='w-full flex flex-col items-center gap-6 md:gap-10 py-12 sm:py-16 md:py-20 px-3 sm:px-4'>
                    <h2 className='text-2xl sm:text-3xl md:text-5xl text-[#3B4B53] text-center font-gtsuper-ds font-light w-full max-w-[1440px] px-2'>Unforgettable Events</h2>
                    <div className='w-full max-w-[1440px] mx-auto flex justify-center px-0 sm:px-2 md:px-4'>
                            <div className='min-w-0 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] max-w-[min(1100px,calc(100vw-1rem))] sm:max-w-[min(1100px,calc(100vw-2.5rem))] md:max-w-[min(1200px,calc(100vw-8rem))] pl-1 pr-1 sm:px-0'>
                                <div className='flex gap-3 md:gap-4 min-h-[200px] items-center w-max pb-1 mx-auto justify-center'>
                                    {carouselEvents.map((event: any) => (
                                        <button
                                            key={event.id}
                                            type='button'
                                            onClick={() => handleEventClick(event.name)}
                                            className='flex-shrink-0 snap-start snap-always flex flex-col h-[300px] sm:h-[340px] md:h-[468px] relative gap-4 md:gap-5 w-[min(85vw,280px)] sm:w-[260px] md:w-[372px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#172338] bg-[#E8EBED]'
                                        >
                                            {event.image ? (
                                              <img src={event.image} alt={event.name || ''} className='w-full h-full object-cover' />
                                            ) : null}
                                            {event.image ? (
                                              <div className='absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/15 to-transparent' />
                                            ) : null}
                                            <div className='absolute bottom-5 left-5 right-5 text-left'>
                                                <h3 className={`font-gtsuper-ds font-light text-xl md:text-2xl drop-shadow-md ${event.image ? 'text-white' : 'text-[#172338]'}`}>{event.name}</h3>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                    </div>
                </section>
                ) : isLoadingEvents ? (
                <section className='w-full flex flex-col items-center gap-6 md:gap-10 py-12 sm:py-16 md:py-20 px-3 sm:px-4'>
                    <h2 className='text-2xl sm:text-3xl md:text-5xl text-[#3B4B53] text-center font-gtsuper-ds font-light w-full max-w-[1440px] px-2'>Unforgettable Events</h2>
                    <div className='w-full max-w-[1440px] mx-auto flex justify-center px-0 sm:px-2 md:px-4'>
                        <UnforgettableEventsCarouselSkeleton />
                    </div>
                </section>
                ) : null}
                {(() => {
                    const newsBlockData = getBlockDataForType(pageBlocks, 'we-are-on-the-news');
                    const shouldShow = pageBlocks.some(pb => pb.blockType === 'we-are-on-the-news' && pb.enabled);
                    if (!shouldShow && !newsBlockData && news.length === 0) return null;
                    
                    // Convert null values to undefined and extract only needed properties
                    const blockData = newsBlockData ? {
                        newsItems: newsBlockData.newsItems ?? undefined,
                        title: newsBlockData.title ?? undefined,
                    } : undefined;
                    
                    return <WeAreOnTheNews news={news} blockData={blockData} />;
                })()}
            </section>
            <Footer disableTravelSection={true} />
        </>
    )
}

export async function getServerSideProps() {
  try {
    const [eventsRes, servicesRes, newsRes, pageBlocks, pageRow] = await Promise.all([
      getAllEvents({ listing: 1 }),
      getAllEventServicesOffered(),
      getLatestNews(3),
      getPageBlocksData('events-index'),
      fetchPageByKeyServer(PAGE_HERO_KEYS.eventsIndex),
    ])
    const eventsData = getDataArray(eventsRes)
    const initialEvents = eventsData.map((event: any) => ({
      id: event.id,
      name: event.name || '',
      summary: event.summary || '',
      image: resolveMediaUrl(event.image || '') || '',
    }))
    const initialServicesOffered = getDataArray(servicesRes)
    const initialNews = getDataArray(newsRes)
    return {
      props: {
        initialEvents,
        initialServicesOffered,
        initialNews,
        initialPageBlocks: Array.isArray(pageBlocks) ? pageBlocks : [],
        initialHeroBannerUrl: resolvePageHeroImage(
          PAGE_HERO_KEYS.eventsIndex,
          pageRow?.heroBannerPath
        ),
        heroTitle: pageRow?.heroTitle || DEFAULT_HERO_TITLE,
        heroSubtitle: pageRow?.heroSubtitle || DEFAULT_HERO_SUBTITLE,
        initialSeoMeta: {
          title: pageRow?.metaTitle || null,
          description: pageRow?.metaDescription || null,
          imageUrl: pageRow?.metaImageUrl || null,
        },
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps events:', err)
    return {
      props: {
        initialEvents: [],
        initialServicesOffered: [],
        initialNews: [],
        initialPageBlocks: [],
        initialHeroBannerUrl: resolvePageHeroImage(PAGE_HERO_KEYS.eventsIndex, null),
      },
    }
  }
}

export default KennedysEvents
