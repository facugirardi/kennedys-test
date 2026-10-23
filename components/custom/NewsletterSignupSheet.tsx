'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Mail } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api/newsletter';

type NewsletterSignupSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Tailwind `md` breakpoint — sync with body scroll lock */
const MOBILE_MAX_WIDTH = 767;

export function NewsletterSignupSheet({ isOpen, onClose }: NewsletterSignupSheetProps) {
  const [email, setEmail] = useState('');
  const [sheetIn, setSheetIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSheetIn(false);
      return;
    }
    setEmail('');
    setStatus('idle');
    setErrorMessage(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setErrorMessage('Please enter your email.');
      return;
    }
    setStatus('loading');
    const res = await subscribeNewsletter(trimmed);
    if (res?.success !== false) {
      setStatus('success');
      window.setTimeout(() => onClose(), 2200);
      return;
    }
    setStatus('error');
    setErrorMessage(
      typeof res?.message === 'string' ? res.message : 'Something went wrong. Please try again.'
    );
  };

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
        aria-label="Close newsletter"
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
        aria-labelledby="newsletter-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 justify-center pt-3 pb-1 md:hidden"
          aria-hidden
        >
          <div className="h-1 w-10 bg-[#D1D5DB]" />
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] px-4 pb-4 pt-1 sm:px-5 sm:pb-5 md:px-5 md:py-3">
          <div className="min-w-0">
            <p className="font-gtsuper-ds text-xs font-light uppercase tracking-[0.12em] text-[#172338] sm:text-sm md:text-xs">
              Newsletter
            </p>
            <h2
              id="newsletter-title"
              className="mt-0.5 font-haas text-base font-medium text-[#172338] sm:text-lg md:text-base"
            >
              Sign up for updates
            </h2>
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

        <div className="flex flex-col px-4 pb-2 pt-5 sm:px-5 sm:pb-3 sm:pt-6 md:px-5 md:py-4 md:pb-4 md:pt-4">
          {status === 'success' ? (
            <p className="font-haas text-sm font-light leading-relaxed text-[#506A70] sm:text-base md:text-sm">
              Thank you. You are subscribed to the Kennedy&apos;s Group newsletter.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3">
              <p className="font-haas text-xs font-light leading-relaxed text-[#506A70] sm:text-sm md:text-[11px] md:leading-relaxed">
                Get news on villas, destinations and curated experiences. We respect your privacy — see our{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-[#172338] underline decoration-[#D99330]/50 underline-offset-2 hover:decoration-[#D99330]"
                >
                  Privacy
                </Link>{' '}
                page.
              </p>
              <label className="flex w-full min-h-[48px] cursor-text overflow-hidden border border-[#506A70] focus-within:ring-1 focus-within:ring-[#172338]/20 focus-within:ring-inset md:min-h-[42px]">
                <span className="flex shrink-0 items-center border-r border-[#506A70] bg-white px-2.5 py-2 sm:px-3">
                  <Mail className="size-4 text-[#506A70]" strokeWidth={1.75} aria-hidden />
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 border-0 bg-white px-2.5 py-2 font-haas text-base font-light text-[#172338] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 sm:px-3 md:text-sm"
                  disabled={status === 'loading'}
                />
              </label>
              {(errorMessage || status === 'error') && (
                <p className="font-haas text-[11px] text-red-600 sm:text-xs">{errorMessage || 'Please check your email.'}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#28F7EA] py-3.5 font-haas text-base font-medium text-[#172338] transition-colors hover:bg-[#1fd1c5] disabled:opacity-60 md:py-2.5 md:text-sm"
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
