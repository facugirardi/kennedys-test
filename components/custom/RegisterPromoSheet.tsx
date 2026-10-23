'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { X, Gift } from 'lucide-react';

type RegisterPromoSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MOBILE_MAX_WIDTH = 767;

export function RegisterPromoSheet({ isOpen, onClose }: RegisterPromoSheetProps) {
  const router = useRouter();
  const [sheetIn, setSheetIn] = useState(false);

  const returnTo =
    typeof router.asPath === 'string' && router.asPath.startsWith('/') && !router.asPath.startsWith('//')
      ? router.asPath
      : '/';
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!isOpen) {
      setSheetIn(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const isMobileWidth = () => window.innerWidth <= MOBILE_MAX_WIDTH;

    const apply = () => {
      document.body.style.overflow = isMobileWidth() ? 'hidden' : originalOverflow;
    };

    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={[
        'fixed z-[75]',
        'max-md:inset-0',
        'md:pointer-events-none md:left-4 md:bottom-4 md:right-auto md:top-auto md:w-[min(100vw-2rem,26rem)]',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 md:hidden"
        aria-label="Close registration offer"
        onClick={onClose}
      />
      <div
        className={[
          'flex flex-col bg-white',
          'max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[min(90vh,100dvh)] max-md:overflow-y-auto max-md:border-t max-md:border-[#E5E7EB] max-md:shadow-[0_-12px_48px_rgba(23,35,56,0.14)] max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]',
          'max-md:transition-transform max-md:duration-300 max-md:ease-out',
          sheetIn ? 'max-md:translate-y-0' : 'max-md:translate-y-full',
          'md:pointer-events-auto md:max-h-[min(90vh,34rem)] md:overflow-y-auto md:border md:border-[#E5E7EB] md:shadow-[0_12px_40px_rgba(23,35,56,0.18)] md:ring-1 md:ring-[#172338]/[0.06]',
          'md:transition-all md:duration-300 md:ease-out',
          sheetIn ? 'md:translate-y-0 md:opacity-100' : 'md:translate-y-3 md:opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="false"
        aria-labelledby="register-promo-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1 md:hidden" aria-hidden>
          <div className="h-1 w-10 bg-[#D1D5DB]" />
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] px-4 pb-4 pt-1 sm:px-5 sm:pb-5 md:px-5 md:py-3">
          <div className="flex min-w-0 gap-2.5">
            <Gift
              className="mt-0.5 size-5 shrink-0 text-[#D99330] sm:size-[22px]"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-gtsuper-ds text-xs font-light uppercase tracking-[0.12em] text-[#172338] sm:text-sm md:text-xs">
                Member benefits
              </p>
              <h2
                id="register-promo-title"
                className="mt-0.5 font-haas text-base font-medium text-[#172338] sm:text-lg md:text-base"
              >
                Register for special offers
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 text-[#506A70] transition-colors hover:bg-[#F7F8FA] hover:text-[#172338]"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-2 pt-5 sm:px-5 sm:pb-3 sm:pt-6 md:px-5 md:py-4 md:pb-4 md:pt-4">
          <p className="font-haas text-xs font-light leading-relaxed text-[#506A70] sm:text-sm md:text-[11px] md:leading-relaxed">
            Create a free account to access member-only rates, tailored recommendations and early access to new stays and
            experiences. See our{' '}
            <Link
              href="/privacy"
              className="font-medium text-[#172338] underline decoration-[#D99330]/50 underline-offset-2 hover:decoration-[#D99330]"
            >
              Privacy
            </Link>{' '}
            page for how we use your data.
          </p>
          <Link
            href={loginHref}
            className="block w-full bg-[#28F7EA] py-3.5 text-center font-haas text-base font-medium text-[#172338] transition-colors hover:bg-[#1fd1c5] md:py-2.5 md:text-sm"
            onClick={onClose}
          >
            Create account
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-[#E5E7EB] bg-white py-3 font-haas text-sm font-light text-[#506A70] transition-colors hover:border-[#506A70]/40 hover:bg-[#F7F8FA] md:py-2.5 md:text-xs"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
