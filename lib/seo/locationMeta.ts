import { SITE_NAME } from './config'

export interface LocationPageMeta {
  title: string
  description: string
}

interface LocationServiceMeta {
  villas: LocationPageMeta
  realEstate: LocationPageMeta
  concierge: LocationPageMeta
  events: LocationPageMeta
  experiences: LocationPageMeta
}

const META: Record<string, LocationServiceMeta> = {
  Greece: {
    villas: {
      title: `Luxury Villa Rentals in Greece | ${SITE_NAME}`,
      description:
        "Discover hand-picked luxury villas across Greece — from the Cyclades to the Ionian Islands. Private pools, sea views, and exceptional Kennedy's Group service.",
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in Greece | ${SITE_NAME}`,
      description:
        "Explore premium properties for sale across Greece. Sea-view villas, island estates, and Athens Riviera residences — curated by Kennedy's Group.",
    },
    concierge: {
      title: `Concierge Services in Greece | ${SITE_NAME}`,
      description:
        'Premium concierge services throughout Greece — yacht charters, private chefs, chauffeurs, and bespoke experiences tailored to your stay.',
    },
    events: {
      title: `Events in Greece | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Plan extraordinary events across Greece — destination weddings on Mykonos, corporate retreats in Athens, and private island celebrations with full concierge support.',
    },
    experiences: {
      title: `Greece Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Discover curated experiences across Greece — yacht charters, island hopping, private wine tours, ancient site visits, and world-class Aegean gastronomy.',
    },
  },

  // ─── Mainland Greece ────────────────────────────────────────────────────────

  'Mainland Greece': {
    villas: {
      title: `Luxury Villa Rentals in Mainland Greece | ${SITE_NAME}`,
      description:
        'Luxury villas in mainland Greece — from the Attic coastline to the Peloponnese. Spacious estates, private pools, and access to ancient landmarks.',
    },
    realEstate: {
      title: `Real Estate for Sale in Mainland Greece | ${SITE_NAME}`,
      description:
        "Buy luxury property in mainland Greece. Coastal villas, hillside retreats, and investment-grade residences in Greece's most storied landscapes.",
    },
    concierge: {
      title: `Concierge Services in Mainland Greece | ${SITE_NAME}`,
      description:
        'Tailored concierge services across mainland Greece — private tours, drivers, gourmet experiences, and seamless logistics from arrival to departure.',
    },
    events: {
      title: `Mainland Greece Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Host unforgettable events in mainland Greece — private dinners, corporate retreats, and bespoke celebrations across the Attic Riviera, Peloponnese, and beyond.',
    },
    experiences: {
      title: `Mainland Greece Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Exclusive experiences in mainland Greece — private tours of ancient landmarks, Athens Riviera sailing, curated gastronomy, and immersive cultural journeys.',
    },
  },

  'Athens Riviera': {
    villas: {
      title: `Luxury Villa Rentals on the Athens Riviera | ${SITE_NAME}`,
      description:
        'Rent a luxury villa on the Athens Riviera. Seafront estates and hillside retreats with private pools, minutes from cosmopolitan Athens.',
    },
    realEstate: {
      title: `Real Estate for Sale on the Athens Riviera | ${SITE_NAME}`,
      description:
        "Invest in Athens Riviera real estate — Greece's most sophisticated coastal corridor. Sea-view villas, contemporary apartments, and prestigious estates.",
    },
    concierge: {
      title: `Concierge Services on the Athens Riviera | ${SITE_NAME}`,
      description:
        'Exclusive concierge services on the Athens Riviera — private drivers, restaurant reservations, yacht day trips, and curated Athens cultural experiences.',
    },
    events: {
      title: `Athens Riviera Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Organise exceptional events on the Athens Riviera — elegant seafront dinners, yacht parties, corporate gatherings, and celebrations with a stunning Attic backdrop.',
    },
    experiences: {
      title: `Athens Riviera Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated experiences on the Athens Riviera — private cooking classes, archaeological day trips, sunset sailing, and exclusive coastal dining experiences.',
    },
  },

  'Porto Heli': {
    villas: {
      title: `Luxury Villa Rentals in Porto Heli, Greece | ${SITE_NAME}`,
      description:
        'Experience the "Portofino of Greece" — rent a private villa in Porto Heli. Secluded coves, turquoise waters, and elegant living on the Peloponnese coast.',
    },
    realEstate: {
      title: `Real Estate for Sale in Porto Heli, Greece | ${SITE_NAME}`,
      description:
        "Own a piece of Porto Heli — one of Greece's most exclusive coastal retreats. Waterfront villas and private estates in an idyllic Argolic Gulf setting.",
    },
    concierge: {
      title: `Concierge Services in Porto Heli, Greece | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Porto Heli — private boat hire, gourmet dining, water sports, and seamless arrangements for your Peloponnese escape.',
    },
    events: {
      title: `Porto Heli Events | Luxury Celebrations in Greece | ${SITE_NAME}`,
      description:
        'Create timeless events in Porto Heli — intimate villa dinners, yacht gatherings, private beach celebrations, and bespoke occasions on the Peloponnese coast.',
    },
    experiences: {
      title: `Porto Heli Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Bespoke experiences in Porto Heli — private boat hire to secluded coves, local seafood tastings, water sports, and curated Peloponnese cultural journeys.',
    },
  },

  Peloponnese: {
    realEstate: {
      title: `Real Estate for Sale in the Peloponnese, Greece | ${SITE_NAME}`,
      description:
        'Discover luxury homes and estates for sale across the Peloponnese — from the Argolic coast and Porto Heli to historic towns and olive-clad hillsides.',
    },
  },

  Kythnos: {
    realEstate: {
      title: `Real Estate for Sale in Kythnos, Greece | ${SITE_NAME}`,
      description:
        'Browse prime properties for sale on Kythnos — an unspoiled Cycladic island with authentic charm, thermal springs, and secluded coves.',
    },
  },

  Fourni: {
    realEstate: {
      title: `Real Estate for Sale in Fourni, Greece | ${SITE_NAME}`,
      description:
        'Explore real estate opportunities on Fourni — a tranquil Dodecanese archipelago known for fishing villages, crystal waters, and understated island living.',
    },
  },

  // ─── Cyclades Islands ───────────────────────────────────────────────────────

  'Cyclades Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Cyclades | ${SITE_NAME}`,
      description:
        'Browse luxury villas across the Cyclades — Mykonos, Santorini, Paros, and beyond. Iconic whitewashed architecture, private pools, and infinite Aegean views.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Cyclades | ${SITE_NAME}`,
      description:
        "Discover premium properties for sale in the Cyclades. From Mykonos hideaways to Santorini caldera villas — invest in Greece's most iconic archipelago.",
    },
    concierge: {
      title: `Concierge Services in the Cyclades | ${SITE_NAME}`,
      description:
        'Premium concierge services across the Cyclades — inter-island transfers, private yachts, Michelin-star dining, and tailor-made island experiences.',
    },
    events: {
      title: `Cyclades Events | Luxury Island Events & Parties | ${SITE_NAME}`,
      description:
        'Host world-class events across the Cyclades — from Mykonos beach parties to Santorini cliffside weddings. Every occasion designed to perfection.',
    },
    experiences: {
      title: `Cyclades Experiences | Luxury Island Activities | ${SITE_NAME}`,
      description:
        'Discover premium experiences across the Cyclades — island hopping, private sailing, sunset catamaran cruises, and authentic Aegean culinary adventures.',
    },
  },

  Mykonos: {
    villas: {
      title: `Luxury Villa Rentals in Mykonos, Greece | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Mykonos — the Cyclades' most glamorous island. Private infinity pools, Aegean views, and easy access to the island's legendary beach clubs.",
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in Mykonos | ${SITE_NAME}`,
      description:
        "Buy a property in Mykonos — one of Greece's most sought-after real estate markets. Sea-view villas, boutique estates, and prime investment opportunities.",
    },
    concierge: {
      title: `Concierge Services in Mykonos, Greece | ${SITE_NAME}`,
      description:
        'Elite concierge services in Mykonos — private yacht charters, VIP beach club access, helicopter transfers, private chefs, and bespoke island itineraries.',
    },
    events: {
      title: `Mykonos Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        "Host an iconic event in Mykonos — villa parties, sunset beach soirées, destination weddings, and corporate celebrations on the Cyclades' most glamorous island.",
    },
    experiences: {
      title: `Mykonos Experiences | Luxury Activities & VIP Access | ${SITE_NAME}`,
      description:
        'Curated experiences in Mykonos — VIP beach club access, private yacht charters, helicopter arrivals, gourmet dining, and bespoke island itineraries.',
    },
  },

  Paros: {
    villas: {
      title: `Luxury Villa Rentals in Paros, Greece | ${SITE_NAME}`,
      description:
        'Discover luxury villas in Paros — golden beaches, picturesque Naoussa harbour, and authentic Cycladic charm. The perfect blend of sophistication and relaxation.',
    },
    realEstate: {
      title: `Real Estate for Sale in Paros, Greece | ${SITE_NAME}`,
      description:
        'Invest in Paros real estate — a rising star in the Cyclades with a vibrant expat community, stunning beaches, and strong rental yield potential.',
    },
    concierge: {
      title: `Concierge Services in Paros, Greece | ${SITE_NAME}`,
      description:
        'Personalised concierge services in Paros — sailing excursions, private chefs, curated dining in Naoussa, and bespoke island experiences for every occasion.',
    },
    events: {
      title: `Paros Events | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Celebrate in style in Paros — intimate villa dinners, beach parties in Naoussa, private sailing events, and bespoke gatherings on this Cycladic gem.',
    },
    experiences: {
      title: `Paros Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Discover unique experiences in Paros — sailing to Antiparos, local winery visits, private cooking classes in Naoussa, and curated Cycladic adventures.',
    },
  },

  Antiparos: {
    villas: {
      title: `Luxury Villa Rentals in Antiparos, Greece | ${SITE_NAME}`,
      description:
        'Escape to Antiparos — an exclusive Cycladic hideaway favoured by discerning travellers. Stylish luxury villas, pristine beaches, and total tranquillity.',
    },
    realEstate: {
      title: `Real Estate for Sale in Antiparos, Greece | ${SITE_NAME}`,
      description:
        'Own a home in Antiparos — a secluded island retreat with natural beauty, crystal-clear waters, and a growing community of celebrity and design-world residents.',
    },
    concierge: {
      title: `Concierge Services in Antiparos, Greece | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Antiparos — private boat day trips, cave excursions, curated dining, and discreet on-island support throughout your stay.',
    },
    events: {
      title: `Antiparos Events | Exclusive Island Celebrations | ${SITE_NAME}`,
      description:
        'Create unforgettable events on Antiparos — intimate private gatherings, villa soirées, sunset sailing parties, and exclusive celebrations on this serene island.',
    },
    experiences: {
      title: `Antiparos Experiences | Luxury Island Activities | ${SITE_NAME}`,
      description:
        'Exclusive experiences in Antiparos — private boat trips to sea caves, cave excursions, secluded beach days, and authentic local dining in a tranquil setting.',
    },
  },

  Santorini: {
    villas: {
      title: `Luxury Villa Rentals in Santorini, Greece | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in Santorini and wake up to iconic caldera views. Clifftop infinity pools, whitewashed suites, and legendary Oia sunsets await.',
    },
    realEstate: {
      title: `Real Estate for Sale in Santorini, Greece | ${SITE_NAME}`,
      description:
        "Buy a caldera villa or clifftop residence in Santorini. One of the world's most desirable addresses — rare properties with unmatched views and strong rental demand.",
    },
    concierge: {
      title: `Concierge Services in Santorini, Greece | ${SITE_NAME}`,
      description:
        'Luxury concierge services in Santorini — private catamaran sunsets, helicopter arrivals, sommelier-guided wine tours, private chefs, and VIP island planning.',
    },
    events: {
      title: `Santorini Events | Luxury Events & Weddings | ${SITE_NAME}`,
      description:
        'Plan a dream event in Santorini — legendary caldera weddings, cliffside celebrations, private yacht parties, and corporate events with iconic Aegean backdrops.',
    },
    experiences: {
      title: `Santorini Experiences | Luxury Activities & Tours | ${SITE_NAME}`,
      description:
        'Curated experiences in Santorini — private catamaran sunsets, wine tours through Assyrtiko vineyards, helicopter rides, and bespoke caldera dining experiences.',
    },
  },

  Naxos: {
    villas: {
      title: `Luxury Villa Rentals in Naxos, Greece | ${SITE_NAME}`,
      description:
        'Explore luxury villas in Naxos — the largest Cycladic island. Long sandy beaches, mountain villages, local produce, and a relaxed yet refined island atmosphere.',
    },
    realEstate: {
      title: `Real Estate for Sale in Naxos, Greece | ${SITE_NAME}`,
      description:
        "Invest in Naxos real estate — a diverse Cycladic island with seafront plots, village houses, and fertile landscapes at some of the Aegean's most competitive prices.",
    },
    concierge: {
      title: `Concierge Services in Naxos, Greece | ${SITE_NAME}`,
      description:
        'Tailored concierge services in Naxos — jeep tours to marble villages, private sailing, windsurfing lessons, local food experiences, and fully managed stays.',
    },
    events: {
      title: `Naxos Events | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Host memorable events in Naxos — beachfront celebrations, private villa dinners, local food experiences, and curated gatherings on this diverse Cycladic island.',
    },
    experiences: {
      title: `Naxos Experiences | Curated Island Activities | ${SITE_NAME}`,
      description:
        'Unique experiences in Naxos — private jeep tours to marble villages, kite surfing lessons, local produce tastings, and curated Cycladic cultural adventures.',
    },
  },

  Tinos: {
    villas: {
      title: `Luxury Villa Rentals in Tinos, Greece | ${SITE_NAME}`,
      description:
        'Stay in a luxury villa in Tinos — an authentically Greek Cycladic island celebrated for its marble crafts, gastronomy, and unhurried island lifestyle.',
    },
    realEstate: {
      title: `Real Estate for Sale in Tinos, Greece | ${SITE_NAME}`,
      description:
        'Buy property in Tinos — an authentic Cycladic gem with traditional dovecotes, a vibrant food scene, and growing appeal among discerning European buyers.',
    },
    concierge: {
      title: `Concierge Services in Tinos, Greece | ${SITE_NAME}`,
      description:
        'Curated concierge services in Tinos — private cooking classes, marble sculpture tours, sailing day trips, and personalised arrangements for your Cycladic retreat.',
    },
    events: {
      title: `Tinos Events | Authentic Greek Island Events | ${SITE_NAME}`,
      description:
        'Celebrate on Tinos — intimate villa gatherings, culinary events in traditional villages, private dining, and bespoke experiences on this authentic Cycladic island.',
    },
    experiences: {
      title: `Tinos Experiences | Curated Cultural Activities | ${SITE_NAME}`,
      description:
        'Immersive experiences in Tinos — marble art workshops, private cooking masterclasses, vineyard tours, sailing excursions, and authentic Cycladic village life.',
    },
  },

  Milos: {
    villas: {
      title: `Luxury Villa Rentals in Milos, Greece | ${SITE_NAME}`,
      description:
        'Discover luxury villas in Milos — a volcanic Cycladic island with dramatic moonscapes, coloured fishing villages, and over 70 beaches of breathtaking beauty.',
    },
    realEstate: {
      title: `Real Estate for Sale in Milos, Greece | ${SITE_NAME}`,
      description:
        'Invest in Milos real estate — a unique volcanic island with rising international appeal, stunning coastal scenery, and exceptional investment potential.',
    },
    concierge: {
      title: `Concierge Services in Milos, Greece | ${SITE_NAME}`,
      description:
        'Premium concierge services in Milos — private boat tours of sea caves and coloured beaches, local wine experiences, catamaran charters, and full island logistics.',
    },
    events: {
      title: `Milos Events | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Create exceptional events in Milos — private beach parties in coloured coves, villa celebrations, sunset boat gatherings, and unique volcanic island soirées.',
    },
    experiences: {
      title: `Milos Experiences | Unique Island Activities | ${SITE_NAME}`,
      description:
        'Unforgettable experiences in Milos — private boat tours of sea caves and coloured beaches, saline lake visits, catamaran charters, and local wine tastings.',
    },
  },

  // ─── Dodecanese Islands ─────────────────────────────────────────────────────

  'Dodecanese Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Dodecanese | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in the Dodecanese — a sun-drenched island chain stretching to the Turkish coast. Rhodes, Patmos, Kos, and beyond, steeped in history and beauty.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Dodecanese | ${SITE_NAME}`,
      description:
        'Explore real estate in the Dodecanese — from medieval Rhodes to sacred Patmos. Unique properties with rich heritage, vibrant tourism, and strong investment fundamentals.',
    },
    concierge: {
      title: `Concierge Services in the Dodecanese | ${SITE_NAME}`,
      description:
        'Expert concierge services across the Dodecanese — inter-island logistics, private charters, historical tours, and bespoke arrangements for your island journey.',
    },
    events: {
      title: `Dodecanese Events | Luxury Events in the Aegean | ${SITE_NAME}`,
      description:
        'Plan luxury events across the Dodecanese — private villa gatherings, boat party cruises, historic venue celebrations, and bespoke island events in Greece.',
    },
    experiences: {
      title: `Dodecanese Experiences | Curated Activities | ${SITE_NAME}`,
      description:
        'Discover curated experiences across the Dodecanese — historic site tours, private sailing between islands, local cuisine, and rich cultural immersions.',
    },
  },

  Patmos: {
    villas: {
      title: `Luxury Villa Rentals in Patmos, Greece | ${SITE_NAME}`,
      description:
        'Stay in a luxury villa on Patmos — the sacred "Island of the Apocalypse." Medieval Chora, crystalline coves, and a serene ambiance unlike any other Greek island.',
    },
    realEstate: {
      title: `Real Estate for Sale in Patmos, Greece | ${SITE_NAME}`,
      description:
        'Own a home in Patmos — a UNESCO World Heritage island of rare spiritual and architectural beauty, with limited supply and enduring appeal among exclusive buyers.',
    },
    concierge: {
      title: `Concierge Services in Patmos, Greece | ${SITE_NAME}`,
      description:
        'Discreet concierge services in Patmos — guided monastery visits, private sailing, secluded beach access, gourmet dining, and seamless on-island arrangements.',
    },
    events: {
      title: `Patmos Events | Sacred Island Events & Gatherings | ${SITE_NAME}`,
      description:
        'Create deeply meaningful events on Patmos — intimate villa celebrations, sunset sailing dinners, and exclusive island soirées on this UNESCO World Heritage island.',
    },
    experiences: {
      title: `Patmos Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Exclusive experiences on Patmos — guided monastery tours, private sailing to secluded coves, local food and wine tastings, and serene coastal island walks.',
    },
  },

  // ─── Ionian Islands ─────────────────────────────────────────────────────────

  'Ionian Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Ionian Islands | ${SITE_NAME}`,
      description:
        'Discover luxury villas across the Ionian Islands — lush, green, and fringed with turquoise water. Corfu, Kefalonia, Lefkada, Zakynthos, and more await.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Ionian Islands | ${SITE_NAME}`,
      description:
        "Invest in Ionian Islands real estate — a verdant archipelago off Greece's western coast with Venetian heritage, dramatic scenery, and year-round appeal.",
    },
    concierge: {
      title: `Concierge Services in the Ionian Islands | ${SITE_NAME}`,
      description:
        'Tailored concierge services across the Ionian Islands — sailing itineraries, private transfers, local food tours, and personalised arrangements for every stay.',
    },
    events: {
      title: `Ionian Islands Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Plan exceptional events across the Ionian Islands — villa weddings, private beach gatherings, yacht parties, and bespoke celebrations on lush Ionian shores.',
    },
    experiences: {
      title: `Ionian Islands Experiences | Curated Activities | ${SITE_NAME}`,
      description:
        'Curated experiences across the Ionian Islands — sailing between islands, private vineyard visits, beach and kayak adventures, and local cultural immersions.',
    },
  },

  Corfu: {
    villas: {
      title: `Luxury Villa Rentals in Corfu, Greece | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Corfu — the Emerald Island. Venetian old town, lush hillsides, crystal bays, and elegant villas set within one of Greece's most beautiful islands.",
    },
    realEstate: {
      title: `Real Estate for Sale in Corfu, Greece | ${SITE_NAME}`,
      description:
        'Buy property in Corfu — a UNESCO World Heritage destination with a cosmopolitan heritage, stunning natural setting, and a strong market for luxury real estate.',
    },
    concierge: {
      title: `Concierge Services in Corfu, Greece | ${SITE_NAME}`,
      description:
        'Premium concierge services in Corfu — private sailing, Old Town guided tours, villa staffing, gourmet experiences, and full-service island lifestyle management.',
    },
    events: {
      title: `Corfu Events | Luxury Private Events & Weddings | ${SITE_NAME}`,
      description:
        "Host stunning events in Corfu — Old Town venue celebrations, villa garden parties, yacht gatherings, and destination weddings on Greece's Emerald Island.",
    },
    experiences: {
      title: `Corfu Experiences | Luxury Activities & Tours | ${SITE_NAME}`,
      description:
        'Curated experiences in Corfu — private Old Town walking tours, sailing day trips, olive grove tastings, traditional cooking classes, and curated cultural journeys.',
    },
  },

  Kefalonia: {
    villas: {
      title: `Luxury Villa Rentals in Kefalonia, Greece | ${SITE_NAME}`,
      description:
        "Explore luxury villas in Kefalonia — dramatic mountains, the iconic Myrtos Beach, Melissani Cave, and some of the Ionian's most spectacular natural scenery.",
    },
    realEstate: {
      title: `Real Estate for Sale in Kefalonia, Greece | ${SITE_NAME}`,
      description:
        'Invest in Kefalonia real estate — a large, diverse Ionian island with clifftop estate plots, Fiskardo harbour homes, and outstanding natural value.',
    },
    concierge: {
      title: `Concierge Services in Kefalonia, Greece | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Kefalonia — vineyard tours, private boat hire to Ithaca, Myrtos Beach excursions, local dining, and fully managed villa stays.',
    },
    events: {
      title: `Kefalonia Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Celebrate in Kefalonia — spectacular cliff venue events, private beachfront parties near Myrtos, villa gatherings, and bespoke occasions in this stunning Ionian setting.',
    },
    experiences: {
      title: `Kefalonia Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Bespoke experiences in Kefalonia — private boat trips to Ithaca, vineyard tours, Melissani Cave excursions, Myrtos Beach picnics, and Ionian culinary adventures.',
    },
  },

  Lefkada: {
    villas: {
      title: `Luxury Villa Rentals in Lefkada, Greece | ${SITE_NAME}`,
      description:
        'Discover luxury villas in Lefkada — an Ionian island connected to the mainland by bridge, famous for its turquoise lagoons and the breathtaking Porto Katsiki beach.',
    },
    realEstate: {
      title: `Real Estate for Sale in Lefkada, Greece | ${SITE_NAME}`,
      description:
        "Buy property in Lefkada — an accessible Ionian gem with stunning beach scenery, vibrant Lefkada Town, and real estate opportunities across hillside and coastal sites.",
    },
    concierge: {
      title: `Concierge Services in Lefkada, Greece | ${SITE_NAME}`,
      description:
        'Tailored concierge services in Lefkada — kite surfing arrangements, sailing charters around the Meganissi strait, private dining, and complete island support.',
    },
    events: {
      title: `Lefkada Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Host unforgettable events in Lefkada — beachfront celebrations, kite surfing parties, villa dinners, and bespoke occasions with turquoise lagoon backdrops.',
    },
    experiences: {
      title: `Lefkada Experiences | Curated Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Lefkada — kite surfing lessons, sailing excursions around the Meganissi strait, private boat charters, and authentic Ionian dining.',
    },
  },

  Zakynthos: {
    villas: {
      title: `Luxury Villa Rentals in Zakynthos, Greece | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in Zakynthos — home to the world-famous Navagio Shipwreck Beach and loggerhead sea turtles. Natural drama meets Ionian elegance.',
    },
    realEstate: {
      title: `Real Estate for Sale in Zakynthos, Greece | ${SITE_NAME}`,
      description:
        'Invest in Zakynthos real estate — a vibrant Ionian island with diverse landscapes, strong tourism demand, and property options from coastal villas to hilltop retreats.',
    },
    concierge: {
      title: `Concierge Services in Zakynthos, Greece | ${SITE_NAME}`,
      description:
        'Expert concierge services in Zakynthos — Navagio boat tours, sea turtle watching excursions, private transfers, local gastronomy, and full villa management.',
    },
    events: {
      title: `Zakynthos Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Create memorable events in Zakynthos — private Navagio celebrations, villa beach parties, sunset sailing gatherings, and bespoke occasions on the Ionian Sea.',
    },
    experiences: {
      title: `Zakynthos Experiences | Curated Island Activities | ${SITE_NAME}`,
      description:
        'Unique experiences in Zakynthos — Navagio Shipwreck boat tours, sea turtle watching, Blue Caves exploration, private sailing, and local Ionian food experiences.',
    },
  },

  Meganissi: {
    villas: {
      title: `Luxury Villa Rentals in Meganissi, Greece | ${SITE_NAME}`,
      description:
        'Stay in a luxury villa on Meganissi — an unspoiled Ionian island reachable only by sea, beloved by sailing enthusiasts for its crystal coves and authentic Greek life.',
    },
    realEstate: {
      title: `Real Estate for Sale in Meganissi, Greece | ${SITE_NAME}`,
      description:
        'Own a home on Meganissi — a rare, peaceful retreat in the Ionian with limited development, traditional village character, and exceptional natural beauty.',
    },
    concierge: {
      title: `Concierge Services in Meganissi, Greece | ${SITE_NAME}`,
      description:
        'Personalised concierge services in Meganissi — private sailing, water taxi hire, local taverna reservations, and seamless island logistics for your secluded stay.',
    },
    events: {
      title: `Meganissi Events | Exclusive Secluded Events | ${SITE_NAME}`,
      description:
        'Host intimate events on Meganissi — private villa dinners, secluded cove gatherings, sailing soirées, and exclusive occasions on this car-free Ionian island.',
    },
    experiences: {
      title: `Meganissi Experiences | Exclusive Activities | ${SITE_NAME}`,
      description:
        'Exclusive experiences on Meganissi — private sailing, crystal-clear cove swimming, local taverna dining, and authentic off-the-beaten-path Ionian adventures.',
    },
  },

  // ─── Saronic Islands ────────────────────────────────────────────────────────

  'Saronic Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Saronic Islands | ${SITE_NAME}`,
      description:
        'Discover luxury villas in the Saronic Islands — Hydra, Spetses, Aegina, and Poros, each with its own character and all within easy reach of Athens.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Saronic Islands | ${SITE_NAME}`,
      description:
        'Invest in Saronic Islands real estate — a cluster of character-filled islands close to Athens, offering preserved architecture, strong demand, and lifestyle appeal.',
    },
    concierge: {
      title: `Concierge Services in the Saronic Islands | ${SITE_NAME}`,
      description:
        'Premium concierge services across the Saronic Islands — private sailing, yacht charters from Athens, island-hopping itineraries, and bespoke stay management.',
    },
    events: {
      title: `Saronic Islands Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Plan luxurious events across the Saronic Islands — private Hydra mansion dinners, Spetses harbour gatherings, sailing parties, and bespoke island celebrations.',
    },
    experiences: {
      title: `Saronic Islands Experiences | Curated Activities | ${SITE_NAME}`,
      description:
        'Curated experiences across the Saronic Islands — sailing from Athens, island hopping between Hydra and Spetses, private dining, and art gallery visits.',
    },
  },

  Hydra: {
    villas: {
      title: `Luxury Villa Rentals in Hydra, Greece | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Hydra — Greece's most romantic car-free island. Donkeys, bougainvillea, stone mansions, and an artistic soul that has charmed the world for decades.",
    },
    realEstate: {
      title: `Real Estate for Sale in Hydra, Greece | ${SITE_NAME}`,
      description:
        "Own a stone mansion or sea-view villa in Hydra — a protected Saronic gem where no cars are allowed. One of Greece's most exclusive and timeless property markets.",
    },
    concierge: {
      title: `Concierge Services in Hydra, Greece | ${SITE_NAME}`,
      description:
        'Exclusive concierge services on Hydra — water taxi hire, villa staffing, private chefs, art gallery tours, and bespoke arrangements on this car-free island.',
    },
    events: {
      title: `Hydra Events | Exclusive Car-Free Island Events | ${SITE_NAME}`,
      description:
        'Create magical events on Hydra — romantic mansion dinners, private harbour celebrations, and exclusive gatherings on this legendary car-free Saronic island.',
    },
    experiences: {
      title: `Hydra Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        "Unique experiences on Hydra — private water taxi adventures, art gallery tours, donkey rides through stone-paved streets, and exclusive mansion dining events.",
    },
  },

  Spetses: {
    villas: {
      title: `Luxury Villa Rentals in Spetses, Greece | ${SITE_NAME}`,
      description:
        'Discover luxury villas in Spetses — a pine-scented Saronic island with neoclassical mansions, horse-drawn carriages, and a cosmopolitan atmosphere year-round.',
    },
    realEstate: {
      title: `Real Estate for Sale in Spetses, Greece | ${SITE_NAME}`,
      description:
        "Buy a villa or mansion in Spetses — one of the Saronic Gulf's most prestigious islands, renowned for its traditional architecture, pine forests, and lively social scene.",
    },
    concierge: {
      title: `Concierge Services in Spetses, Greece | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Spetses — private boat hire, horse-carriage tours, exclusive dining, villa staffing, and complete island lifestyle management.',
    },
    events: {
      title: `Spetses Events | Luxury Island Events & Parties | ${SITE_NAME}`,
      description:
        'Host stylish events on Spetses — horse-carriage celebrations, private villa garden parties, harbour gatherings, and bespoke Saronic island occasions.',
    },
    experiences: {
      title: `Spetses Experiences | Curated Island Activities | ${SITE_NAME}`,
      description:
        'Curated experiences on Spetses — horse-drawn carriage tours, private boat hire, sailing excursions, local cuisine tasting, and immersive island lifestyle.',
    },
  },

  // ─── Crete ──────────────────────────────────────────────────────────────────

  'Crete Island': {
    villas: {
      title: `Luxury Villa Rentals in Crete, Greece | ${SITE_NAME}`,
      description:
        "Explore luxury villas in Crete — Greece's largest island. Ancient Minoan history, the Samaria Gorge, Elafonisi's pink sands, and world-class Cretan gastronomy.",
    },
    realEstate: {
      title: `Real Estate for Sale in Crete, Greece | ${SITE_NAME}`,
      description:
        'Invest in Crete real estate — a diverse island with options from Chania old-town residences to coastal estates in Elounda, backed by year-round tourism demand.',
    },
    concierge: {
      title: `Concierge Services in Crete, Greece | ${SITE_NAME}`,
      description:
        'Premium concierge services in Crete — private winery tours, archaeological site visits, jeep safaris through gorges, cooking classes, and villa management.',
    },
    events: {
      title: `Crete Events | Luxury Private Events & Weddings | ${SITE_NAME}`,
      description:
        "Host grand events in Crete — Venetian palace celebrations in Chania, luxury beach weddings, private villa dinners, and corporate retreats on Greece's largest island.",
    },
    experiences: {
      title: `Crete Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Rich experiences in Crete — private winery and olive oil tours, Samaria Gorge treks, Minoan site visits, cooking masterclasses, and curated Cretan gastronomy.',
    },
  },

  // ─── Sporades Islands ───────────────────────────────────────────────────────

  'Sporades Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Sporades | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in the Sporades — lush, wooded Aegean islands. Skiathos, Skopelos, and Alonissos offer pristine nature, sandy beaches, and authentic Greek charm.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Sporades | ${SITE_NAME}`,
      description:
        'Buy property in the Sporades — a verdant Aegean island chain with national marine park protection, strong eco-tourism appeal, and a growing luxury property market.',
    },
    concierge: {
      title: `Concierge Services in the Sporades | ${SITE_NAME}`,
      description:
        'Tailored concierge services across the Sporades — sailing between islands, snorkelling in marine park waters, private chefs, and personalised island-hopping logistics.',
    },
    events: {
      title: `Sporades Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Plan unique events in the Sporades — eco-luxury celebrations, private beach gatherings on Skiathos, marine park boat parties, and bespoke island occasions.',
    },
    experiences: {
      title: `Sporades Experiences | Curated Island Activities | ${SITE_NAME}`,
      description:
        'Distinctive experiences in the Sporades — marine park snorkelling, island hopping, beach bar adventures in Skiathos, and authentic Aegean cultural immersions.',
    },
  },

  Skopelos: {
    villas: {
      title: `Luxury Villa Rentals in Skopelos, Greece | ${SITE_NAME}`,
      description:
        "Stay in a luxury villa in Skopelos — the \"Mamma Mia\" island. Greece's most wooded island, with a charming whitewashed chora, monasteries, and secluded pebble bays.",
    },
    realEstate: {
      title: `Real Estate for Sale in Skopelos, Greece | ${SITE_NAME}`,
      description:
        'Buy property in Skopelos — an unspoiled Sporades island with traditional stone homes, forested hillsides, and an authentic character that draws discerning buyers.',
    },
    concierge: {
      title: `Concierge Services in Skopelos, Greece | ${SITE_NAME}`,
      description:
        'Personalised concierge services in Skopelos — private boat hire, monastery tours, olive grove walks, local cuisine experiences, and full villa support.',
    },
    events: {
      title: `Skopelos Events | Mamma Mia Island Events | ${SITE_NAME}`,
      description:
        'Celebrate in Skopelos — chapel weddings on the iconic Mamma Mia island, private village dinners, olive grove gatherings, and bespoke Sporades events.',
    },
    experiences: {
      title: `Skopelos Experiences | Curated Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Skopelos — private hiking through olive and pine forests, monastery tours, local plum liqueur tastings, and authentic Sporades island life.',
    },
  },

  Alonissos: {
    villas: {
      title: `Luxury Villa Rentals in Alonissos, Greece | ${SITE_NAME}`,
      description:
        "Discover luxury villas in Alonissos — within Greece's first National Marine Park. Pristine transparent waters, rare monk seal sightings, and unspoiled Sporades nature.",
    },
    realEstate: {
      title: `Real Estate for Sale in Alonissos, Greece | ${SITE_NAME}`,
      description:
        'Invest in Alonissos real estate — an eco-minded Sporades island with a protected marine environment, traditional Old Village (Chora), and authentic character.',
    },
    concierge: {
      title: `Concierge Services in Alonissos, Greece | ${SITE_NAME}`,
      description:
        'Eco-luxury concierge services in Alonissos — marine park snorkel tours, kayaking excursions, organic food experiences, and discreet island stay management.',
    },
    events: {
      title: `Alonissos Events | Eco-Luxury Events in the Aegean | ${SITE_NAME}`,
      description:
        'Host intimate eco-luxury events on Alonissos — private dining in Old Village, marine park boat celebrations, and authentic gatherings on this serene Sporades island.',
    },
    experiences: {
      title: `Alonissos Experiences | Eco-Luxury Activities | ${SITE_NAME}`,
      description:
        'Eco-luxury experiences in Alonissos — marine park snorkel tours, monk seal spotting, kayaking in crystalline waters, and organic local food experiences.',
    },
  },

  Skiathos: {
    villas: {
      title: `Luxury Villa Rentals in Skiathos, Greece | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Skiathos — the Sporades' liveliest island. Over 60 sandy beaches including the legendary Koukounaries, vibrant nightlife, and lush pine forests.",
    },
    realEstate: {
      title: `Real Estate for Sale in Skiathos, Greece | ${SITE_NAME}`,
      description:
        'Buy property in Skiathos — a cosmopolitan Sporades island with strong rental yields, direct flight connections, and a diverse property market from villas to town apartments.',
    },
    concierge: {
      title: `Concierge Services in Skiathos, Greece | ${SITE_NAME}`,
      description:
        'Premium concierge services in Skiathos — private boat charters, beach club access, VIP nightlife, helicopter transfers, and bespoke island experience curation.',
    },
    events: {
      title: `Skiathos Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Party or celebrate on Skiathos — beach club events, villa parties, VIP nightlife gatherings, sunset sailing soirées, and bespoke occasions on this vibrant island.',
    },
    experiences: {
      title: `Skiathos Experiences | Luxury Activities & VIP Access | ${SITE_NAME}`,
      description:
        'Premium experiences in Skiathos — VIP beach club access, private boat charters to Koukounaries Beach, helicopter transfers, and curated nightlife arrangements.',
    },
  },

  // ─── Spain ──────────────────────────────────────────────────────────────────

  Spain: {
    villas: {
      title: `Luxury Villa Rentals in Spain | ${SITE_NAME}`,
      description:
        'Discover luxury villas across Spain — Ibiza, Mallorca, Formentera, and Marbella. Private pools, sea views, and Balearic sunshine at its most glamorous best.',
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in Spain | ${SITE_NAME}`,
      description:
        'Explore luxury property for sale in Spain — sea-view villas in Ibiza, Mallorca estates, and prestigious Marbella residences. Prime European investment markets.',
    },
    concierge: {
      title: `Concierge Services in Spain | ${SITE_NAME}`,
      description:
        'Premium concierge services across Spain — yacht charters in the Balearics, private chefs, VIP access, chauffeurs, and bespoke experiences on the Iberian Peninsula.',
    },
    events: {
      title: `Events in Spain | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Plan exceptional events in Spain — legendary Ibiza parties, Mallorca villa weddings, exclusive Marbella gatherings, and luxury Balearic celebrations year-round.',
    },
    experiences: {
      title: `Spain Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated luxury experiences across Spain — Ibiza beach club access, Mallorca vineyard tours, Marbella golf, private sailing in the Balearics, and flamenco evenings.',
    },
  },

  'Balearic Islands': {
    villas: {
      title: `Luxury Villa Rentals in the Balearic Islands | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in the Balearic Islands — Ibiza, Mallorca, and Formentera. World-class beaches, vibrant nightlife, and secluded Balearic coves for every taste.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Balearic Islands | ${SITE_NAME}`,
      description:
        'Invest in Balearic Islands real estate — Ibiza, Mallorca, and Formentera offer a diverse range of luxury properties with strong rental yields and lifestyle appeal.',
    },
    concierge: {
      title: `Concierge Services in the Balearic Islands | ${SITE_NAME}`,
      description:
        'Bespoke concierge services across the Balearic Islands — yacht charters, private jets, VIP beach club access, event planning, and island-wide luxury logistics.',
    },
    events: {
      title: `Balearic Islands Events | Private Events | ${SITE_NAME}`,
      description:
        'Host extraordinary events across the Balearic Islands — legendary Ibiza parties, Mallorca villa weddings, Formentera beach gatherings, and exclusive island soirées.',
    },
    experiences: {
      title: `Balearic Islands Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Premium experiences across the Balearic Islands — private sailing between islands, VIP beach club access in Ibiza, Mallorca gastronomy tours, and Formentera beach days.',
    },
  },

  Ibiza: {
    villas: {
      title: `Luxury Villa Rentals in Ibiza, Spain | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Ibiza — the world's premier party destination. Private infinity pools, sea views, and proximity to legendary beach clubs and Balearic sunshine.",
    },
    realEstate: {
      title: `Real Estate for Sale in Ibiza, Spain | ${SITE_NAME}`,
      description:
        "Buy a property in Ibiza — one of Europe's most coveted real estate markets. Sea-view villas, Ibicenco fincas, and prime investment opportunities on the White Isle.",
    },
    concierge: {
      title: `Concierge Services in Ibiza, Spain | ${SITE_NAME}`,
      description:
        'Elite concierge services in Ibiza — VIP beach club access, private yacht charters, villa staffing, helicopter transfers, private chefs, and bespoke island itineraries.',
    },
    events: {
      title: `Ibiza Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Host legendary events in Ibiza — private villa parties, VIP beach club takeovers, sunset boat gatherings, destination weddings, and exclusive Balearic celebrations.',
    },
    experiences: {
      title: `Ibiza Experiences | Luxury Activities & VIP Access | ${SITE_NAME}`,
      description:
        'Curated experiences in Ibiza — VIP beach club access, private sailing, sunset boat parties, yoga retreats in the hills, and guided tours of the Ibiza Old Town.',
    },
  },

  Mallorca: {
    villas: {
      title: `Luxury Villa Rentals in Mallorca, Spain | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Mallorca — the Mediterranean's most diverse island. Dramatic mountain scenery, ancient estates, private pools, and pristine cala beaches.",
    },
    realEstate: {
      title: `Real Estate for Sale in Mallorca, Spain | ${SITE_NAME}`,
      description:
        'Invest in Mallorca real estate — a mature and resilient Balearic property market with options from clifftop sea-view villas to traditional village fincas.',
    },
    concierge: {
      title: `Concierge Services in Mallorca, Spain | ${SITE_NAME}`,
      description:
        'Premium concierge services in Mallorca — private yacht charters, villa staffing, curated wine and gastronomy experiences, transfers, and bespoke island arrangements.',
    },
    events: {
      title: `Mallorca Events | Luxury Private Events & Weddings | ${SITE_NAME}`,
      description:
        'Plan extraordinary events in Mallorca — romantic finca weddings, private beach parties, corporate retreats in the Tramuntana mountains, and exclusive island celebrations.',
    },
    experiences: {
      title: `Mallorca Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Mallorca — private winery tours in Binissalem, sailing along the Tramuntana coast, golf at world-class courses, and bespoke food tours.',
    },
  },

  Formentera: {
    villas: {
      title: `Luxury Villa Rentals in Formentera, Spain | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Formentera — the Balearics' most pristine island. Crystal-clear turquoise lagoons, white sand beaches, and total natural serenity.",
    },
    realEstate: {
      title: `Real Estate for Sale in Formentera, Spain | ${SITE_NAME}`,
      description:
        "Invest in Formentera real estate — Spain's smallest and most protected Balearic island. Limited development, pristine nature, and exclusive appeal for discerning buyers.",
    },
    concierge: {
      title: `Concierge Services in Formentera, Spain | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Formentera — private boat hire, bicycle tours, beachside dining arrangements, island logistics, and curated Formentera lifestyle.',
    },
    events: {
      title: `Formentera Events | Exclusive Island Events | ${SITE_NAME}`,
      description:
        'Host exclusive events in Formentera — private beach dinners in paradise, sunset sailing gatherings, intimate villa soirées, and bespoke Balearic island celebrations.',
    },
    experiences: {
      title: `Formentera Experiences | Luxury Island Activities | ${SITE_NAME}`,
      description:
        'Exclusive experiences in Formentera — private boat trips, snorkelling in crystal-clear waters, bicycle island tours, and sunset beach dining at Es Pujols.',
    },
  },

  Marbella: {
    villas: {
      title: `Luxury Villa Rentals in Marbella, Spain | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Marbella — Spain's glamorous Costa del Sol jewel. Private pools, golf course views, Puerto Banús access, and year-round Mediterranean sunshine.",
    },
    realEstate: {
      title: `Real Estate for Sale in Marbella, Spain | ${SITE_NAME}`,
      description:
        "Invest in Marbella real estate — one of Europe's most prestigious resort destinations. Golden Mile villas, La Zagaleta estates, and Puerto Banús penthouse apartments.",
    },
    concierge: {
      title: `Concierge Services in Marbella, Spain | ${SITE_NAME}`,
      description:
        'Premium concierge services in Marbella — yacht hire from Puerto Banús, golf tee times, VIP restaurant reservations, chauffeurs, and bespoke Costa del Sol lifestyle.',
    },
    events: {
      title: `Marbella Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Host iconic events in Marbella — Puerto Banús yacht parties, Golden Mile villa celebrations, corporate golf days, and luxurious Costa del Sol soirées and weddings.',
    },
    experiences: {
      title: `Marbella Experiences | Luxury Activities & Golf | ${SITE_NAME}`,
      description:
        'Curated experiences in Marbella — rounds at world-class golf courses, yacht day charters from Puerto Banús, private dining, spa retreats, and flamenco evenings.',
    },
  },

  // ─── France ─────────────────────────────────────────────────────────────────

  France: {
    villas: {
      title: `Luxury Villa Rentals in France | ${SITE_NAME}`,
      description:
        'Discover luxury villas across France — from the French Riviera to the Alps. Saint-Tropez, Cannes, Courchevel, and Méribel offer the finest in French lifestyle.',
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in France | ${SITE_NAME}`,
      description:
        'Explore prime real estate in France — Saint-Tropez villas, Cannes apartments, and coveted Alpine chalets in Courchevel and Méribel for the most discerning buyers.',
    },
    concierge: {
      title: `Concierge Services in France | ${SITE_NAME}`,
      description:
        'Bespoke concierge services across France — yacht charters on the Riviera, ski chalets in the Alps, private chefs, Michelin dining reservations, and curated French lifestyle.',
    },
    events: {
      title: `Events in France | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Plan extraordinary events in France — Riviera yacht parties, Cannes Film Festival experiences, Alpine après-ski celebrations, and exclusive French villa soirées.',
    },
    experiences: {
      title: `France Experiences | Luxury Activities & Curated Stays | ${SITE_NAME}`,
      description:
        'Curated luxury experiences across France — Riviera sailing, Cannes festival access, Alpine skiing, Michelin dining, private wine tours, and French cultural immersions.',
    },
  },

  'French Riviera': {
    villas: {
      title: `Luxury Villa Rentals on the French Riviera | ${SITE_NAME}`,
      description:
        'Rent a luxury villa on the French Riviera — the Côte d\'Azur at its finest. Saint-Tropez, Cannes, and Antibes offer glamour, sea views, and Mediterranean living.',
    },
    realEstate: {
      title: `Real Estate for Sale on the French Riviera | ${SITE_NAME}`,
      description:
        "Invest in French Riviera real estate — one of the world's most prestigious property markets. Sea-view villas, Belle Époque apartments, and prestige Côte d'Azur estates.",
    },
    concierge: {
      title: `Concierge Services on the French Riviera | ${SITE_NAME}`,
      description:
        "Premium concierge services on the French Riviera — private yacht charters, helicopter transfers, Cannes Film Festival VIP access, Michelin dining, and bespoke Riviera lifestyle.",
    },
    events: {
      title: `French Riviera Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        "Host world-class events on the French Riviera — yacht parties off Saint-Tropez, Cannes venue hire, seaside villa galas, and luxury Côte d'Azur celebrations year-round.",
    },
    experiences: {
      title: `French Riviera Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        "Curated experiences on the French Riviera — private yacht charters, Cannes Film Festival access, Monaco Grand Prix hospitality, and Côte d'Azur gastronomy tours.",
    },
  },

  'French Alps': {
    villas: {
      title: `Luxury Chalet Rentals in the French Alps | ${SITE_NAME}`,
      description:
        "Rent a luxury chalet in the French Alps — Courchevel, Méribel, Val d'Isère, and Megève. Ski-in/ski-out access, roaring fireplaces, and Alpine grandeur.",
    },
    realEstate: {
      title: `Real Estate for Sale in the French Alps | ${SITE_NAME}`,
      description:
        "Invest in French Alps real estate — coveted ski chalets in Courchevel 1850, Méribel, and Val d'Isère. Strong rental yields and year-round Alpine lifestyle appeal.",
    },
    concierge: {
      title: `Concierge Services in the French Alps | ${SITE_NAME}`,
      description:
        'Elite Alpine concierge services in the French Alps — private ski instructors, heli-skiing, chalet staffing, Michelin dining, and seamless mountain lifestyle management.',
    },
    events: {
      title: `French Alps Events | Luxury Ski Events | ${SITE_NAME}`,
      description:
        'Host memorable events in the French Alps — private chalet celebrations, après-ski soirées, corporate ski retreats, alpine gala dinners, and exclusive mountain parties.',
    },
    experiences: {
      title: `French Alps Experiences | Luxury Ski Activities | ${SITE_NAME}`,
      description:
        'Premium Alpine experiences in the French Alps — private ski guides, heli-skiing, snowmobile tours, spa treatments, fondue evenings, and curated mountain adventures.',
    },
  },

  Cannes: {
    villas: {
      title: `Luxury Villa Rentals in Cannes, France | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in Cannes — home to the world\'s most famous film festival. Boulevard de la Croisette elegance, private pools, and azure Mediterranean views.',
    },
    realEstate: {
      title: `Real Estate for Sale in Cannes, France | ${SITE_NAME}`,
      description:
        'Buy luxury property in Cannes — prestige addresses on the Croisette, hilltop estates with sea views, and Belle Époque villas in one of the Riviera\'s most iconic cities.',
    },
    concierge: {
      title: `Concierge Services in Cannes, France | ${SITE_NAME}`,
      description:
        'Exclusive concierge services in Cannes — Film Festival VIP access, private yacht hire, Croisette dining reservations, helicopter transfers, and bespoke Riviera arrangements.',
    },
    events: {
      title: `Cannes Events | Luxury Private Events & Film Festival | ${SITE_NAME}`,
      description:
        'Host premier events in Cannes — Film Festival launch parties, private Croisette galas, yacht receptions, corporate dinners, and exclusive Riviera celebrations.',
    },
    experiences: {
      title: `Cannes Experiences | Luxury Activities & VIP Access | ${SITE_NAME}`,
      description:
        'Curated experiences in Cannes — Film Festival VIP access, private yacht charters, helicopter day trips to Monaco, Croisette walking tours, and Riviera gastronomy.',
    },
  },

  'Saint-Tropez': {
    villas: {
      title: `Luxury Villa Rentals in Saint-Tropez, France | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Saint-Tropez — the Côte d'Azur's most glamorous haven. Pampelonne Beach access, La Ponche old town charm, and ultra-luxury Riviera living.",
    },
    realEstate: {
      title: `Real Estate for Sale in Saint-Tropez, France | ${SITE_NAME}`,
      description:
        "Buy a villa in Saint-Tropez — one of the world's most sought-after addresses. Sea-view estates, prestigious Ramatuelle hillside properties, and Pampelonne residences.",
    },
    concierge: {
      title: `Concierge Services in Saint-Tropez, France | ${SITE_NAME}`,
      description:
        'Elite concierge services in Saint-Tropez — superyacht charters, VIP beach access, private jets, Michelin dining, nightclub reservations, and bespoke Riviera service.',
    },
    events: {
      title: `Saint-Tropez Events | Luxury Private Events & Parties | ${SITE_NAME}`,
      description:
        'Host iconic events in Saint-Tropez — Pampelonne Beach parties, superyacht soirées, villa galas, poolside receptions, and legendary Riviera celebrations year-round.',
    },
    experiences: {
      title: `Saint-Tropez Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Saint-Tropez — superyacht day charters, VIP Pampelonne Beach access, helicopter rides, Old Town guided tours, and Riviera wine tastings.',
    },
  },

  Courchevel: {
    villas: {
      title: `Luxury Chalet Rentals in Courchevel, France | ${SITE_NAME}`,
      description:
        "Rent a luxury chalet in Courchevel — the world's most prestigious ski resort. Ski-in/ski-out chalets, Michelin restaurants, and legendary après-ski on the 3 Vallées.",
    },
    realEstate: {
      title: `Real Estate for Sale in Courchevel, France | ${SITE_NAME}`,
      description:
        "Invest in Courchevel real estate — ski-in/ski-out chalets in the world's most glamorous Alpine resort. Courchevel 1850 properties command premium values and strong demand.",
    },
    concierge: {
      title: `Concierge Services in Courchevel, France | ${SITE_NAME}`,
      description:
        'World-class concierge services in Courchevel — private ski instructors, heli-skiing, restaurant reservations, Michelin dining, chalet staffing, and Alpine logistics.',
    },
    events: {
      title: `Courchevel Events | Luxury Ski Events & Parties | ${SITE_NAME}`,
      description:
        'Host extraordinary events in Courchevel — private chalet soirées, corporate ski retreats, après-ski celebrations, gala Alpine dinners, and bespoke mountain gatherings.',
    },
    experiences: {
      title: `Courchevel Experiences | Luxury Ski Activities | ${SITE_NAME}`,
      description:
        'Premium experiences in Courchevel — private ski instruction on the 3 Vallées, heli-skiing, snowmobile tours, spa treatments, and Michelin dining in the snow.',
    },
  },

  Meribel: {
    villas: {
      title: `Luxury Chalet Rentals in Méribel, France | ${SITE_NAME}`,
      description:
        'Rent a luxury chalet in Méribel — heart of the legendary 3 Vallées ski domain. Traditional Savoyard architecture, ski-in/ski-out access, and pure Alpine refinement.',
    },
    realEstate: {
      title: `Real Estate for Sale in Méribel, France | ${SITE_NAME}`,
      description:
        "Buy a chalet in Méribel — nestled in the world's largest ski area, the 3 Vallées. Traditional Savoyard chalets with ski-in/ski-out access and strong investment appeal.",
    },
    concierge: {
      title: `Concierge Services in Méribel, France | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Méribel — private ski instructors, snowmobile day trips, chalet staffing, restaurant reservations, and full Alpine lifestyle management.',
    },
    events: {
      title: `Méribel Events | Luxury Ski Events & Celebrations | ${SITE_NAME}`,
      description:
        'Celebrate in Méribel — intimate chalet gatherings, après-ski parties, corporate ski events, fondue soirées, and exclusive celebrations at the heart of the 3 Vallées.',
    },
    experiences: {
      title: `Méribel Experiences | Luxury Alpine Activities | ${SITE_NAME}`,
      description:
        'Curated Alpine experiences in Méribel — private ski guiding across the 3 Vallées, snowshoeing, ice skating, spa retreats, and authentic Savoyard culinary evenings.',
    },
  },

  // ─── Switzerland ────────────────────────────────────────────────────────────

  Switzerland: {
    villas: {
      title: `Luxury Chalet Rentals in Switzerland | ${SITE_NAME}`,
      description:
        'Rent a luxury chalet in Switzerland — Verbier and Zermatt. World-class skiing, panoramic Alpine views, and impeccably appointed chalets in the Alps\' finest resorts.',
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in Switzerland | ${SITE_NAME}`,
      description:
        'Explore luxury Swiss real estate — prestigious chalets in Verbier and Zermatt, with outstanding Alpine views, strong rental demand, and enduring investment value.',
    },
    concierge: {
      title: `Concierge Services in Switzerland | ${SITE_NAME}`,
      description:
        'Premium Swiss concierge services — private ski instructors, heli-skiing, luxury chalet staffing, fondue arrangements, and seamless Alpine lifestyle management.',
    },
    events: {
      title: `Events in Switzerland | Luxury Alpine Events | ${SITE_NAME}`,
      description:
        'Host prestigious events in Switzerland — private chalet gatherings in Verbier, corporate ski retreats in Zermatt, Alpine gala dinners, and exclusive mountain celebrations.',
    },
    experiences: {
      title: `Switzerland Experiences | Luxury Alpine Activities | ${SITE_NAME}`,
      description:
        'Curated Swiss experiences — skiing in Verbier, heli-skiing around the Matterhorn, private ice rink sessions, fondue evenings, and luxury train journeys through the Alps.',
    },
  },

  'Swiss Alps': {
    villas: {
      title: `Luxury Chalet Rentals in the Swiss Alps | ${SITE_NAME}`,
      description:
        'Rent a luxury chalet in the Swiss Alps — Verbier and Zermatt for world-class skiing, stunning Alpine panoramas, and the finest Swiss mountain hospitality.',
    },
    realEstate: {
      title: `Real Estate for Sale in the Swiss Alps | ${SITE_NAME}`,
      description:
        'Invest in Swiss Alps real estate — coveted Verbier chalets and Zermatt properties with Matterhorn views. A stable and prestigious Alpine property market.',
    },
    concierge: {
      title: `Concierge Services in the Swiss Alps | ${SITE_NAME}`,
      description:
        'Elite Alpine concierge in the Swiss Alps — private ski instructors, heli-skiing, chalet staffing, Swiss experiences, and full mountain lifestyle management.',
    },
    events: {
      title: `Swiss Alps Events | Luxury Ski Events | ${SITE_NAME}`,
      description:
        'Plan exclusive events in the Swiss Alps — private chalet soirées, corporate ski retreats, heli-dinner experiences, and Alpine galas in Verbier or Zermatt.',
    },
    experiences: {
      title: `Swiss Alps Experiences | Luxury Alpine Activities | ${SITE_NAME}`,
      description:
        'Premium experiences in the Swiss Alps — heli-skiing near the Matterhorn, private glacier excursions, luxury mountain dining, and curated Alpine adventure programs.',
    },
  },

  Verbier: {
    villas: {
      title: `Luxury Chalet Rentals in Verbier, Switzerland | ${SITE_NAME}`,
      description:
        'Rent a luxury chalet in Verbier — Switzerland\'s wildest and most international ski resort. Off-piste freeride, vibrant après-ski, and stunning Mont-Blanc views.',
    },
    realEstate: {
      title: `Real Estate for Sale in Verbier, Switzerland | ${SITE_NAME}`,
      description:
        'Own a chalet in Verbier — one of Switzerland\'s most prestigious and cosmopolitan ski resorts. Strong freeride heritage, international appeal, and solid investment value.',
    },
    concierge: {
      title: `Concierge Services in Verbier, Switzerland | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Verbier — private ski guides, heli-skiing, après-ski VIP access, chalet staffing, and seamless freeride lifestyle management.',
    },
    events: {
      title: `Verbier Events | Luxury Ski Events & Parties | ${SITE_NAME}`,
      description:
        'Host legendary events in Verbier — private freeride parties, corporate ski retreats, après-ski chalet soirées, and exclusive Alpine celebrations in Switzerland.',
    },
    experiences: {
      title: `Verbier Experiences | Luxury Alpine Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Verbier — off-piste heli-skiing, private freeride guiding, Verbier Fest music events, luxury après-ski, and Swiss mountain adventure tours.',
    },
  },

  Zermatt: {
    villas: {
      title: `Luxury Chalet Rentals in Zermatt, Switzerland | ${SITE_NAME}`,
      description:
        'Rent a luxury chalet in Zermatt — the iconic car-free Alpine village beneath the Matterhorn. Year-round skiing, pristine mountain air, and quintessential Swiss charm.',
    },
    realEstate: {
      title: `Real Estate for Sale in Zermatt, Switzerland | ${SITE_NAME}`,
      description:
        'Buy property in Zermatt — ski-to-door chalets with Matterhorn views in Switzerland\'s most iconic car-free mountain village. Rare supply and enduring prestige value.',
    },
    concierge: {
      title: `Concierge Services in Zermatt, Switzerland | ${SITE_NAME}`,
      description:
        'Premium concierge services in Zermatt — private ski guides, glacier heli-excursions, Matterhorn view dining, chalet staffing, and seamless car-free village logistics.',
    },
    events: {
      title: `Zermatt Events | Luxury Alpine Events | ${SITE_NAME}`,
      description:
        'Host spectacular events in Zermatt — Matterhorn backdrop celebrations, private alpine dinners, corporate ski retreats, and exclusive gatherings in this iconic Swiss village.',
    },
    experiences: {
      title: `Zermatt Experiences | Luxury Alpine Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Zermatt — heli-skiing on the Klein Matterhorn glacier, private summit excursions, panoramic cable car rides, and Swiss mountain dining.',
    },
  },

  // ─── Caribbean ──────────────────────────────────────────────────────────────

  Caribbean: {
    villas: {
      title: `Luxury Villa Rentals in the Caribbean | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in the Caribbean — St Barts and Tulum. Turquoise waters, pristine beaches, lush tropical scenery, and world-class Caribbean style and hospitality.',
    },
    realEstate: {
      title: `Luxury Real Estate for Sale in the Caribbean | ${SITE_NAME}`,
      description:
        'Explore luxury Caribbean real estate — St Barts and Tulum. Exclusive island properties with strong lifestyle appeal, rental demand, and prestigious tropical addresses.',
    },
    concierge: {
      title: `Concierge Services in the Caribbean | ${SITE_NAME}`,
      description:
        'Bespoke Caribbean concierge services — private yacht charters, snorkelling excursions, villa staffing, beachside dining, and curated tropical luxury lifestyle.',
    },
    events: {
      title: `Caribbean Events | Luxury Events & Celebrations | ${SITE_NAME}`,
      description:
        'Host incredible events in the Caribbean — St Barts beach parties, Tulum jungle celebrations, yacht gatherings, private villa soirées, and bespoke tropical occasions.',
    },
    experiences: {
      title: `Caribbean Experiences | Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated Caribbean experiences — private sailing between islands, snorkelling and diving, beach club access in St Barts, Tulum cenote tours, and tropical yacht charters.',
    },
  },

  'St Barts': {
    villas: {
      title: `Luxury Villa Rentals in St Barts, Caribbean | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in St Barts — the Caribbean's most exclusive island. Pristine Saline and Gouverneur beaches, superyacht harbour, and French-Creole sophistication.",
    },
    realEstate: {
      title: `Real Estate for Sale in St Barts, Caribbean | ${SITE_NAME}`,
      description:
        "Own a villa in St Barts — the Caribbean's most prestigious address. Limited supply, strong rental demand, and an ultra-luxury market attracting the world's elite.",
    },
    concierge: {
      title: `Concierge Services in St Barts, Caribbean | ${SITE_NAME}`,
      description:
        'Elite concierge services in St Barts — superyacht charters, private jet arrivals, VIP beach club access at Nikki Beach, villa staffing, and bespoke island lifestyle.',
    },
    events: {
      title: `St Barts Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Host iconic events in St Barts — New Year\'s superyacht parties, private villa soirées, beach gatherings at Nikki Beach, and exclusive Caribbean celebrations year-round.',
    },
    experiences: {
      title: `St Barts Experiences | Luxury Activities & VIP Access | ${SITE_NAME}`,
      description:
        'Exclusive experiences in St Barts — private superyacht day charters, Nikki Beach VIP access, helicopter island tours, gourmet French dining, and secluded beach days.',
    },
  },

  Tulum: {
    villas: {
      title: `Luxury Villa Rentals in Tulum, Mexico | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in Tulum — where ancient Mayan ruins meet boho-chic beach living. Cenote swimming, jungle yoga, organic gastronomy, and eco-luxury on the Riviera Maya.',
    },
    realEstate: {
      title: `Real Estate for Sale in Tulum, Mexico | ${SITE_NAME}`,
      description:
        "Invest in Tulum real estate — a rapidly growing luxury market on Mexico's Riviera Maya. Eco-design villas, jungle retreats, and beachfront residences with strong rental appeal.",
    },
    concierge: {
      title: `Concierge Services in Tulum, Mexico | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Tulum — cenote diving, private jungle yoga, curated cenote tours, beach club access, villa staffing, and eco-luxury lifestyle management.',
    },
    events: {
      title: `Tulum Events | Luxury Private Events & Celebrations | ${SITE_NAME}`,
      description:
        'Host unforgettable events in Tulum — jungle beach parties, cenote celebrations, eco-luxury villa soirées, and boho-chic occasions on Mexico\'s Riviera Maya.',
    },
    experiences: {
      title: `Tulum Experiences | Curated Luxury Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Tulum — private cenote tours, Mayan ruins guided visits, jungle yoga, beach club access, snorkelling in crystal-clear waters, and organic dining.',
    },
  },

  // ─── Costa Rica ─────────────────────────────────────────────────────────────

  'Costa Rica': {
    villas: {
      title: `Luxury Villa Rentals in Costa Rica | ${SITE_NAME}`,
      description:
        'Rent a luxury villa in Costa Rica — pristine beaches, lush rainforests, and exceptional natural beauty in Santa Teresa. Surf, yoga, and eco-luxury at its finest.',
    },
    realEstate: {
      title: `Real Estate for Sale in Costa Rica | ${SITE_NAME}`,
      description:
        'Invest in Costa Rica real estate — a growing luxury market with eco-design villas in Santa Teresa. Stunning Pacific coastline and strong rental potential.',
    },
    concierge: {
      title: `Concierge Services in Costa Rica | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Costa Rica — private surf lessons, eco-tours, zip-lining, yoga retreats, organic dining, and curated nature experiences in Santa Teresa.',
    },
    events: {
      title: `Costa Rica Events | Luxury Private Events | ${SITE_NAME}`,
      description:
        'Host extraordinary events in Costa Rica — jungle beach parties, eco-luxury villa gatherings, surf camp events, and bespoke natural celebrations in Santa Teresa.',
    },
    experiences: {
      title: `Costa Rica Experiences | Luxury Eco-Activities | ${SITE_NAME}`,
      description:
        'Curated eco-luxury experiences in Costa Rica — private surf lessons in Santa Teresa, wildlife tours, waterfall treks, yoga classes, and beachside organic dining.',
    },
  },

  'Santa Teressa': {
    villas: {
      title: `Luxury Villa Rentals in Santa Teresa, Costa Rica | ${SITE_NAME}`,
      description:
        "Rent a luxury villa in Santa Teresa — Costa Rica's surf and yoga capital. Wild Pacific beaches, tropical jungle, fresh seafood, and pure eco-luxury on the Nicoya Peninsula.",
    },
    realEstate: {
      title: `Real Estate for Sale in Santa Teresa, Costa Rica | ${SITE_NAME}`,
      description:
        "Buy property in Santa Teresa — one of Costa Rica's most sought-after beach destinations. Eco-design villas, jungle retreats, and surf-side homes on the Nicoya Peninsula.",
    },
    concierge: {
      title: `Concierge Services in Santa Teresa, Costa Rica | ${SITE_NAME}`,
      description:
        'Bespoke concierge services in Santa Teresa — surf lessons, yoga retreats, wildlife tours, ATV rentals, local dining arrangements, and full Nicoya Peninsula logistics.',
    },
    events: {
      title: `Santa Teresa Events | Luxury Beach Events | ${SITE_NAME}`,
      description:
        'Host magical events in Santa Teresa — beachside yoga retreats, private surf camp gatherings, jungle celebrations, and eco-luxury soirées on Costa Rica\'s Pacific coast.',
    },
    experiences: {
      title: `Santa Teresa Experiences | Luxury Eco-Activities | ${SITE_NAME}`,
      description:
        'Curated experiences in Santa Teresa — private surf sessions, wildlife watching, waterfall hikes, organic beach dining, and sunrise yoga sessions on the Nicoya Peninsula.',
    },
  },
}

// ─── Public helpers ──────────────────────────────────────────────────────────

function primaryLocation(raw: string): string {
  return (raw || '').split(',')[0]?.trim() ?? ''
}

function lookup(raw: string): LocationServiceMeta | undefined {
  const key = primaryLocation(raw)
  if (!key) return undefined
  return META[key]
}

export function getVillaLocationMeta(location: string): LocationPageMeta {
  return (
    lookup(location)?.villas ?? {
      title: `Search Luxury Villas for Rent | ${SITE_NAME}`,
      description:
        'Filter curated villa and chalet rentals by destination, dates, guests, and amenities.',
    }
  )
}

export function getRealEstateLocationMeta(location: string): LocationPageMeta {
  return (
    lookup(location)?.realEstate ?? {
      title: `Luxury Homes for Sale — Listings | ${SITE_NAME}`,
      description:
        'Search prime real estate for sale by location, budget, bedrooms, and property highlights.',
    }
  )
}

export function getConciergeLocationMeta(location: string): LocationPageMeta {
  return (
    lookup(location)?.concierge ?? {
      title: `Concierge Services Directory | ${SITE_NAME}`,
      description:
        'Browse global concierge services — transport, lifestyle, experiences, and on-demand support by destination.',
    }
  )
}

export function getEventsLocationMeta(location: string): LocationPageMeta {
  return (
    lookup(location)?.events ?? {
      title: `Luxury Events & Private Celebrations | ${SITE_NAME}`,
      description:
        'Discover bespoke event planning services — private parties, destination weddings, corporate retreats, and luxury celebrations worldwide.',
    }
  )
}

export function getExperiencesLocationMeta(location: string): LocationPageMeta {
  return (
    lookup(location)?.experiences ?? {
      title: `Luxury Experiences & Curated Activities | ${SITE_NAME}`,
      description:
        'Explore curated luxury experiences by destination — from yacht charters and private tours to exclusive dining and adventure activities.',
    }
  )
}
