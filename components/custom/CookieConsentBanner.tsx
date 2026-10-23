import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'kennedys_cookie_consent_v1';

function hasStoredChoice(value: string | null): boolean {
  return value === 'accept' || value === 'reject' || value === '1';
}

export type CookieConsentBannerProps = {
  onVisibilityChange?: (visible: boolean) => void;
};

export function CookieConsentBanner({ onVisibilityChange }: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (hasStoredChoice(window.localStorage.getItem(STORAGE_KEY))) return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    onVisibilityChange?.(visible);
  }, [visible, onVisibilityChange]);

  const dismiss = (choice: 'accept' | 'reject') => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[#E5E7EB] bg-white shadow-[0_-2px_16px_rgba(23,35,56,0.06)]"
      style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))' }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="relative mx-auto max-w-5xl px-3 py-2.5 sm:px-5 sm:py-3">
        <button
          type="button"
          onClick={() => dismiss('reject')}
          className="absolute right-1.5 top-1.5 z-10 rounded p-1.5 text-[#506A70] transition-colors hover:bg-[#F7F8FA] hover:text-[#172338] sm:right-3 sm:top-2.5"
          aria-label="Close cookie notice"
        >
          <X className="size-4 sm:size-[18px]" strokeWidth={2} aria-hidden />
        </button>
        <div className="flex flex-col gap-2.5 pr-7 sm:flex-row sm:items-center sm:gap-4 sm:pr-10">
          <div className="flex flex-1 gap-2 sm:items-start sm:gap-2.5">
            <Cookie
              className="mt-0.5 size-[18px] shrink-0 text-[#D99330] sm:mt-px sm:size-5"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                id="cookie-consent-title"
                className="font-haas text-xs font-medium text-[#172338] sm:text-[13px]"
              >
                Cookies on this site
              </p>
              <p
                id="cookie-consent-desc"
                className="mt-0.5 font-haas text-[11px] font-light leading-snug text-[#506A70] sm:text-xs sm:leading-relaxed"
              >
                We use cookies to improve your experience and understand how our site is used. See our{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-[#172338] underline decoration-[#D99330]/60 underline-offset-2 hover:decoration-[#D99330]"
                >
                  Privacy
                </Link>{' '}
                page for more information.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => dismiss('reject')}
              className="font-haas flex-1 border border-[#E5E7EB] bg-white px-3 py-1.5 text-[11px] font-light text-[#506A70] transition-colors hover:border-[#506A70]/40 hover:bg-[#F7F8FA] sm:flex-initial sm:min-w-[90px] sm:px-3.5 sm:py-2 sm:text-xs"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => dismiss('accept')}
              className="font-haas flex-1 bg-[#28F7EA] px-3 py-1.5 text-[11px] font-medium text-[#172338] transition-colors hover:bg-[#1fd1c5] sm:flex-initial sm:min-w-[90px] sm:px-3.5 sm:py-2 sm:text-xs"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
