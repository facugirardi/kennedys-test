'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/src/contexts/AuthContext';
import { NewsletterSignupSheet } from '@/components/custom/NewsletterSignupSheet';
import { RegisterPromoSheet } from '@/components/custom/RegisterPromoSheet';

const PROMO_COOLDOWN_MS = 48 * 60 * 60 * 1000;

const LS_NEWSLETTER_LAST_AT = 'kennedys_newsletter_promo_last_at';
const LS_REGISTER_PROMO_LAST_AT = 'kennedys_register_promo_last_at';

/** Tiempo tras cerrar el de registro antes de mostrar el newsletter (no solapar con el sheet de registro). */
const NEWSLETTER_DELAY_AFTER_REGISTER_MS = 5 * 60 * 1000;

function isPromoCooldownElapsed(storageKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return true;
    const t = parseInt(raw, 10);
    if (Number.isNaN(t)) return true;
    return Date.now() - t >= PROMO_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markPromoLastShown(storageKey: string) {
  try {
    localStorage.setItem(storageKey, String(Date.now()));
  } catch {
    /* ignore */
  }
}

type NewsletterContextType = {
  openNewsletter: () => void;
  closeNewsletter: () => void;
};

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export function NewsletterProvider({
  children,
  suppressPromos: suppressPromosProp = false,
}: {
  children: ReactNode;
  suppressPromos?: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [registerPromoOpen, setRegisterPromoOpen] = useState(false);
  const { user, token, initializing } = useAuth();
  const loggedInRef = useRef(false);
  loggedInRef.current = Boolean(user || token);
  const registerAutoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newsletterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressPromos =
    router.pathname === '/login' ||
    router.pathname.startsWith('/pdf') ||
    suppressPromosProp;

  const clearRegisterAutoTimeout = useCallback(() => {
    if (registerAutoTimeoutRef.current !== null) {
      clearTimeout(registerAutoTimeoutRef.current);
      registerAutoTimeoutRef.current = null;
    }
  }, []);

  const clearNewsletterTimeout = useCallback(() => {
    if (newsletterTimeoutRef.current !== null) {
      clearTimeout(newsletterTimeoutRef.current);
      newsletterTimeoutRef.current = null;
    }
  }, []);

  const closeNewsletter = useCallback(() => {
    if (suppressPromos) return;
    markPromoLastShown(LS_NEWSLETTER_LAST_AT);
    clearNewsletterTimeout();
    setIsOpen(false);
  }, [clearNewsletterTimeout, suppressPromos]);

  const closeRegisterPromo = useCallback(() => {
    if (suppressPromos) return;
    markPromoLastShown(LS_REGISTER_PROMO_LAST_AT);
    clearRegisterAutoTimeout();
    setRegisterPromoOpen(false);

    if (loggedInRef.current) return;
    if (!isPromoCooldownElapsed(LS_NEWSLETTER_LAST_AT)) return;

    clearNewsletterTimeout();
    newsletterTimeoutRef.current = window.setTimeout(() => {
      newsletterTimeoutRef.current = null;
      if (loggedInRef.current) return;
      if (!isPromoCooldownElapsed(LS_NEWSLETTER_LAST_AT)) return;
      markPromoLastShown(LS_NEWSLETTER_LAST_AT);
      setIsOpen(true);
    }, NEWSLETTER_DELAY_AFTER_REGISTER_MS);
  }, [clearNewsletterTimeout, clearRegisterAutoTimeout, suppressPromos]);

  const openNewsletter = useCallback(() => {
    if (suppressPromos) return;
    clearRegisterAutoTimeout();
    clearNewsletterTimeout();
    setRegisterPromoOpen(false);
    setIsOpen(true);
  }, [clearNewsletterTimeout, clearRegisterAutoTimeout, suppressPromos]);

  useEffect(() => {
    if (initializing) return;
    if (typeof window === 'undefined') return;
    if (suppressPromos) return;
    if (user || token) return;
    if (!isPromoCooldownElapsed(LS_REGISTER_PROMO_LAST_AT)) return;

    const delayMs = 2000;
    registerAutoTimeoutRef.current = window.setTimeout(() => {
      registerAutoTimeoutRef.current = null;
      if (loggedInRef.current) return;
      if (!isPromoCooldownElapsed(LS_REGISTER_PROMO_LAST_AT)) return;
      markPromoLastShown(LS_REGISTER_PROMO_LAST_AT);
      setRegisterPromoOpen(true);
    }, delayMs);

    return () => {
      if (registerAutoTimeoutRef.current !== null) {
        clearTimeout(registerAutoTimeoutRef.current);
        registerAutoTimeoutRef.current = null;
      }
    };
  }, [initializing, user, token, suppressPromos]);

  useEffect(() => {
    if (initializing) return;
    if (user || token) {
      clearRegisterAutoTimeout();
      clearNewsletterTimeout();
      setIsOpen(false);
      setRegisterPromoOpen(false);
    }
  }, [user, token, initializing, clearRegisterAutoTimeout, clearNewsletterTimeout]);

  useEffect(() => {
    if (!suppressPromos) return;
    clearRegisterAutoTimeout();
    clearNewsletterTimeout();
    setIsOpen(false);
    setRegisterPromoOpen(false);
  }, [suppressPromos, clearRegisterAutoTimeout, clearNewsletterTimeout]);

  useEffect(() => () => {
    clearRegisterAutoTimeout();
    clearNewsletterTimeout();
  }, [clearRegisterAutoTimeout, clearNewsletterTimeout]);

  return (
    <NewsletterContext.Provider value={{ openNewsletter, closeNewsletter }}>
      {children}
      {!suppressPromos ? (
        <>
          <NewsletterSignupSheet isOpen={isOpen} onClose={closeNewsletter} />
          <RegisterPromoSheet isOpen={registerPromoOpen} onClose={closeRegisterPromo} />
        </>
      ) : null}
    </NewsletterContext.Provider>
  );
}

export function useNewsletter() {
  const ctx = useContext(NewsletterContext);
  if (ctx === undefined) {
    throw new Error('useNewsletter must be used within NewsletterProvider');
  }
  return ctx;
}
