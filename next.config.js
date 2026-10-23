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

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
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
