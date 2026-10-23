import React from 'react';

export function slugifyLegalTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export type LegalTocSection = { id: string; label: string };

/**
 * Inyecta un `id` (slug) en cada `<h2>` del HTML de un rich text del CMS y
 * devuelve la lista de secciones para armar el índice "On this page".
 * Debe llamarse sobre HTML ya sanitizado (p. ej. con sanitizeCmsHtml).
 */
export function injectLegalSectionIds(html: string): {
  html: string;
  sections: LegalTocSection[];
} {
  const sections: LegalTocSection[] = [];
  const withIds = html.replace(/<h2>(.*?)<\/h2>/g, (_match, inner) => {
    const label = inner.replace(/<[^>]+>/g, '').trim();
    const id = slugifyLegalTitle(label);
    sections.push({ id, label });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: withIds, sections };
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = slugifyLegalTitle(title);
  return (
    <section
      id={id}
      className="mt-10 scroll-mt-28 border-t border-[#E7E2D9] pt-8 first:mt-0 first:border-t-0 first:pt-0"
    >
      <h2 className="font-haas text-2xl font-medium tracking-tight text-[#172338]">
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function LegalClause({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p className="font-haas text-base leading-relaxed text-[#506A70]">
      <span className="font-medium text-[#172338]">{id}</span> {children}
    </p>
  );
}

export function LegalList({
  type = 'lower-roman',
  items,
}: {
  type?: 'lower-roman' | 'lower-alpha';
  items: React.ReactNode[];
}) {
  const listClass =
    type === 'lower-roman'
      ? 'list-[lower-roman] pl-6'
      : 'list-[lower-alpha] pl-6';

  return (
    <ol className={`${listClass} space-y-2 font-haas text-base leading-relaxed text-[#506A70]`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}
