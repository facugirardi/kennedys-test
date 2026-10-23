import { mapServiceToDetail } from "@/lib/mappers/concierge";

/** Subconjunto serializable para `/pdf/[id]` (sin `raw` ni `primaryRecord`). */
export type ConciergePdfService = {
  id: string;
  name: string;
  type: string;
  heroImage: string;
  gallery: string[];
  description: string;
  secondaryDescription: string;
  location: string | null;
  area: string | null;
  highlightedSections: Array<{ title: string; image: string; description: string; imagePosition?: string | null }>;
  keyFeatures: string[];
  specifications?: Record<string, unknown>;
  features?: string[] | Record<string, unknown>;
  mainImagePosition?: string;
};

export function mapServiceForPdf(service: unknown): ConciergePdfService {
  const d = mapServiceToDetail(service as any);
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    heroImage: d.heroImage,
    gallery: Array.isArray(d.gallery) ? d.gallery : [],
    description: d.description,
    secondaryDescription: d.secondaryDescription,
    location: d.location,
    area: d.area,
    highlightedSections: Array.isArray(d.highlightedSections) ? d.highlightedSections : [],
    keyFeatures: Array.isArray(d.keyFeatures) ? d.keyFeatures : [],
    specifications:
      d.specifications && typeof d.specifications === "object" && !Array.isArray(d.specifications)
        ? (d.specifications as Record<string, unknown>)
        : {},
    features: d.features,
    mainImagePosition: d.mainImagePosition,
  };
}
