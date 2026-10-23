/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import Navbar from "@/components/custom/Navbar";
import Footer from "@/components/custom/footerNew";
import { SeoHead } from "@/components/seo/SeoHead";
import { SITE_NAME } from "@/lib/seo/config";
import type { TeamMember } from "@/lib/data/team";

type TeamMemberProfileProps = {
  member: TeamMember;
  /** Overrides the canonical URL; defaults to the legacy `/${slug}` static pages. */
  profilePath?: string;
  /** Public origin (https://example.com), needed for absolute og:image/og:url during SSR. */
  siteOrigin?: string;
};

export default function TeamMemberProfile({ member, profilePath, siteOrigin }: TeamMemberProfileProps) {
  const bio = member.body?.trim();

  return (
    <>
      <SeoHead
        title={`${member.authorName} | ${member.authorRole} | ${SITE_NAME}`}
        description={bio || `Meet ${member.authorName}, ${member.authorRole} at ${SITE_NAME}.`}
        canonicalPath={profilePath || `/${member.slug}`}
        imageUrl={member.avatarUrl}
        siteOrigin={siteOrigin}
      />

      <main className="w-full bg-white">
        <Navbar textBlack className="w-full" />

        <section className="mx-auto max-w-[1000px] px-6 md:px-12 pt-32 pb-8 md:pt-40 md:pb-12 flex flex-col items-center text-center">
          <Link
            href="/about-us"
            className="font-haas text-[11px] uppercase tracking-[0.25em] text-[#506A70] hover:text-[#D99330] transition-colors duration-300 mb-10 inline-flex items-center gap-2"
          >
            <svg width="14" height="8" viewBox="0 0 16 8" fill="none">
              <path d="M16 4H2M2 4L5 1M2 4L5 7" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Back to the team
          </Link>

          <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden mb-8">
            <img
              src={member.avatarUrl}
              alt={member.authorName}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <h1 className="font-gtsuper-ds font-light text-[#172338] text-[40px] md:text-[56px] leading-[1.05] mb-3">
            {member.authorName}
          </h1>
          <p className="font-haas text-[12px] uppercase tracking-[0.25em] text-[#48A4B4]">
            {member.authorRole}
          </p>
        </section>

        {bio && (
          <section className="mx-auto max-w-[720px] px-6 md:px-12 pb-20 md:pb-28">
            <div className="w-10 h-[1.5px] bg-[#D99330] mx-auto mb-8" />
            <p className="font-haas font-light text-[#506A70] text-[15px] md:text-[17px] leading-[1.9] text-center">
              {bio}
            </p>
          </section>
        )}

        {(member.email || member.phone) && (
          <section className="w-full bg-[#F5F5F3] py-16 md:py-20">
            <div className="mx-auto max-w-[600px] px-6 md:px-12 flex flex-col items-center text-center">
              <p className="font-haas text-[10px] uppercase tracking-[0.3em] text-[#48A4B4] mb-4">
                Get In Touch
              </p>
              <h2 className="font-gtsuper-ds font-light text-[#172338] text-[26px] md:text-[34px] leading-[1.1] mb-8">
                Work with {member.authorName}
              </h2>

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="font-haas font-light text-[#172338] text-[15px] md:text-[16px] underline underline-offset-4 hover:text-[#D99330] transition-colors duration-300"
                >
                  {member.email}
                </a>
              )}

              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="font-haas font-light text-[#172338] text-[15px] md:text-[16px] mt-3 underline underline-offset-4 hover:text-[#D99330] transition-colors duration-300"
                >
                  {member.phone}
                </a>
              )}
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}
