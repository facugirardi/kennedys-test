/** @type {import('next').NextConfig} */

const villaLocationSlugs = [
  'mykonos', 'santorini', 'paros', 'antiparos', 'naxos', 'tinos', 'milos',
  'kythnos', 'patmos', 'fourni', 'corfu', 'kefalonia', 'lefkada', 'zakynthos', 'meganissi',
  'hydra', 'spetses', 'skopelos', 'alonissos', 'skiathos',
  'athens-riviera', 'porto-heli', 'peloponnese', 'crete',
  'ibiza', 'mallorca', 'formentera', 'marbella',
  'cannes', 'saint-tropez', 'courchevel', 'meribel',
  'verbier', 'zermatt',
  'st-barts', 'tulum', 'costa-rica',
]

// Region name used for the /villas/list?region= filter. Must match the `name`
// values in lib/locationSlugs.ts (kept separate since next.config.js can't import .ts).
const villaLocationRegionNames = {
  mykonos: 'Mykonos', santorini: 'Santorini', paros: 'Paros', antiparos: 'Antiparos',
  naxos: 'Naxos', tinos: 'Tinos', milos: 'Milos', kythnos: 'Kythnos', patmos: 'Patmos',
  fourni: 'Fourni', corfu: 'Corfu', kefalonia: 'Kefalonia', lefkada: 'Lefkada',
  zakynthos: 'Zakynthos', meganissi: 'Meganissi', hydra: 'Hydra', spetses: 'Spetses',
  skopelos: 'Skopelos', alonissos: 'Alonissos', skiathos: 'Skiathos',
  'athens-riviera': 'Athens Riviera', 'porto-heli': 'Porto Heli', peloponnese: 'Peloponnese',
  crete: 'Crete Island', ibiza: 'Ibiza', mallorca: 'Mallorca', formentera: 'Formentera',
  marbella: 'Marbella', cannes: 'Cannes', 'saint-tropez': 'Saint-Tropez',
  courchevel: 'Courchevel', meribel: 'Meribel', verbier: 'Verbier', zermatt: 'Zermatt',
  'st-barts': 'St Barts', tulum: 'Tulum', 'costa-rica': 'Santa Teressa',
}

const realEstateLocationSlugs = [
  'mykonos', 'santorini', 'paros', 'antiparos', 'naxos', 'tinos', 'milos', 'kythnos',
  'patmos', 'fourni', 'corfu', 'kefalonia', 'lefkada', 'zakynthos', 'meganissi',
  'hydra', 'spetses', 'skopelos', 'alonissos', 'skiathos',
  'athens-riviera', 'peloponnese', 'crete',
  'ibiza', 'mallorca',
]

// Events, experiences and concierge cover the same set of destinations as villas
const eventsLocationSlugs = villaLocationSlugs
const experiencesLocationSlugs = villaLocationSlugs
const conciergeLocationSlugs = villaLocationSlugs

const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'https://api.kennedys.group/api').hostname
  } catch {
    return 'api.kennedys.group'
  }
})()

const longCache = 'public, max-age=31536000, immutable'
// Same filename can be re-uploaded with new content, so no `immutable` for public images.
const imageCache = 'public, max-age=604800, stale-while-revalidate=2592000'

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // The API serves originals (~1MB each, Cache-Control max-age=0, no CDN). Routing them through
    // Vercel's optimizer resizes them, converts to AVIF/WebP and caches them at the edge.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: apiHost },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 160, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'date-fns', '@radix-ui/react-icons'],
  },
  async headers() {
    return [
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: imageCache }] },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: longCache }] },
      { source: '/:file(.*\\.woff2)', headers: [{ key: 'Cache-Control', value: longCache }] },
    ]
  },
  async rewrites() {
    const realEstateRewrites = realEstateLocationSlugs.map((slug) => ({
      source: `/real-estate/${slug}`,
      destination: `/real-estate/location/${slug}`,
    }))
    const eventsRewrites = eventsLocationSlugs.map((slug) => ({
      source: `/events/${slug}`,
      destination: `/events/location/${slug}`,
    }))
    const experiencesRewrites = experiencesLocationSlugs.map((slug) => ({
      source: `/experiences/${slug}`,
      destination: `/experiences/location/${slug}`,
    }))
    const conciergeRewrites = conciergeLocationSlugs.map((slug) => ({
      source: `/concierge/${slug}`,
      destination: `/concierge/location/${slug}`,
    }))
    return [
      ...realEstateRewrites,
      ...eventsRewrites,
      ...experiencesRewrites,
      ...conciergeRewrites,
    ]
  },
  async redirects() {
    const villaLocationRedirects = villaLocationSlugs.map((slug) => ({
      source: `/villas/${slug}`,
      destination: `/villas/list?region=${encodeURIComponent(villaLocationRegionNames[slug])}`,
      permanent: true,
    }))
    return [
      ...villaLocationRedirects,
      {
        source: '/real-estate/porto-heli',
        destination: '/real-estate/peloponnese',
        permanent: true,
      },
      {
        source: '/experiences',
        destination: '/experiences/list',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/www.kennedysgroup.com',
        destination: 'https://www.kennedysgroup.com',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
