/**
 * Página dedicada para generar el PDF de una propiedad o servicio concierge.
 * URL: /pdf/[id]?branded=1 (con Kennedy's) o ?branded=0 (unbranded)
 */
import { GetServerSideProps } from "next";
import { getProperty } from "@/lib/api/properties";
import { getService } from "@/lib/api/services";
import type { Property } from "@/interfaces/property";
import { mapServiceForPdf, type ConciergePdfService } from "@/lib/pdf/mapConciergeForPdf";
import PdfExportSession from "@/components/pdf/PdfExportSession";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_NAME } from "@/lib/seo/config";

function unwrapApiRecord(res: any): Record<string, unknown> | null {
  if (!res || typeof res !== "object" || Array.isArray(res)) return null;
  if (res.success === false) return null;
  const data = res.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (typeof res.id === "string" && res.id.length > 0) {
    return res as Record<string, unknown>;
  }
  return null;
}

type PdfPageProps = {
  pdfKind: "property" | "concierge";
  initialProperty: Property | null;
  initialService: ConciergePdfService | null;
  branded: boolean;
  needsBrandedChoice: boolean;
  offerDateRange: string | null;
  offerPrice: string | null;
  offerNights: string | null;
  offerGuests: string | null;
};

export default function PdfPropertyPage({
  pdfKind,
  initialProperty,
  initialService,
  branded,
  needsBrandedChoice,
  offerDateRange,
  offerPrice,
  offerNights,
  offerGuests,
}: PdfPageProps) {
  if (pdfKind === "concierge" && initialService) {
    return (
      <>
        <SeoHead
          title={initialService.name ? `${initialService.name} — PDF | ${SITE_NAME}` : `Concierge PDF | ${SITE_NAME}`}
          description=""
          canonicalPath={`/pdf/${initialService.id}`}
          noindex
        />
        <PdfExportSession
          pdfKind="concierge"
          initialProperty={null}
          initialService={initialService}
          serverBranded={branded}
          serverNeedsBrandedChoice={needsBrandedChoice}
          offerDateRange={offerDateRange}
          offerPrice={offerPrice}
          offerNights={offerNights}
          offerGuests={offerGuests}
        />
      </>
    );
  }

  if (!initialProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-haas text-[#506A70]">Property not found</p>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={initialProperty.title ? `${initialProperty.title} — PDF | ${SITE_NAME}` : `Property PDF | ${SITE_NAME}`}
        description=""
        canonicalPath={`/pdf/${initialProperty.id}`}
        noindex
      />
      <PdfExportSession
        pdfKind="property"
        initialProperty={initialProperty}
        initialService={null}
        serverBranded={branded}
        serverNeedsBrandedChoice={needsBrandedChoice}
        offerDateRange={offerDateRange}
        offerPrice={offerPrice}
        offerNights={offerNights}
        offerGuests={offerGuests}
      />
    </>
  );
}

/** Fechas tipo "Feb, Sat 1 – Feb, Sat 8" para el resumen del PDF. */
const formatDateRange = (start?: string | null, end?: string | null): string | undefined => {
  if (!start || !end) return undefined;
  try {
    const parseUTC = (str: string) => {
      const [y, m, d] = str.split(/[-T]/);
      return new Date(Date.UTC(+y, +m - 1, +d));
    };
    const s = parseUTC(start);
    const e = parseUTC(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return undefined;
    const part = (d: Date) => {
      const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
      const wd = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      return `${month}, ${wd} ${d.getUTCDate()}`;
    };
    const startStr = part(s);
    const endStr = part(e);
    return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
  } catch {
    return undefined;
  }
};

export const getServerSideProps: GetServerSideProps<PdfPageProps> = async (context) => {
  const id = context.params?.id;
  const brandedRaw = context.query.branded;
  const brandedParam = Array.isArray(brandedRaw) ? brandedRaw[0] : brandedRaw;
  const needsBrandedChoice = brandedParam === undefined;
  const branded =
    !needsBrandedChoice && brandedParam !== "0" && brandedParam !== "false";
  const startDate = (context.query.startDate as string) || undefined;
  const endDate = (context.query.endDate as string) || undefined;
  const priceRaw = context.query.price;
  const priceParam = Array.isArray(priceRaw) ? priceRaw[0] : priceRaw;
  const offerPrice =
    typeof priceParam === "string" && priceParam.trim() !== "" ? priceParam : null;
  const offerDateRange = formatDateRange(startDate, endDate) ?? null;
  const nightsRaw = context.query.nights;
  const nightsParam = Array.isArray(nightsRaw) ? nightsRaw[0] : nightsRaw;
  const offerNights =
    typeof nightsParam === "string" && nightsParam.trim() !== "" ? nightsParam.trim() : null;
  const guestsRaw = context.query.guests;
  const guestsParam = Array.isArray(guestsRaw) ? guestsRaw[0] : guestsRaw;
  const offerGuests =
    typeof guestsParam === "string" && guestsParam.trim() !== "" ? guestsParam.trim() : null;

  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  try {
    const propertyRecord = unwrapApiRecord(await getProperty(id));
    if (propertyRecord) {
      return {
        props: {
          pdfKind: "property" as const,
          initialProperty: propertyRecord as Property,
          initialService: null,
          branded: needsBrandedChoice ? true : branded,
          needsBrandedChoice,
          offerDateRange,
          offerPrice,
          offerNights,
          offerGuests,
        },
      };
    }

    const serviceRecord = unwrapApiRecord(await getService(id, { forWebsite: true }));
    if (serviceRecord) {
      const initialService = mapServiceForPdf(serviceRecord);
      return {
        props: {
          pdfKind: "concierge" as const,
          initialProperty: null,
          initialService,
          branded: needsBrandedChoice ? true : branded,
          needsBrandedChoice,
          offerDateRange,
          offerPrice,
          offerNights,
          offerGuests,
        },
      };
    }

    return { notFound: true };
  } catch (err) {
    console.error("getServerSideProps pdf/[id]:", err);
    return { notFound: true };
  }
};
