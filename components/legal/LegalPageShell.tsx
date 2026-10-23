import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/custom/Navbar';
import Footer from '@/components/custom/footerNew';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';

type LegalNavItem = {
  label: string;
  id: string;
};

type LegalPageShellProps = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  effectiveDate?: string;
  sections?: LegalNavItem[];
  children: React.ReactNode;
};

const LEGAL_PAGES = [
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookies Policy', href: '/cookies' },
];

export default function LegalPageShell({
  title,
  seoTitle,
  seoDescription,
  canonicalPath,
  effectiveDate = 'December 2021',
  sections,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <SeoHead
        title={`${seoTitle} | ${SITE_NAME}`}
        description={seoDescription}
        canonicalPath={canonicalPath}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar textBlack className="bg-white" />
        <main className="flex-1 bg-white pt-28">
          <div className="mx-auto max-w-6xl px-6 py-12 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            <aside className="mb-10 lg:mb-0">
              <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <nav aria-label="Legal pages">
                  <ul className="space-y-2">
                    {LEGAL_PAGES.map((page) => {
                      const isActive = page.href === canonicalPath;
                      return (
                        <li key={page.href}>
                          <Link
                            href={page.href}
                            className={
                              isActive
                                ? 'font-haas text-sm font-medium text-[#172338]'
                                : 'font-haas text-sm text-[#506A70] transition-colors hover:text-[#172338]'
                            }
                          >
                            {page.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {sections && sections.length > 0 && (
                  <>
                    <div className="my-6 h-px w-full bg-[#E7E2D9]" />
                    <p className="font-haas text-xs font-medium uppercase tracking-wide text-[#96887A]">
                      On this page
                    </p>
                    <nav aria-label="Sections on this page" className="mt-3">
                      <ul className="space-y-2 border-l border-[#E7E2D9] pl-4">
                        {sections.map((section) => (
                          <li key={section.id}>
                            <a
                              href={`#${section.id}`}
                              className="font-haas text-sm leading-snug text-[#506A70] transition-colors hover:text-[#172338]"
                            >
                              {section.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            </aside>

            <div className="min-w-0">
              <h1 className="font-haas text-3xl font-medium tracking-tight text-[#172338] md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 font-haas text-sm leading-relaxed text-[#506A70]">
                Effective {effectiveDate}
              </p>
              <div className="mt-10 max-w-[70ch]">{children}</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
