import type { GetServerSideProps } from "next";
import { getSiteUrl } from "@/lib/seo/config";

export default function RobotsTxt() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const base = getSiteUrl();
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /login",
    "Disallow: /my-profile",
    "Disallow: /pdf/",
    "",
    base ? `Sitemap: ${base}/sitemap.xml` : "",
  ].filter(Boolean);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=604800"
  );
  res.write(lines.join("\n"));
  res.end();
  return { props: {} };
};
