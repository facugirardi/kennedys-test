import { resolveMediaUrl } from '@/lib/utils';

/** Debe coincidir con `pageKey` de cada fila en `pages` (Loggia / CMS). */
export const PAGE_HERO_KEYS = {
  // Existing page hero banners
  conciergeList: 'concierge-list',
  eventsIndex: 'events-index',
  villasIndex: 'villas-index',
  realEstateIndex: 'real-estate-index',
  conciergeLocationMykonos: 'concierge-location-mykonos',
  conciergeLocationIbiza: 'concierge-location-ibiza',
  conciergeLocationParos: 'concierge-location-paros',
  conciergeLocationSaintTropez: 'concierge-location-saint-tropez',
  conciergeLocationBodrum: 'concierge-location-bodrum',
  conciergeLocationSaintBarth: 'concierge-location-saint-barth',
  conciergeLocationCourchevel: 'concierge-location-courchevel',
  conciergeLocationTulum: 'concierge-location-tulum',
  conciergeLocationCostaRica: 'concierge-location-costa-rica',
  conciergeLocationAthensRiviera: 'concierge-location-athens-riviera',
  conciergeLocationGreekIslands: 'concierge-location-greek-islands',
  // Homepage images
  homeHero: 'home-hero',
  homeServiceRealEstate: 'home-service-real-estate',
  homeServiceVacationRentals: 'home-service-vacation-rentals',
  homeServiceGlobalConcierge: 'home-service-global-concierge',
  homeServiceTravelDesign: 'home-service-travel-design',
  homeServiceEventProduction: 'home-service-event-production',
  homeServiceVillaManagement: 'home-service-villa-management',
  homeDestinationMykonos: 'home-destination-mykonos',
  homeDestinationIbiza: 'home-destination-ibiza',
  homeDestinationParos: 'home-destination-paros',
  homeDestinationSaintTropez: 'home-destination-saint-tropez',
  homeRealEstateIntro: 'home-real-estate-intro',
  homeRealEstateBanner: 'home-real-estate-banner',
  homeLuxuryVillaImage: 'home-luxury-villa-image',
  homeConciergeItineraries: 'home-concierge-itineraries',
  homeConciergeJet: 'home-concierge-jet',
  homeConciergeYacht: 'home-concierge-yacht',
  homeConciergeHelicopter: 'home-concierge-helicopter',
  // Real Estate page top searches
  realEstateTopMykonos: 'real-estate-top-mykonos',
  realEstateTopAthensRiviera: 'real-estate-top-athens-riviera',
  realEstateTopParos: 'real-estate-top-paros',
  // Real Estate – Unlocking Doors To Your Dreams (4 images)
  realEstateUnlocking1: 'real-estate-unlocking-1',
  realEstateUnlocking2: 'real-estate-unlocking-2',
  realEstateUnlocking3: 'real-estate-unlocking-3',
  realEstateUnlocking4: 'real-estate-unlocking-4',
  // Real Estate – Premium Portfolio + Top Networking
  realEstatePremiumPortfolio: 'real-estate-premium-portfolio',
  realEstateTopNetworking: 'real-estate-top-networking',
  // Concierge – Featured Services (5 images)
  conciergeFeaturedYachts: 'concierge-featured-yachts',
  conciergeFeaturedItineraries: 'concierge-featured-itineraries',
  conciergeFeaturedJets: 'concierge-featured-jets',
  conciergeFeaturedHelicopters: 'concierge-featured-helicopters',
  conciergeFeaturedChauffeurs: 'concierge-featured-chauffeurs',
  // Concierge – Luxury Packages collage (3 images)
  conciergePackages1: 'concierge-packages-1',
  conciergePackages2: 'concierge-packages-2',
  conciergePackages3: 'concierge-packages-3',
  // Concierge – People's Favorites (4 images)
  conciergeFavoritesItineraries: 'concierge-favorites-itineraries',
  conciergeFavoritesJet: 'concierge-favorites-jet',
  conciergeFavoritesYacht: 'concierge-favorites-yacht',
  conciergeFavoritesHelicopter: 'concierge-favorites-helicopter',
  // Contact page
  contactUsHero: 'contact-us-hero',
  // We Manage Your Property page
  weManageYourPropertyHero: 'we-manage-your-property-hero',
  weManagePropertyUnmatchedExpertise: 'we-manage-property-unmatched-expertise',
  weManagePropertyGridItem1: 'we-manage-property-grid-item-1',
  weManagePropertyGridItem2: 'we-manage-property-grid-item-2',
  weManagePropertyGridItem3: 'we-manage-property-grid-item-3',
  weManagePropertyGridItem4: 'we-manage-property-grid-item-4',
  weManagePropertyLegalOperational: 'we-manage-property-legal-operational',
  weManagePropertyOperationalSupport: 'we-manage-property-operational-support',
  weManagePropertyGallery1: 'we-manage-property-gallery-1',
  weManagePropertyGallery2: 'we-manage-property-gallery-2',
  weManagePropertyGallery3: 'we-manage-property-gallery-3',
  weManagePropertyGallery4: 'we-manage-property-gallery-4',
  weManagePropertyTailoredServices: 'we-manage-property-tailored-services',
  weManagePropertyRestRoom: 'we-manage-property-rest-room',
  weManagePropertyExceptionalServices1: 'we-manage-property-exceptional-services-1',
  weManagePropertyExceptionalServices2: 'we-manage-property-exceptional-services-2',
  // About Us page
  aboutUsHero: 'about-us-hero',
  aboutUsBeginnings1: 'about-us-beginnings-1',
  aboutUsBeginnings2: 'about-us-beginnings-2',
  aboutUsBeginnings3: 'about-us-beginnings-3',
  aboutUsBeginnings4: 'about-us-beginnings-4',
  aboutUsCategoryVillas: 'about-us-category-villas',
  aboutUsCategoryRealEstate: 'about-us-category-real-estate',
  aboutUsCategoryConcierge: 'about-us-category-concierge',
  aboutUsCategoryEvents: 'about-us-category-events',
  aboutUsSellWithUs: 'about-us-sell-with-us',
} as const;

const DEFAULTS: Record<string, string> = {
  // Existing defaults
  [PAGE_HERO_KEYS.conciergeList]: '/images/sell-with-us-header-image.webp',
  [PAGE_HERO_KEYS.eventsIndex]: '/images/events-bg.webp',
  [PAGE_HERO_KEYS.villasIndex]: '/images/villas/pool-image.webp',
  [PAGE_HERO_KEYS.realEstateIndex]: '/images/real-state-header.webp',
  [PAGE_HERO_KEYS.conciergeLocationMykonos]: '/images/Mykonos-image.jpg',
  [PAGE_HERO_KEYS.conciergeLocationIbiza]: '/images/homeibiza.jpg',
  [PAGE_HERO_KEYS.conciergeLocationParos]: '/images/paros-image.png',
  [PAGE_HERO_KEYS.conciergeLocationSaintTropez]: '/images/saint-tropez-image.png',
  [PAGE_HERO_KEYS.conciergeLocationBodrum]: '/images/bodrum-image.png',
  [PAGE_HERO_KEYS.conciergeLocationSaintBarth]: '/images/saint-barth-image.png',
  [PAGE_HERO_KEYS.conciergeLocationCourchevel]: '/images/courchevel-image.png',
  [PAGE_HERO_KEYS.conciergeLocationTulum]: '/images/tulum-image2.png',
  [PAGE_HERO_KEYS.conciergeLocationCostaRica]: '/images/COSTA RICA-image.png',
  [PAGE_HERO_KEYS.conciergeLocationAthensRiviera]: '/images/Mykonos-image.jpg',
  [PAGE_HERO_KEYS.conciergeLocationGreekIslands]: '/images/greek-island-image.png',
  // Homepage defaults
  [PAGE_HERO_KEYS.homeHero]: '/images/home/home-image.webp',
  [PAGE_HERO_KEYS.homeServiceRealEstate]: '/images/home/real-state-image.webp',
  [PAGE_HERO_KEYS.homeServiceVacationRentals]: '/images/home/vacation-rentals-image.webp',
  [PAGE_HERO_KEYS.homeServiceGlobalConcierge]: '/images/home/global-concierge.webp',
  [PAGE_HERO_KEYS.homeServiceTravelDesign]: '/images/home/travel-design.webp',
  [PAGE_HERO_KEYS.homeServiceEventProduction]: '/images/home/event-production.webp',
  [PAGE_HERO_KEYS.homeServiceVillaManagement]: '/images/home/villa-management.webp',
  [PAGE_HERO_KEYS.homeDestinationMykonos]: '/images/top-destinations/mykonos.jpg',
  [PAGE_HERO_KEYS.homeDestinationIbiza]: '/images/top-destinations/homeibiza.jpg',
  [PAGE_HERO_KEYS.homeDestinationParos]: '/images/paros-image.png',
  [PAGE_HERO_KEYS.homeDestinationSaintTropez]: '/images/saint-tropez-image.png',
  [PAGE_HERO_KEYS.homeRealEstateBanner]: '/images/luxurystate.png',
  [PAGE_HERO_KEYS.homeLuxuryVillaImage]: '/images/luxury-villa.png',
  [PAGE_HERO_KEYS.homeConciergeItineraries]: '/images/itineraries.png',
  [PAGE_HERO_KEYS.homeConciergeJet]: '/images/plane-sea.png',
  [PAGE_HERO_KEYS.homeConciergeYacht]: '/images/yatch.png',
  [PAGE_HERO_KEYS.homeConciergeHelicopter]: '/images/helicopter-image.png',
  // Real Estate top searches defaults
  [PAGE_HERO_KEYS.realEstateTopMykonos]: '/images/mykonos-card-image.png',
  [PAGE_HERO_KEYS.realEstateTopAthensRiviera]: '/images/greek-island-image.png',
  [PAGE_HERO_KEYS.realEstateTopParos]: '/images/paros-image.png',
  // Real Estate – Unlocking Doors
  [PAGE_HERO_KEYS.realEstateUnlocking1]: '/images/image-unlockdoor.jpg',
  [PAGE_HERO_KEYS.realEstateUnlocking2]: '/images/image-unlockdoor-1.jpg',
  [PAGE_HERO_KEYS.realEstateUnlocking3]: '/images/image-unlockdoor-2.jpg',
  [PAGE_HERO_KEYS.realEstateUnlocking4]: '/images/image-unlockdoor-3.jpg',
  // Real Estate – Premium Portfolio + Top Networking
  [PAGE_HERO_KEYS.realEstatePremiumPortfolio]: '/images/tree-image.png',
  [PAGE_HERO_KEYS.realEstateTopNetworking]: '/images/pool-image.png',
  // Concierge – Featured Services
  [PAGE_HERO_KEYS.conciergeFeaturedYachts]: '/images/yacht-image.jpg',
  [PAGE_HERO_KEYS.conciergeFeaturedItineraries]: '/images/itineraries.png',
  [PAGE_HERO_KEYS.conciergeFeaturedJets]: '/images/plane-image.png',
  [PAGE_HERO_KEYS.conciergeFeaturedHelicopters]: '/images/helicopter-image.png',
  [PAGE_HERO_KEYS.conciergeFeaturedChauffeurs]: '/images/chauffeur-service.png',
  // Concierge – Packages collage
  [PAGE_HERO_KEYS.conciergePackages1]: '/images/mykonos-card-image.png',
  [PAGE_HERO_KEYS.conciergePackages2]: '/images/concierge-1.png',
  [PAGE_HERO_KEYS.conciergePackages3]: '/images/boat-image.png',
  // Concierge – People's Favorites
  [PAGE_HERO_KEYS.conciergeFavoritesItineraries]: '/images/itineraries.png',
  [PAGE_HERO_KEYS.conciergeFavoritesJet]: '/images/plane-sea.png',
  [PAGE_HERO_KEYS.conciergeFavoritesYacht]: '/images/yatch.png',
  [PAGE_HERO_KEYS.conciergeFavoritesHelicopter]: '/images/helicopter-image.png',
  // Contact page
  [PAGE_HERO_KEYS.contactUsHero]: '/images/contact-us-image.png',
  // We Manage Your Property page
  [PAGE_HERO_KEYS.weManageYourPropertyHero]: '/images/we-manage-your-villa-image.png',
  [PAGE_HERO_KEYS.weManagePropertyUnmatchedExpertise]: '/images/family-image.png',
  [PAGE_HERO_KEYS.weManagePropertyGridItem1]: '/images/woman-light-blue-mint.jpg',
  [PAGE_HERO_KEYS.weManagePropertyGridItem2]: '/images/boats-image.jpg',
  [PAGE_HERO_KEYS.weManagePropertyGridItem3]: '/images/dessert.png',
  [PAGE_HERO_KEYS.weManagePropertyGridItem4]: '/images/linving-room-image.jpg',
  [PAGE_HERO_KEYS.weManagePropertyLegalOperational]: '/images/garden-image.png',
  [PAGE_HERO_KEYS.weManagePropertyOperationalSupport]: '/images/cheff-image.png',
  [PAGE_HERO_KEYS.weManagePropertyGallery1]: '/images/romantic-couple-image.jpg',
  [PAGE_HERO_KEYS.weManagePropertyGallery2]: '/images/adults-in-yacht.jpg',
  [PAGE_HERO_KEYS.weManagePropertyGallery3]: '/images/business-aircraft.jpg',
  [PAGE_HERO_KEYS.weManagePropertyGallery4]: '/images/dessert.png',
  [PAGE_HERO_KEYS.weManagePropertyTailoredServices]: '/images/we-manage-pool-image.png',
  [PAGE_HERO_KEYS.weManagePropertyRestRoom]: '/images/rest-room-image.png',
  [PAGE_HERO_KEYS.weManagePropertyExceptionalServices1]: '/images/event-manage-chairs-image.png',
  [PAGE_HERO_KEYS.weManagePropertyExceptionalServices2]: '/images/plane-image.png',
  // About Us page
  [PAGE_HERO_KEYS.aboutUsHero]: '/images/Mykonos-image.jpg',
  [PAGE_HERO_KEYS.aboutUsBeginnings1]: '/images/photo-1-about.png',
  [PAGE_HERO_KEYS.aboutUsBeginnings2]: '/images/photo-2-about.png',
  [PAGE_HERO_KEYS.aboutUsBeginnings3]: '/images/photo-3-about.png',
  [PAGE_HERO_KEYS.aboutUsBeginnings4]: '/images/Mykonos-image.jpg',
  [PAGE_HERO_KEYS.aboutUsCategoryVillas]: '/images/pool-with-nice-view-image.png',
  [PAGE_HERO_KEYS.aboutUsCategoryRealEstate]: '/images/real-state-header.jpg',
  [PAGE_HERO_KEYS.aboutUsCategoryConcierge]: '/images/chuffer-service-image.png',
  [PAGE_HERO_KEYS.aboutUsCategoryEvents]: '/images/event-production.png',
  [PAGE_HERO_KEYS.aboutUsSellWithUs]: '/images/sell-with-us-header-image.png',
};

/**
 * `heroBannerPath` viene del API (uploads/...). Si no hay, usa el asset estático de la web.
 */
export function resolvePageHeroImage(
  pageKey: string,
  heroBannerPath: string | null | undefined
): string {
  const fromApi = resolveMediaUrl(heroBannerPath || '');
  if (fromApi) return fromApi;
  return DEFAULTS[pageKey] || '';
}

/**
 * Returns the CSS object-position value for a hero image, defaulting to "50% 50%".
 */
export function resolvePageHeroPosition(
  heroBannerPosition: string | null | undefined
): string {
  if (typeof heroBannerPosition === 'string' && heroBannerPosition.trim()) {
    return heroBannerPosition.trim();
  }
  return '50% 50%';
}
