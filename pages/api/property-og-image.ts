import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import sharp from "sharp";
import { resolveMediaUrl } from "@/lib/utils";

type PropertyApiResponse = {
  success?: boolean;
  data?: Record<string, any> | null;
};

function pickPrimaryPropertyImage(data: Record<string, any> | null | undefined): string {
  if (!data) return "";
  const images = Array.isArray(data.images) ? data.images : [];
  const primary = images.find((img: any) => {
    const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary;
    return isPrimary === true || isPrimary === "true" || isPrimary === 1;
  });
  const fallback = images[0];
  const raw =
    primary?.urlImage ||
    primary?.url ||
    fallback?.urlImage ||
    fallback?.url ||
    data.mainImage ||
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

async function fetchProperty(apiBase: string, identifier: string): Promise<Record<string, any> | null> {
  try {
    const byId = await axios.get<PropertyApiResponse>(
      `${apiBase}/property/${encodeURIComponent(identifier)}/`,
      { timeout: 30000 }
    );
    if (byId?.data?.data) return byId.data.data;
  } catch {
    // fallback to slug endpoint
  }

  try {
    const bySlug = await axios.get<PropertyApiResponse>(
      `${apiBase}/property/slug/${encodeURIComponent(identifier)}/`,
      { timeout: 30000 }
    );
    if (bySlug?.data?.data) return bySlug.data.data;
  } catch {
    // ignore
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const identifier = typeof req.query.identifier === "string" ? req.query.identifier.trim() : "";
  if (!identifier) {
    res.status(400).json({ success: false, message: "Missing identifier" });
    return;
  }

  const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (!apiBase) {
    res.status(500).json({ success: false, message: "Missing NEXT_PUBLIC_API_URL" });
    return;
  }

  try {
    const propertyData = await fetchProperty(apiBase, identifier);
    if (!propertyData) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    const rawImage = pickPrimaryPropertyImage(propertyData);
    const sourceUrl = resolveMediaUrl(rawImage);

    if (!sourceUrl || sourceUrl.startsWith("data:")) {
      res.status(404).json({ success: false, message: "Property image not found" });
      return;
    }

    const imageResponse = await axios.get<ArrayBuffer>(sourceUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const output = await sharp(Buffer.from(imageResponse.data))
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "centre", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600");
    res.status(200).send(output);
  } catch (error) {
    console.error("property-og-image error", error);
    res.status(500).json({ success: false, message: "Failed to generate OG image" });
  }
}

