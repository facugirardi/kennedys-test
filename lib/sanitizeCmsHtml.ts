import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML proveniente del CMS antes de inyectarlo con
 * `dangerouslySetInnerHTML`. Elimina scripts, handlers `on*`, `javascript:`
 * URLs y demás vectores de XSS, preservando el markup de formato habitual
 * (p, ul/li, headings, a, strong/em, br, etc.).
 *
 * Funciona tanto en SSR como en el cliente gracias a `isomorphic-dompurify`.
 *
 * @param html HTML potencialmente no confiable (puede ser undefined/null).
 * @returns HTML seguro listo para `dangerouslySetInnerHTML`. Cadena vacía si no hay entrada.
 */
export function sanitizeCmsHtml(html?: string | null): string {
  if (!html) return '';
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    // Permitir abrir enlaces del CMS en otra pestaña y colores del rich text editor.
    ADD_ATTR: ['target', 'rel', 'style', 'class'],
  });
  // El tamaño de texto lo controla siempre el CSS del sitio: se ignora cualquier
  // font-size inline (o clase de tamaño de Quill) que pueda venir del CMS.
  return sanitized
    .replace(/font-size\s*:\s*[^;"']+;?/gi, '')
    .replace(/\bql-size-\w+\b/g, '');
}
