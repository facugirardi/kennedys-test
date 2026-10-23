'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ContactInquiryType } from '@/lib/contactInquiryTypes';
import { useContact } from '@/src/contexts/ContactContext';

type OpenNavbarContactProps = {
  children: ReactNode;
  className?: string;
  /** Pre-select inquiry type on the contact page */
  contactPreset?: ContactInquiryType | null;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'children'>;

/** Navigates to the same contact page as the Navbar. */
export function OpenNavbarContact({ children, className, contactPreset, ...rest }: OpenNavbarContactProps) {
  const { openContactForm } = useContact();
  return (
    <button
      type="button"
      className={className}
      onClick={() => openContactForm(contactPreset ?? null)}
      {...rest}
    >
      {children}
    </button>
  );
}
