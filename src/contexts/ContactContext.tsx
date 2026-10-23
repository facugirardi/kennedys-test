'use client';

import { useRouter } from 'next/router';
import type { ContactInquiryType } from '@/lib/contactInquiryTypes';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

interface ContactFormExtra {
  propertyTitle?: string | null;
  propertyPrice?: string | null;
  propertyImage?: string | null;
}

interface ContactContextType {
  openContactForm: (preset?: ContactInquiryType | null, extra?: ContactFormExtra) => void;
  propertyTitle: string | null;
  setPropertyTitle: (title: string | null) => void;
  propertyPrice: string | null;
  setPropertyPrice: (price: string | null) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

interface ContactProviderProps {
  children: ReactNode;
}

export const ContactProvider = ({ children }: ContactProviderProps) => {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const [propertyTitle, setPropertyTitle] = useState<string | null>(null);
  const [propertyPrice, setPropertyPrice] = useState<string | null>(null);

  const openContactForm = useCallback((preset?: ContactInquiryType | null, extra?: ContactFormExtra) => {
    if (isAgentPortfolioSite) return;
    const params = new URLSearchParams();
    if (preset) params.set('type', preset);
    if (extra?.propertyTitle) params.set('propertyTitle', extra.propertyTitle);
    if (extra?.propertyPrice) params.set('propertyPrice', extra.propertyPrice);
    if (extra?.propertyImage) params.set('propertyImage', extra.propertyImage);
    const query = params.toString();
    router.push(query ? `/contact-us?${query}` : '/contact-us');
  }, [router, isAgentPortfolioSite]);

  return (
    <ContactContext.Provider
      value={{ openContactForm, propertyTitle, setPropertyTitle, propertyPrice, setPropertyPrice }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};
