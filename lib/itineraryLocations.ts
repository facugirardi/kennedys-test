/** Convierte el texto libre de una region/location de propiedad en un slug estable para usar como page key. */
export function slugifyLocation(value?: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function itineraryLocationPageKey(slug: string, slot: 1 | 2 | 3): string {
  return `itinerary-location-${slug}-${slot}`;
}

/** Mismas 3 imágenes que se usaban como default (hardcodeadas) en la sección original. */
export const ITINERARY_DEFAULT_IMAGES = [
  "/images/boat-image.png",
  "/images/concierge-1.png",
  "/images/mykonos-card-image.png",
];
