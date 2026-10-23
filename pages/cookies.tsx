import React from 'react';
import LegalPageShell from '@/components/legal/LegalPageShell';
import CookiesContent, { COOKIES_SECTION_TITLES } from '@/components/legal/CookiesContent';
import { slugifyLegalTitle } from '@/components/legal/legalTypography';

export async function getStaticProps() {
  return { props: {} };
}

const sections = COOKIES_SECTION_TITLES.map((label) => ({
  label,
  id: slugifyLegalTitle(label),
}));

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookies Policy"
      seoTitle="Cookie Policy"
      seoDescription="How Kennedy's Group uses cookies and similar technologies on its website."
      canonicalPath="/cookies"
      sections={sections}
    >
      <CookiesContent />
    </LegalPageShell>
  );
}
