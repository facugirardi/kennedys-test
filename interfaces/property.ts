export interface Pool {
  id: string;
  poolType?: Array<string>;
  cant: number;
  type: string;
  classificationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Classification {
  id?: string;
  theme?: string | null;
  type?: string | null;
  classification?: string | null;
  propertyId?: string;
  idealPersons?: number;
  maxPersons?: number;
  bedrooms?: number;
  serviceBedrooms?: number;
  baths?: number;
  wc?: number;
  outdoorShower?: number;
  indoorArea?: number;
  outdoorArea?: number;
  contructionYear?: number;
  renovationYear?: number;
  permisionLegality?: string;
  website?: string;
  email?: string;
  locationCategory?: string;
  status?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  managementName?: string;
  managementEmail?: string;
  managementPhone?: string;
  vendorPropertyName?: string;
  license?: string;
  thirdPartyPermission?: string;
  isFriendly?: Array<string>;
  gym?: number;
  staffRoom?: number;
  laundryRoom?: string;
  jacuzzi?: number;
  jacuzziType?: string;
  indoorFacilities?: Array<string>;
  outdoorFacilities?: Array<string>;
  includedServices?: Array<string>;
  extraServices?: string;
  addedValues?: string;
  commission?: string;
  sku?: string;
  diningSeats?: number;
  loungeSeats?: number;
  pools?: Pool[];
  objectType?: string;
  condition?: string;
  totalSurface?: number;
  livingArea?: number;
  flooring?: string;
  visibleLocation?: string;
  layoutAndLivingSpaces?: {
    kitchens?: { count?: number | string | null; description?: string | null };
    livingRooms?: { count?: number | string | null; description?: string | null };
    guestWC?: { count?: number | string | null; description?: string | null };
    staffQuarters?: { count?: number | string | null; description?: string | null };
    garden?: { available?: boolean | null; description?: string | null };
    storage?: { available?: boolean | null; description?: string | null };
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Property {
  id: string;
  title?: string; // Nombre de la propiedad
  propertyName?: string;
  startDate?: string;
  endDate?: string;
  dates?: string;
  night?: number;
  nights?: number;
  grossRate?: number;
  markup?: number;
  discountShare?: number;
  calculationCommission?: number;
  totalCommission?: number;
  managementFee?: number;
  officialPrice?: number;
  images?: { urlImage: string; section?: string; position?: string | null }[];
  watermarkPhotos?: boolean;
  availabilityRanges?: AvailabilityRange[];
  icalendarURL?: string | null;
  classification?: Classification;
  description?: Description;
  rental?: boolean;
  propertyCode?: string;
  [key: string]: any;
}

export interface AvailabilityRange {
  id: string;
  from: string | Date;
  to: string | Date;
  price_per_night?: number;
  is_available?: boolean;
  min_stay?: number;
  markup?: number;
  commission?: number;
  discount?: number;
  management_fee?: number;
  disabled_dates?: string[] | Date[];
}

export interface Description {
  id?: string;
  caption?: string;
  propertyId?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  detiledDescription?: string | null;
  outdoorTitle?: string | null;
  outdoorDescription?: string | null;
  outdoorImage?: string | null;
  ourNote?: string | null;
  areaAndDistancesInfo?: string | null;
  ownerStory?: string | null;
  benefits?: string | null;
  whyPurchased?: string | null;
  accomodationDetails?: string | null;
  whiteLabelDescription?: string | null;
  aboutDescription?: string | null;
  theVilla?: {
    groups?: {
      id?: string;
      title?: string;
      items?: string[];
    }[];
  };
  updatedAt?: Date;
  createdAt?: Date;
}
