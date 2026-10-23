import React from 'react';
import { GetServerSideProps } from 'next';
import LegalPageShell from '@/components/legal/LegalPageShell';
import PrivacyContent, { PRIVACY_SECTION_TITLES } from '@/components/legal/PrivacyContent';
import { slugifyLegalTitle, injectLegalSectionIds } from '@/components/legal/legalTypography';
import { fetchPageByKeyServer } from '@/lib/api/pages';
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml';

type Props = {
  richContent: string | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const page = await fetchPageByKeyServer('privacy');
  return { props: { richContent: page?.richContent ?? null } };
};

export default function PrivacyPage({ richContent }: Props) {
  const processed = richContent ? injectLegalSectionIds(sanitizeCmsHtml(richContent)) : null;
  const sections =
    processed?.sections ??
    PRIVACY_SECTION_TITLES.map((label) => ({ label, id: slugifyLegalTitle(label) }));

  return (
    <LegalPageShell
      title="Information Policy on Personal Data Processing for Website Users (Privacy Policy)"
      seoTitle="Privacy Policy"
      seoDescription="How Kennedy's Group collects, uses, and protects your personal data."
      canonicalPath="/privacy"
      sections={sections}
    >
      {processed ? (
        <div
          className="legal-rich-content"
          dangerouslySetInnerHTML={{ __html: processed.html }}
        />
      ) : (
        <PrivacyContent />
      )}
    </LegalPageShell>
  );
}
