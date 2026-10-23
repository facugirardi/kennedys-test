import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import sharp from "sharp";
import { resolveMediaUrl } from "@/lib/utils";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const LOGO_MAX_WIDTH = 260;
const LOGO_MARGIN = 40;

type ShareApiResponse = {
  success?: boolean;
  data?: Record<string, unknown> | null;
};

function pickMainOfferImage(data: Record<string, unknown> | null | undefined): string {
  const imageUrl = typeof data?.imageUrl === "string" ? data.imageUrl.trim() : "";
  if (imageUrl && !imageUrl.startsWith("data:")) return imageUrl;

  const groups = Array.isArray(data?.propertiesToPresent) ? (data?.propertiesToPresent as any[]) : [];
  const items = groups.flatMap((g) => (Array.isArray(g?.properties) ? g.properties : []));
  const first = items[0];
  const fallback =
    first?.mainImage ||
    first?.imageUrl ||
    first?.images?.[0]?.urlImage ||
    first?.images?.[0]?.url ||
    "";
  return typeof fallback === "string" ? fallback.trim() : "";
}

function isUnbrandedOgRequest(query: NextApiRequest["query"]): boolean {
  const unbranded = query?.unbranded;
  return unbranded === "1" || unbranded === "true";
}

async function buildLogoOverlay(offer: Record<string, unknown> | null | undefined): Promise<Buffer | null> {
  const o = offer as Record<string, unknown> | undefined;
  const fromApiRaw = typeof o?.logoUrl === "string" ? o.logoUrl : typeof o?.logo_url === "string" ? o.logo_url : "";
  const fromApi = fromApiRaw.trim();
  if (fromApi && !fromApi.startsWith("data:")) {
    const url = resolveMediaUrl(fromApi);
    if (url) {
      try {
        const r = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 15000 });
        return sharp(Buffer.from(r.data))
          .rotate()
          .resize({ width: LOGO_MAX_WIDTH, withoutEnlargement: true })
          .png()
          .toBuffer();
      } catch {
        // fall through to local favicon
      }
    }
  }
  const local = path.join(process.cwd(), "public", "images", "kenlogo.png");
  try {
    const b = await fs.readFile(local);
    return sharp(b)
      .resize({ width: LOGO_MAX_WIDTH, withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";
  if (!slug) {
    res.status(400).json({ success: false, message: "Missing slug" });
    return;
  }

  const apiBase = String(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (!apiBase) {
    res.status(500).json({ success: false, message: "Missing NEXT_PUBLIC_API_URL" });
    return;
  }

  try {
    const offerResponse = await axios.get<ShareApiResponse>(`${apiBase}/shared-property/${encodeURIComponent(slug)}`, {
      timeout: 30000,
    });
    const data = offerResponse.data?.data || null;
    const rawImage = pickMainOfferImage(data);
    const sourceUrl = resolveMediaUrl(rawImage);

    if (!sourceUrl || sourceUrl.startsWith("data:")) {
      res.status(404).json({ success: false, message: "Offer image not found" });
      return;
    }

    const imageResponse = await axios.get<ArrayBuffer>(sourceUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const base = await sharp(Buffer.from(imageResponse.data))
      .rotate()
      .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "centre", withoutEnlargement: true })
      .toBuffer();

    const skipLogoOverlay = isUnbrandedOgRequest(req.query);
    const logoBuf = skipLogoOverlay ? null : await buildLogoOverlay(data);
    let output: Buffer;
    if (logoBuf) {
      const { width: lw = 0, height: lh = 0 } = await sharp(logoBuf).metadata();
      if (lw > 0 && lh > 0) {
        const left = Math.max(0, OG_WIDTH - lw - LOGO_MARGIN);
        const top = Math.max(0, OG_HEIGHT - lh - LOGO_MARGIN);
        output = await sharp(base)
          .composite([{ input: logoBuf, left, top }])
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer();
      } else {
        output = await sharp(base).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      }
    } else {
      output = await sharp(base).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=900, stale-while-revalidate=3600");
    res.status(200).send(output);
  } catch (error) {
    console.error("share-og-image error", error);
    res.status(500).json({ success: false, message: "Failed to generate OG image" });
  }
}
