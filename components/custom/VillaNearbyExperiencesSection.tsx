import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { VillaNearbyExperienceCard } from '@/lib/villaNearbyExperiences';
import { fetchVillaNearbyExperiencesPreview } from '@/lib/villaNearbyExperiences';
import { kennedysTreeLeafMatchingSlug } from '@/lib/kennedysLocationFilterTree';

const DESKTOP_IMG = [
  { width: 332, height: 322 },
  { width: 338, height: 192 },
  { width: 338, height: 192 },
  { width: 332, height: 322 },
] as const;

/** Shrinks the label font as the title gets longer, so long titles fit without wrapping oddly. */
function fontSizeClassForLength(length: number): string {
  if (length > 65) return 'text-[11px] md:text-[13px]';
  if (length > 50) return 'text-[13px] md:text-[16px]';
  return 'text-[16px] md:text-[20px]';
}

/** Wraps at word boundaries; lines never exceed maxLen (long words split). */
function wrapToMaxCharsPerLine(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (word.length > maxLen) {
      if (current) {
        lines.push(current);
        current = '';
      }
      for (let i = 0; i < word.length; i += maxLen) {
        lines.push(word.slice(i, i + maxLen));
      }
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLen) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

function ExperienceCardLabel({
  title,
  highlight,
  maxCharsPerLine,
  maxWidth,
}: {
  title: string;
  highlight?: boolean;
  /** Corta el título en líneas de como mucho N caracteres para que nunca desborde su tarjeta. */
  maxCharsPerLine?: number;
  /** Ancho máximo (px) del bloque de texto; evita que un título largo estire la tarjeta. */
  maxWidth?: number;
}) {
  const upper = title.toUpperCase();
  let parts = upper.includes(',')
    ? upper.split(',').map((p) => p.trim()).filter(Boolean)
    : [upper];

  if (maxCharsPerLine != null && maxCharsPerLine > 0) {
    parts = parts.flatMap((segment) => wrapToMaxCharsPerLine(segment.trim(), maxCharsPerLine));
  }

  const colorClass = highlight ? 'text-[#D99330]' : 'text-[#3C3C50]';
  const sizeClass = fontSizeClassForLength(upper.length);
  return (
    <p
      className={`mt-1 font-gtsuper-ds ${sizeClass} font-light break-words ${colorClass}`}
      style={maxWidth ? { maxWidth, marginLeft: 'auto', marginRight: 'auto' } : undefined}
    >
      {parts.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  );
}

function MobileImage({ card }: { card: VillaNearbyExperienceCard }) {
  return (
    <div className="relative w-full pb-[100%]">
      <img
        src={card.imageSrc}
        alt={card.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function DesktopImage({ card, index }: { card: VillaNearbyExperienceCard; index: number }) {
  const dim = DESKTOP_IMG[index];
  return (
    <div
      className={`relative overflow-hidden ${index === 1 ? '-mt-3' : ''} ${index === 2 ? 'mt-3' : ''}`}
      style={{ width: dim.width, height: dim.height }}
    >
      <img
        src={card.imageSrc}
        alt={card.imageAlt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function VillaNearbyExperiencesSection({
  cards,
  experienceCitySlug = null,
  propertyForNearbyRefetch = null,
}: {
  cards: VillaNearbyExperienceCard[];
  /** When set, prefilled location on `/experiences/list` via `?area=` / `?city=` when not in tree. */
  experienceCitySlug?: string | null;
  /** If SSR returned no cards (e.g. API unreachable from the server), refetch in the browser once. */
  propertyForNearbyRefetch?: Record<string, unknown> | null;
}) {
  const [clientNearby, setClientNearby] = useState<Awaited<
    ReturnType<typeof fetchVillaNearbyExperiencesPreview>
  > | null>(null);

  useEffect(() => {
    if (!propertyForNearbyRefetch || cards.length > 0) return;
    let cancelled = false;
    void fetchVillaNearbyExperiencesPreview(propertyForNearbyRefetch).then((result) => {
      if (cancelled || result.cards.length === 0) return;
      setClientNearby(result);
    });
    return () => {
      cancelled = true;
    };
  }, [propertyForNearbyRefetch, cards.length]);

  const effectiveCards = clientNearby?.cards?.length ? clientNearby.cards : cards;
  const effectiveSlug = clientNearby?.experienceCitySlug || experienceCitySlug;
  const canonicalLeaf = effectiveSlug ? kennedysTreeLeafMatchingSlug(effectiveSlug) : null;
  const viewAllHref = canonicalLeaf
    ? `/experiences/list?area=${encodeURIComponent(canonicalLeaf)}`
    : effectiveSlug
      ? `/experiences/list?city=${encodeURIComponent(effectiveSlug)}`
      : '/experiences/list';

  const list = effectiveCards.slice(0, 4);

  if (list.length === 0) return null;

  return (
    <section
      id="nearby-experiences"
      className="w-full bg-white pb-[180px] [font-family:'Abhaya_Libre',serif]"
    >
      <div className="mx-auto text-center px-4 py-16">
        <h2 className="text-center font-gtsuper-ds text-5xl mb-4 font-thin text-[#506A70]">
          What&apos;s happening around
        </h2>
        <p className="text-center font-haas text-lg font-light text-[#172338] mb-10 max-w-3xl mx-auto">
          Discover curated activities and experiences near your stay — private tours, lifestyle add-ons, and memorable moments tailored to the destination.
        </p>

        <div className="grid grid-cols-2 gap-4 md:hidden">
          {list.map((card, index) => {
            const body = (
              <>
                <MobileImage card={card} />
                <ExperienceCardLabel
                  title={card.title}
                  highlight={card.highlight}
                />
              </>
            );
            return card.id ? (
              <Link
                key={card.id}
                href={`/experiences/${encodeURIComponent(card.id)}`}
                aria-label={card.title}
                className="text-center hover:opacity-90 transition-opacity"
              >
                {body}
              </Link>
            ) : (
              <div key={`m-fb-${index}`} className="text-center cursor-default opacity-95">
                {body}
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex justify-center px-15 gap-6 -translate-x-5">
          {list.map((card, index) => {
            const dim = DESKTOP_IMG[index];
            const desktopClass = `flex flex-col gap-1 mt-10 shrink-0 ${
              index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
            } ${index === 1 ? 'translate-y-72 z-10 translate-x-16 mt-8' : ''} ${
              index === 2 ? '-translate-x-40 mt-10' : ''
            } ${index === 3 ? '-translate-x-36' : ''}`;
            const labelAlign = index === 2 ? 'md:text-right' : 'md:text-left';
            const body = (
              <>
                <DesktopImage card={card} index={index} />
                <div className={labelAlign} style={{ width: dim.width }}>
                  <ExperienceCardLabel
                    title={card.title}
                    highlight={card.highlight}
                    maxWidth={dim.width}
                    maxCharsPerLine={index === 0 ? 20 : undefined}
                  />
                </div>
              </>
            );
            return card.id ? (
              <Link
                key={card.id}
                href={`/experiences/${encodeURIComponent(card.id)}`}
                aria-label={card.title}
                className={`${desktopClass} hover:text-primary hover:opacity-90 transition-opacity cursor-pointer`}
              >
                {body}
              </Link>
            ) : (
              <div key={`d-fb-${index}`} className={`${desktopClass} cursor-default opacity-95`}>
                {body}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-14 flex w-full max-w-[1200px] justify-center px-2 md:mt-8 md:justify-end">
          <Link
            href={viewAllHref}
            className="font-haas text-[15px] text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-80"
          >
            View all experiences
          </Link>
        </div>
      </div>
    </section>
  );
}
