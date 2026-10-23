import React from 'react';
import { GetServerSideProps } from 'next';
import LegalPageShell from '@/components/legal/LegalPageShell';
import TermsContent, { TERMS_SECTION_TITLES } from '@/components/legal/TermsContent';
import { slugifyLegalTitle, injectLegalSectionIds } from '@/components/legal/legalTypography';
import { fetchPageByKeyServer } from '@/lib/api/pages';
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml';

type Props = {
  richContent: string | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const page = await fetchPageByKeyServer('terms');
  return { props: { richContent: page?.richContent ?? null } };
};

function fixBareWwwLinks(html: string): string {
  // Fix bare www. links that render as relative paths (e.g. href="www.kennedysgroup.com")
  return html.replace(/href="(www\.[^"]+)"/g, 'href="https://$1"');
}

export default function TermsPage({ richContent }: Props) {
  const processed = richContent
    ? injectLegalSectionIds(sanitizeCmsHtml(fixBareWwwLinks(richContent)))
    : null;
  const sections =
    processed?.sections ??
    TERMS_SECTION_TITLES.map((label) => ({ label, id: slugifyLegalTitle(label) }));

  return (
    <LegalPageShell
      title="Terms of Use"
      seoTitle="Terms of Use"
      seoDescription="Terms and conditions governing the use of the Kennedy's Group website and services."
      canonicalPath="/terms"
      sections={sections}
    >
      {processed ? (
        <div
          className="legal-rich-content"
          dangerouslySetInnerHTML={{ __html: processed.html }}
        />
      ) : (
        <TermsContent />
      )}
    </LegalPageShell>
  );
}
