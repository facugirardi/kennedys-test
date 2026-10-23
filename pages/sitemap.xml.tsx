import type { GetServerSideProps } from "next";
import { buildSitemapXml } from "@/lib/seo/sitemapBuilder";

export default function SitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const xml = await buildSitemapXml();
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();
  return { props: {} };
};
