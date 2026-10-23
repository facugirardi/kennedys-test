/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/custom/Navbar";
import Footer from "@/components/custom/footerNew";
import { getAboutContent } from "@/lib/api/content";
import { getLatestNews } from "@/lib/api/news";
import { WeAreOnTheNews } from "@/components/promotional-blocks";
import { getPageBlocksData } from "@/lib/utils/contentBlocks";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_NAME } from "@/lib/seo/config";
import { TEAM_MEMBERS, slugifyName } from "@/lib/data/team";
import { resolveMediaUrl } from "@/lib/utils";
import { fetchPageByKeyServer } from "@/lib/api/pages";
import { PAGE_HERO_KEYS, resolvePageHeroImage } from "@/lib/pageHeroBanner";
import Link from "next/link";

const ABOUT_US_IMAGE_KEYS = [
  PAGE_HERO_KEYS.aboutUsHero,
  PAGE_HERO_KEYS.aboutUsBeginnings1,
  PAGE_HERO_KEYS.aboutUsBeginnings2,
  PAGE_HERO_KEYS.aboutUsBeginnings3,
  PAGE_HERO_KEYS.aboutUsBeginnings4,
  PAGE_HERO_KEYS.aboutUsCategoryVillas,
  PAGE_HERO_KEYS.aboutUsCategoryRealEstate,
  PAGE_HERO_KEYS.aboutUsCategoryConcierge,
  PAGE_HERO_KEYS.aboutUsCategoryEvents,
  PAGE_HERO_KEYS.aboutUsSellWithUs,
] as const;

function resolveTeamAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return "";
  return avatarUrl.startsWith("/images/") || avatarUrl.startsWith("http")
    ? avatarUrl
    : resolveMediaUrl(avatarUrl) || avatarUrl;
}

function getDataArray(res: unknown): any[] {
  if (!res || typeof res !== "object") return [];
  const r = res as { data?: unknown };
  if (Array.isArray(r.data)) return r.data;
  if (Array.isArray(res)) return res as any[];
  return [];
}

function mapNewsFromApiResponse(raw: any[]): any[] {
  return raw
    .filter((n) => n?.title && n?.image)
    .map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      image: n.image,
      link: n.link,
    }));
}

const FALLBACK_TEAM = TEAM_MEMBERS;

const CATEGORIES = [
  {
    label: "Luxury Villas",
    sublabel: "Rental",
    description: "Hand-picked estates across Mykonos, Ibiza, Saint-Tropez and beyond — each one vetted for privacy, views and impeccable service.",
    image: "/images/pool-with-nice-view-image.png",
    overrideKey: PAGE_HERO_KEYS.aboutUsCategoryVillas,
    href: "/villas",
    accent: "#D99330",
  },
  {
    label: "Concierge",
    sublabel: "Services",
    description: "From private yacht charters to Michelin-starred private chefs — every wish anticipated, every detail flawlessly executed.",
    image: "/images/chuffer-service-image.png",
    overrideKey: PAGE_HERO_KEYS.aboutUsCategoryConcierge,
    href: "/concierge",
    accent: "#48A4B4",
  },
  {
    label: "Events",
    sublabel: "Management",
    description: "Bespoke celebrations, corporate retreats and milestone gatherings designed with the precision of a luxury atelier.",
    image: "/images/event-production.png",
    overrideKey: PAGE_HERO_KEYS.aboutUsCategoryEvents,
    href: "/events",
    accent: "#D99330",
  },
  {
    label: "Real Estate",
    sublabel: "Acquisition",
    description: "Curated investment-grade properties in the world's most coveted Mediterranean addresses, offered with white-glove advisory.",
    image: "/images/real-state-header.jpg",
    overrideKey: PAGE_HERO_KEYS.aboutUsCategoryRealEstate,
    href: "/real-estate",
    accent: "#48A4B4",
  },
];

type AboutPageProps = {
  initialAboutData?: any;
  initialPageBlocks?: any[];
  initialLatestNews?: any[];
  imageOverrides?: Record<string, string>;
  heroTitle?: string | null;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const AboutPage: React.FC<AboutPageProps> = ({
  initialAboutData = null,
  initialPageBlocks = [],
  initialLatestNews = [],
  imageOverrides = {},
  heroTitle,
  initialSeoMeta,
}) => {
  const [aboutData, setAboutData] = useState<any>(initialAboutData);
  const [latestNews, setLatestNews] = useState<any[]>(() =>
    mapNewsFromApiResponse(initialLatestNews)
  );

  useEffect(() => {
    if (initialAboutData != null || initialPageBlocks?.length) return;
    const load = async () => {
      try {
        const [aboutRes] = await Promise.all([
          getAboutContent(),
          getPageBlocksData("about-us"),
        ]);
        if (aboutRes?.data) setAboutData(aboutRes.data);
      } catch {}
    };
    load();
  }, [initialAboutData, initialPageBlocks]);

  useEffect(() => {
    if (initialLatestNews.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getLatestNews(3);
        const data = mapNewsFromApiResponse(getDataArray(res));
        if (!cancelled) setLatestNews(data);
      } catch {
        if (!cancelled) setLatestNews([]);
      }
    })();
    return () => { cancelled = true; };
  }, [initialLatestNews.length]);

  const beginnings = aboutData?.beginnings;
  const columns = aboutData?.columns || [];
  const team = aboutData?.team || [];

  const images = useMemo(() => {
    if (beginnings?.extra?.images && Array.isArray(beginnings.extra.images) && beginnings.extra.images.length) {
      return beginnings.extra.images.filter(Boolean);
    }
    return [
      imageOverrides[PAGE_HERO_KEYS.aboutUsBeginnings1] || "/images/photo-1-about.png",
      imageOverrides[PAGE_HERO_KEYS.aboutUsBeginnings2] || "/images/photo-2-about.png",
      imageOverrides[PAGE_HERO_KEYS.aboutUsBeginnings3] || "/images/photo-3-about.png",
      imageOverrides[PAGE_HERO_KEYS.aboutUsBeginnings4] || "/images/Mykonos-image.jpg",
    ];
  }, [beginnings, imageOverrides]);

  const heroImageSrc = imageOverrides[PAGE_HERO_KEYS.aboutUsHero] || "/images/Mykonos-image.jpg";
  const sellWithUsImageSrc = imageOverrides[PAGE_HERO_KEYS.aboutUsSellWithUs] || "/images/sell-with-us-header-image.png";

  const activeTeam = team.length ? team : FALLBACK_TEAM;

  return (
    <>
      <SeoHead
        title={initialSeoMeta?.title || `About Us | Kennedy's Group — Luxury Hospitality in Mykonos & Beyond`}
        description={initialSeoMeta?.description || "Meet the team behind Kennedy's Group. Over 20 years crafting bespoke luxury villa rentals, real estate, concierge services and unforgettable events across the Mediterranean."}
        canonicalPath="/about-us"
        imageUrl={initialSeoMeta?.imageUrl || heroImageSrc}
      />

      <main className="w-full bg-white overflow-x-hidden">
        {/* ─── HERO ───────────────────────────────────────────── */}
        <section className="relative w-full h-screen min-h-[560px] max-h-[860px]">
          <img
            src={heroImageSrc}
            alt="Kennedy's Group"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient: dark left panel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#172338]/55 via-[#172338]/20 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent" />

          <Navbar textBlack={false} className="absolute left-0 top-0 z-30 w-full" />

          {/* Hero copy */}
          <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 pt-20">
            <div className="max-w-[600px]">
              {/* Eyebrow */}
              <p className="font-haas text-[11px] uppercase tracking-[0.3em] text-[#D99330] mb-5">
                Kennedy's Group · Est. Mykonos
              </p>
              <h1 className="font-gtsuper-ds font-light text-white text-[48px] md:text-[72px] leading-[0.95] mb-6">
                {heroTitle ? (
                  <span className="whitespace-pre-line">{heroTitle}</span>
                ) : (
                  <>
                    A life<br />
                    <em className="not-italic text-[#D99330]">beautifully</em><br />
                    designed
                  </>
                )}
              </h1>
              {/* Gold rule */}
              <div className="w-16 h-[1.5px] bg-[#D99330] mb-6" />
              <p className="font-haas font-light text-white/80 text-[15px] md:text-[17px] leading-[1.7] max-w-[420px]">
                {beginnings?.subtitle || "We absorb your dreams, desires and passions — and mould them into your perfect holiday experience."}
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
            <div className="w-[1px] h-12 bg-white animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </section>

        {/* ─── THE BEGINNINGS ─────────────────────────────────── */}
        <section className="relative w-full bg-white pt-20 pb-0">
          {/* Intro row */}
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20 items-start mb-16">
            {/* Left: label + title */}
            <div className="md:sticky md:top-28 pt-2">
              <p className="font-haas text-[10px] uppercase tracking-[0.3em] text-[#48A4B4] mb-4">
                Our Story
              </p>
              <h2 className="font-gtsuper-ds font-light text-[#172338] text-[32px] md:text-[44px] leading-[1.1]">
                {beginnings?.title || "The Beginnings"}
              </h2>
              <div className="mt-5 w-10 h-[1.5px] bg-[#D99330]" />
            </div>

            {/* Right: body text */}
            <div className="space-y-5">
              <p className="font-haas font-light text-[#172338] text-[16px] md:text-[18px] leading-[1.75]">
                {beginnings?.subtitle || 'During our careers in hospitality, the concept of "the perfect holiday" often made us wonder: Is there truly a "perfect holiday" for everyone? We realized that, much like life, holiday experiences are deeply personal. However, unlike life, holidays can be meticulously planned.'}
              </p>
              {beginnings?.body && (
                <p className="font-haas font-light text-[#506A70] text-[15px] leading-[1.75]">
                  {beginnings.body}
                </p>
              )}
            </div>
          </div>

          {/* Image collage — full bleed editorial */}
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {images[0] && (
                <div className="col-span-2 row-span-2 relative overflow-hidden group">
                  <img src={images[0]} alt="" className="w-full h-[240px] md:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              {images[1] && (
                <div className="relative overflow-hidden group">
                  <img src={images[1]} alt="" className="w-full h-[116px] md:h-[204px] object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              {images[2] && (
                <div className="relative overflow-hidden group">
                  <img src={images[2]} alt="" className="w-full h-[116px] md:h-[204px] object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
              {images[3] && (
                <div className="relative overflow-hidden group col-span-2">
                  <img src={images[3]} alt="" className="w-full h-[116px] md:h-[204px] object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                </div>
              )}
            </div>
          </div>

          {/* Three columns body */}
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-[#E8EBF0] pt-10">
              {(columns.length ? columns : null)?.map((item: any, i: number) => (
                <div key={item.id} className="relative">
                  <span className="font-haas text-[10px] uppercase tracking-[0.25em] text-[#D99330] block mb-3">0{i + 1}</span>
                  <p className="font-haas font-light text-[14px] leading-[1.85] text-[#506A70]">{item.body}</p>
                </div>
              ))}
              {!columns.length && (
                <>
                  {[
                    'We are here to absorb your dreams, desires, likings, passions, thoughts and preferences and mould them into your perfect holiday experience. From A to Z, 24 hours a day, 7 days a week, 52 weeks a year, we are here to make your holiday dreams come to life.',
                    "Our expertly curated, high-end, luxury villa portfolio does not come alone — we add the magic of life to it by accompanying our jaw-dropping homes-away-from-home with bespoke concierge services and all the amenities of 7* ultra-exclusive resorts.",
                    "For us, with over 20 years of experience in the demanding hospitality business and after having worked for the best of the best around the globe, there is no greater blessing than being able to become part of one's happiness.",
                  ].map((text, i) => (
                    <div key={i} className="relative">
                      <span className="font-haas text-[10px] uppercase tracking-[0.25em] text-[#D99330] block mb-3">0{i + 1}</span>
                      <p className="font-haas font-light text-[14px] leading-[1.85] text-[#506A70]">{text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Social sidebar — fixed to the right of this section */}
          <div className="absolute top-20 hidden lg:flex flex-col items-center gap-6" style={{ right: '36px' }}>
            <a href="https://www.facebook.com/kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/kennedys-group" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@kennedysgroup" target="_blank" rel="noopener noreferrer" className="text-[#506A70] hover:text-[#D99330] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
            </a>
            <div className="w-[1px] h-16 bg-[#506A70]/40" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#48A4B4">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </section>

        {/* ─── OUR CATEGORIES ─────────────────────────────────── */}
        <section className="w-full bg-[#F5F5F3] py-20 md:py-28">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12">
            {/* Section header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="font-haas text-[10px] uppercase tracking-[0.3em] text-[#48A4B4] mb-4">
                  What We Do
                </p>
                <h2 className="font-gtsuper-ds font-light text-[#172338] text-[32px] md:text-[52px] leading-[1.05]">
                  Our Categories
                </h2>
              </div>
              <p className="font-haas font-light text-[#506A70] text-[14px] max-w-[360px] md:text-right leading-[1.7]">
                Four pillars of ultra-luxury living, each crafted to exceed the expectations of the most discerning clients.
              </p>
            </div>

            {/* Categories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <Link href={cat.href} key={cat.label} className="group relative overflow-hidden block">
                  {/* Image */}
                  <div className="relative h-[340px] md:h-[480px] overflow-hidden">
                    <img
                      src={imageOverrides[cat.overrideKey] || cat.image}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#172338] via-[#172338]/30 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <p className="font-haas text-[10px] uppercase tracking-[0.25em] mb-2 transition-colors duration-300"
                        style={{ color: cat.accent }}>
                        {cat.sublabel}
                      </p>
                      <h3 className="font-gtsuper-ds font-light text-white text-[26px] leading-[1.1] mb-3">
                        {cat.label}
                      </h3>
                      <p className="font-haas font-light text-white/60 text-[13px] leading-[1.65] mb-4 max-h-0 overflow-hidden transition-all duration-500 group-hover:max-h-24">
                        {cat.description}
                      </p>
                      {/* Arrow */}
                      <div className="flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <span className="font-haas text-[12px] uppercase tracking-[0.2em] text-white">Explore</span>
                        <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                          <path d="M0 4H14M14 4L11 1M14 4L11 7" stroke="white" strokeWidth="1.2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MEET OUR TEAM ──────────────────────────────────── */}
        <section className="w-full bg-white">
          {/* Divider banner */}
          <div className="w-full bg-[#172338] py-16 md:py-20 flex flex-col items-center text-center px-6">
            <p className="font-haas text-[10px] uppercase tracking-[0.3em] text-[#48A4B4] mb-4">The people behind the magic</p>
            <h2 className="font-gtsuper-ds font-light text-white text-[30px] md:text-[52px] leading-[1.05] max-w-[700px]">
              WELCOME TO THE KENNEDY'S GROUP LIFESTYLE
            </h2>
            <h2 className="font-gtsuper-ds font-light text-[#D99330] text-[30px] md:text-[52px] leading-[1.05] mt-1 max-w-[800px]">
              MEET OUR TEAM
            </h2>
          </div>

          <TeamCarousel team={activeTeam} />
        </section>

        {/* ─── SELL WITH US ───────────────────────────────────── */}
        <section className="w-full relative overflow-hidden">
          {/* Background image */}
          <img
            src={sellWithUsImageSrc}
            alt="Sell with Kennedy's"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#172338]/30" />

          <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12 py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left */}
            <div>
              <p className="font-haas text-[10px] uppercase tracking-[0.3em] text-[#D99330] mb-5">
                Property Owners
              </p>
              <h2 className="font-gtsuper-ds font-light text-white text-[36px] md:text-[56px] leading-[1.05] mb-6">
                Sell or Rent<br />
                <em className="not-italic text-[#D99330]">With Us</em>
              </h2>
              <div className="w-12 h-[1.5px] bg-[#D99330] mb-7" />
              <p className="font-haas font-light text-white text-[15px] md:text-[17px] leading-[1.75] max-w-[440px]">
                At Kennedy's Group, we specialize in transforming luxury properties into high-value assets. Benefit from our global network, premium marketing, and dedicated advisors.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Exclusive access to high-net-worth buyers worldwide",
                  "Bespoke photography, video tours & targeted campaigns",
                  "Concierge-level support from onboarding through guest management",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-[6px] shrink-0 w-[5px] h-[5px] rounded-full bg-[#D99330]" />
                    <span className="font-haas font-light text-white text-[14px] leading-[1.6]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA card */}
            <div className="bg-white border border-white/10 p-8 md:p-10">
              <h3 className="font-gtsuper-ds font-light text-[#172338] text-[22px] md:text-[28px] mb-3">
                Ready to maximize your property's potential?
              </h3>
              <p className="font-haas font-light text-[#506A70] text-[14px] leading-[1.7] mb-8">
                Our team will prepare a tailored valuation, marketing plan, and onboarding roadmap — personally and with no obligation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "20+", sub: "Years experience" },
                  { label: "100+", sub: "Luxury properties" },
                  { label: "24/7", sub: "Concierge support" },
                  { label: "5★", sub: "Guest satisfaction" },
                ].map((stat) => (
                  <div key={stat.label} className="border border-[#172338]/50 p-4">
                    <span className="font-gtsuper-ds font-light text-[#D99330] text-[28px] block leading-none mb-1">
                      {stat.label === "5★" ? <>5<span className="text-[20px] ml-[10px]">★</span></> : stat.label}
                    </span>
                    <span className="font-haas text-[11px] uppercase tracking-[0.15em] text-[#506A70]">{stat.sub}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/sell-with-us"
                className="mt-8 flex items-center justify-center gap-3 w-full bg-[#28F7EA] hover:bg-[#1fe8dc] transition-colors duration-300 py-4 text-[#172338] font-haas text-[13px] uppercase tracking-[0.2em]"
              >
                Contact Our Team
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                  <path d="M0 4H14M14 4L11 1M14 4L11 7" stroke="#172338" strokeWidth="1.2" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── IN THE NEWS ────────────────────────────────────── */}
        {latestNews.length > 0 && (
          <WeAreOnTheNews news={latestNews} fallbackNews={[]} />
        )}

        <Footer />
      </main>


      <style jsx global>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.5); transform-origin: top; }
          50% { opacity: 0.8; transform: scaleY(1); transform-origin: top; }
        }
      `}</style>
    </>
  );
};

export async function getServerSideProps() {
  try {
    const [aboutRes, blocks, newsRes, seoRow, ...imagePages] = await Promise.all([
      getAboutContent(),
      getPageBlocksData("about-us"),
      getLatestNews(3),
      fetchPageByKeyServer("about-us").catch(() => null),
      ...ABOUT_US_IMAGE_KEYS.map((key) => fetchPageByKeyServer(key).catch(() => null)),
    ]);
    const initialLatestNews = mapNewsFromApiResponse(getDataArray(newsRes));

    const imageOverrides: Record<string, string> = {};
    ABOUT_US_IMAGE_KEYS.forEach((key, i) => {
      imageOverrides[key] = resolvePageHeroImage(key, imagePages[i]?.heroBannerPath);
    });

    return {
      props: {
        initialAboutData: aboutRes?.data ?? null,
        initialPageBlocks: Array.isArray(blocks) ? blocks : [],
        initialLatestNews,
        imageOverrides,
        heroTitle: imagePages[0]?.heroTitle || null,
        initialSeoMeta: {
          title: seoRow?.metaTitle || null,
          description: seoRow?.metaDescription || null,
          imageUrl: seoRow?.metaImageUrl || null,
        },
      },
    };
  } catch (err) {
    return { props: { initialAboutData: null, initialPageBlocks: [], initialLatestNews: [], imageOverrides: {} } };
  }
}

export default AboutPage;

/* ─── SUBCOMPONENTES ──────────────────────────────────────── */

function TeamCarousel({ team }: { team: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [leadingOffset, setLeadingOffset] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const firstCard = track.querySelector<HTMLElement>("[data-team-card]");
      setLeadingOffset(firstCard?.offsetLeft ?? 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Manual swipe/scroll (the main way this works on mobile) never touched
  // activeIndex before, so after a swipe the Prev/Next buttons would jump
  // from a stale index instead of the card the user actually landed on.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const syncActiveIndex = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-team-card]"));
        if (!cards.length) return;
        let closest = 0;
        let closestDistance = Infinity;
        cards.forEach((card, idx) => {
          const distance = Math.abs(card.offsetLeft - track.scrollLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = idx;
          }
        });
        setActiveIndex(closest);
      });
    };
    track.addEventListener("scroll", syncActiveIndex, { passive: true });
    return () => {
      track.removeEventListener("scroll", syncActiveIndex);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-team-card]");
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    const target = cards[clamped];
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setActiveIndex(clamped);
  };

  const scrollByCard = (direction: 1 | -1) => scrollToIndex(activeIndex + direction);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-16">
        {/* Left: intro copy */}
        <div className="lg:sticky lg:top-28 self-start">
          <h3 className="font-gtsuper-ds font-light text-[#172338] text-[34px] md:text-[44px] leading-[1.05] mb-6">
            Meet The Team
          </h3>
          <div className="w-10 h-[1.5px] bg-[#D99330] mb-6" />
          <p className="font-haas font-light text-[#506A70] text-[15px] leading-[1.8] max-w-[380px]">
            At Kennedy's Group we are as global as our vision — a close-knit team based across Mykonos and beyond, united by two decades of hospitality expertise and a shared passion for crafting the perfect stay.
          </p>
        </div>

        {/* Right: carousel */}
        <div className="relative min-w-0">
          <div
            ref={trackRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Leading spacer: shifts the team right and guarantees scroll room even when all cards already fit */}
            <div className="shrink-0 w-[160px] sm:w-[220px] md:w-[280px]" aria-hidden="true" />
            {team.map((member: any, idx: number) => {
              const teamMemberSlug = member.slug || slugifyName(member.authorName || "") || member.id;
              const teamMemberHref = `/about-us/team/${teamMemberSlug}`;
              const CardTag: any = Link;
              const cardProps = { href: teamMemberHref };
              return (
                <CardTag
                  key={member.id || member.slug || idx}
                  data-team-card
                  className="shrink-0 w-[240px] sm:w-[280px] md:w-[300px] group/card snap-start"
                  {...cardProps}
                >
                  <div className="relative h-[300px] md:h-[380px] overflow-hidden mb-5 group">
                    <img
                      src={resolveTeamAvatarUrl(member.avatarUrl)}
                      alt={member.authorName}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-gtsuper-ds font-light text-[#172338] text-[22px] leading-[1.15] mb-1 group-hover/card:text-[#D99330] transition-colors duration-300">
                    {member.authorName}
                  </h4>
                  <p className="font-haas text-[11px] uppercase tracking-[0.2em] text-[#506A70]">
                    {member.authorRole}
                  </p>
                </CardTag>
              );
            })}
            {/* Trailing spacer: mirrors the leading one so the last card clears the viewport without leaving a huge blank gap */}
            <div className="shrink-0 w-[160px] sm:w-[220px] md:w-[280px]" aria-hidden="true" />
          </div>

          {/* Nav: aligned with the image's left edge (measured from the actual card position) */}
          <div className="flex items-center gap-4 mt-10" style={{ paddingLeft: leadingOffset }}>
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous team member"
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#172338]/20 text-[#172338] hover:border-[#172338] hover:bg-[#172338] hover:text-white transition-colors duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next team member"
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#172338]/20 text-[#172338] hover:border-[#172338] hover:bg-[#172338] hover:text-white transition-colors duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
            </button>
            <div className="flex-1 h-[1px] bg-[#E8EBF0]" />
          </div>
        </div>
      </div>
    </div>
  );
}
