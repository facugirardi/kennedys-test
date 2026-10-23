"use client";

import React, { useEffect, useState } from 'react';
import { trackContactFormSubmit } from '@/lib/utils/googleAdsConversions';
import OlgaImage from "@/public/images/olgaImage.jpg";
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/src/contexts/AuthContext';
import { X, Mail, Phone } from 'lucide-react';
import Label from '../label';
import { Input } from '../ui/input1';
import { Checkbox } from '../ui/checkbox';
import { mutateAPI } from '@/lib/api/fetcher';
import { CONTACT_INQUIRY_OPTIONS } from '@/lib/contactInquiryTypes';

const TITLE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' },
];

const COUNTRY_CODES = [
  { value: '+30', label: '+30 (Greece)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+7', label: '+7 (Russia)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+54', label: '+54 (Argentina)' },
];

type FullFormData = {
  inquiryType: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  note: string;
  travelDates: string;
  requestQuote: boolean;
  privacyPolicy: boolean;
  newsletter: boolean;
};

interface ContactFormProps {
  isRealEstate?: boolean;
  /** When "full", shows the complete contact form (Title, country code, Privacy, Newsletter, etc.) as on the contact page. */
  variant?: 'simple' | 'full';
  /** Agent shown on the simple real-estate card (real-estate property detail uses Diana). */
  realEstateAgent?: 'olga' | 'diana';
}

export const ContactForm = ({ isRealEstate = false, variant = 'simple', realEstateAgent = 'olga' }: ContactFormProps) => {
  const defaultInquiryType = isRealEstate ? 'REAL_ESTATE' : 'VILLA_RENTALS';
  const { user, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors }, watch, reset, getValues } = useForm<FullFormData>({
    defaultValues: {
      inquiryType: defaultInquiryType,
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      countryCode: '',
      note: '',
      travelDates: '',
      requestQuote: false,
      privacyPolicy: false,
      newsletter: false,
    },
  });
  const requestQuote = watch('requestQuote');
  const [isSubmittingState, setIsSubmittingState] = useState(false);

  useEffect(() => {
    if (variant !== 'full' || !isAuthenticated || !user) return;
    const phone = (user.phoneNumber || '').trim();
    let countryCode = '';
    let phoneNumber = phone.replace(/\s/g, '');
    const codeMatch = phone.match(/^(\+\d{1,4})/);
    if (codeMatch) {
      countryCode = codeMatch[1];
      phoneNumber = phone.replace(codeMatch[1], '').replace(/\s/g, '');
    }
    reset({
      inquiryType: getValues('inquiryType') || defaultInquiryType,
      salutation: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber,
      countryCode,
      note: '',
      travelDates: '',
      requestQuote: false,
      privacyPolicy: false,
      newsletter: false,
    });
  }, [variant, isAuthenticated, user, reset, getValues, defaultInquiryType]);

  /** Simple card (Diana / real-estate widget): thank-you view only stays a few seconds. */
  useEffect(() => {
    if (variant !== 'simple' || !submitted) return;
    const t = setTimeout(() => setSubmitted(false), 4500);
    return () => clearTimeout(t);
  }, [variant, submitted]);

  const onFullSubmit = async (data: FullFormData) => {
    setSubmitError(null);
    setIsSubmittingState(true);
    try {
      const phone = data.countryCode && data.phoneNumber
        ? `${data.countryCode}${data.phoneNumber.replace(/\s/g, '')}`
        : data.phoneNumber;
      const payload = {
        inquiryType: data.inquiryType,
        salutation: data.salutation || undefined,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: phone || undefined,
        message: data.note || undefined,
        travelDates: data.requestQuote ? data.travelDates : undefined,
        requestQuote: data.requestQuote,
        newsletter: data.newsletter,
      };
      const res = await mutateAPI('contact', 'POST', payload);
      if (res?.success !== false) {
        trackContactFormSubmit();
        setSubmitted(true);
      } else {
        setSubmitError(res?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Failed to send your request. Please try again.');
    } finally {
      setIsSubmittingState(false);
    }
  };

  if (variant === 'full') {
    return (
      <div className="w-full max-w-md mx-auto bg-white p-6 md:p-8 shadow-lg text-left relative">
        {submitted ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#333333]">Speak to an Expert</h2>
            <p className="text-[#506A70] font-haas">
              Thank you for your interest. We have received your request and will contact you within the next 24 hours.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Speak to an Expert</h2>
            <form onSubmit={handleSubmit(onFullSubmit)} className="flex flex-col gap-6">
              <div>
                <Label mandatory label="Type" />
                <select
                  className="w-full h-10 rounded-none border border-[#506A70] px-3 font-haas bg-white"
                  {...register('inquiryType', { required: 'Type is required' })}
                >
                  {CONTACT_INQUIRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.inquiryType && <span className="text-red-500 text-sm">{errors.inquiryType?.message}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label label="Title" mandatory={false} />
                  <select
                    className="w-full h-10 rounded-none border border-[#506A70] px-3 font-haas bg-white"
                    {...register('salutation')}
                  >
                    {TITLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label mandatory label="First Name" />
                  <Input
                    className="w-full h-10 rounded-none border-[#506A70]"
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName?.message}</span>}
                </div>
                <div>
                  <Label mandatory label="Last Name" />
                  <Input
                    className="w-full h-10 rounded-none border-[#506A70]"
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName?.message}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <Label mandatory label="Code" />
                  <select
                    className="w-full h-10 rounded-none border border-[#506A70] px-2 font-haas bg-white"
                    {...register('countryCode', { required: 'Country code is required' })}
                  >
                    <option value="">Code</option>
                    {COUNTRY_CODES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.countryCode && <span className="text-red-500 text-sm">{errors.countryCode?.message}</span>}
                </div>
                <div className="flex-1">
                  <Label mandatory label="Phone Number" />
                  <Input
                    className="w-full h-10 rounded-none border-[#506A70]"
                    type="tel"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                  />
                  {errors.phoneNumber && <span className="text-red-500 text-sm">{errors.phoneNumber?.message}</span>}
                </div>
              </div>
              <div>
                <Label mandatory label="Email" />
                <Input
                  className="w-full h-10 rounded-none border-[#506A70]"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email?.message}</span>}
              </div>
              <div>
                <Label label="Add a note" mandatory={false} />
                <Input
                  className="w-full h-10 rounded-none border-[#506A70]"
                  type="text"
                  {...register('note')}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <Controller
                    name="requestQuote"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="w-5 h-5 border-[#506A70] data-[state=checked]:bg-soft-gray-dark"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="text-[#506A70] font-haas text-sm">Request a quote</span>
                </div>
                {requestQuote && (
                  <div className="ml-7">
                    <Label label="Travel Dates" mandatory={false} />
                    <Input
                      className="w-full h-10 rounded-none border-[#506A70]"
                      type="text"
                      placeholder="e.g. June 15-22, 2025"
                      {...register('travelDates')}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <Controller
                    name="privacyPolicy"
                    control={control}
                    rules={{ required: 'You must accept the Privacy Policy' }}
                    render={({ field }) => (
                      <Checkbox
                        id="privacyPolicyPage"
                        className="w-5 h-5 border-[#506A70] data-[state=checked]:bg-soft-gray-dark"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label htmlFor="privacyPolicyPage" className="text-[#506A70] font-haas text-sm">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="font-bold underline hover:opacity-80"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
                {errors.privacyPolicy && <span className="text-red-500 text-sm">{errors.privacyPolicy?.message}</span>}
                <div className="flex gap-2 items-center">
                  <Controller
                    name="newsletter"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="w-5 h-5 border-[#506A70] data-[state=checked]:bg-soft-gray-dark"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="text-[#506A70] font-haas text-sm">I want to receive News &amp; Updates from Kennedy&apos;s Group</span>
                </div>
              </div>
              {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
              <button
                type="submit"
                disabled={isSubmittingState}
                className="bg-[#172338] text-white w-full h-11 disabled:opacity-70 font-medium"
              >
                {isSubmittingState ? 'Sending...' : 'Send your request'}
              </button>
            </form>
          </>
        )}

        {showPrivacyModal && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div
              className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto rounded shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-xl font-semibold text-[#333333]">Privacy Policy</h2>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-800 shrink-0"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="text-sm text-[#506A70] space-y-3">
                <p>Kennedy&apos;s Group respects your privacy. By submitting this form, you consent to the collection and use of your contact details so we can respond to your request and, if you have opted in, send you news and updates.</p>
                <p>We do not share your data with third parties for marketing purposes. For the full privacy policy, please contact us at concierge@kennedysgroup.com.</p>
              </div>
              <button
                type="button"
                className="mt-6 w-full h-10 bg-[#172338] text-white"
                onClick={() => setShowPrivacyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const useDiana = isRealEstate && realEstateAgent === 'diana';
  const contactName = useDiana ? 'Diana' : 'Olga';
  const contactImage = useDiana ? '/images/dianaImage.jpg' : OlgaImage.src;
  const contactEmail = useDiana ? 'realestate@kennedysgroup.com' : 'olga@kennedysgroup.com';
  const contactPhone = useDiana ? '+30 697 813 7391' : '+30 697 215 2778';

  const onSimpleCardSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget;
    const nameRaw =
      (form.elements.namedItem('re-contact-name') as HTMLInputElement | null)?.value?.trim() ?? '';
    const emailVal =
      (form.elements.namedItem('re-contact-email') as HTMLInputElement | null)?.value?.trim() ?? '';
    const countryCodeVal =
      (form.elements.namedItem('re-contact-country-code') as HTMLSelectElement | null)?.value?.trim() ?? '';
    const mobileVal =
      (form.elements.namedItem('re-contact-mobile') as HTMLInputElement | null)?.value?.trim() ?? '';
    const messageVal =
      (form.elements.namedItem('re-contact-message') as HTMLTextAreaElement | null)?.value?.trim() ?? '';

    if (!emailVal) {
      setSubmitError('Email is required.');
      return;
    }
    if (mobileVal && !countryCodeVal) {
      setSubmitError('Please select a country code.');
      return;
    }
    const parts = nameRaw.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    if (!firstName && !lastName) {
      setSubmitError('Please enter your name.');
      return;
    }

    const rawMobile = mobileVal.replace(/\s/g, '');
    const phone = rawMobile ? `${countryCodeVal}${rawMobile}` : undefined;
    const defaultMsg = isRealEstate
      ? `Real estate inquiry via ${contactName} contact card on the website.`
      : `Website contact — ${contactName} widget.`;
    const message = messageVal || defaultMsg;

    setIsSubmittingState(true);
    try {
      const inquiryType = isRealEstate ? 'REAL_ESTATE' : 'VILLA_RENTALS';
      const payload = {
        inquiryType,
        firstName,
        lastName,
        email: emailVal,
        phone,
        message,
        requestQuote: false,
        newsletter: false,
      };
      const res = await mutateAPI('contact', 'POST', payload);
      if (res?.success !== false) {
        trackContactFormSubmit();
        setSubmitted(true);
        form.reset();
      } else {
        setSubmitError(res?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Failed to send your request. Please try again.');
    } finally {
      setIsSubmittingState(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-[26rem] mx-auto rounded-none bg-white px-6 py-6 text-center border border-[#E2E8EB]">
        <h2 className="font-gtsuper-ds text-base md:text-lg font-light uppercase tracking-[0.14em] text-[#172338] mb-3">
          Thank you
        </h2>
        <p className="text-left font-haas text-sm font-light text-[#506A70] leading-relaxed">
          We have received your request and will contact you within the next 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[26rem] mx-auto rounded-none bg-white px-6 py-6 text-center border border-[#E2E8EB]">
      <div className="mx-auto mb-3 flex justify-center">
        <img
          src={contactImage}
          alt=""
          className="h-20 w-20 rounded-full object-cover shadow-[0_8px_24px_rgba(23,35,56,0.12)] ring-[3px] ring-white"
        />
      </div>
      <h2 className="font-gtsuper-ds text-base md:text-lg font-light uppercase tracking-[0.14em] text-[#172338] mb-3">
        Contact {contactName}
      </h2>
      <div className="mb-4 space-y-2 text-left">
        <a
          href={`mailto:${contactEmail}`}
          className="group flex items-start gap-2.5 text-sm font-haas font-light text-[#2D4A5A] transition-colors hover:text-[#172338]"
        >
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#48A4B4]" strokeWidth={1.75} aria-hidden />
          <span className="break-all underline decoration-[#506A70]/35 underline-offset-[3px] group-hover:decoration-[#172338]/50">
            {contactEmail}
          </span>
        </a>
        <a
          href={`tel:${contactPhone.replace(/\s/g, '')}`}
          className="group flex items-center gap-2.5 text-sm font-haas font-light text-[#2D4A5A] transition-colors hover:text-[#172338]"
        >
          <Phone className="h-4 w-4 shrink-0 text-[#48A4B4]" strokeWidth={1.75} aria-hidden />
          <span className="underline decoration-[#506A70]/35 underline-offset-[3px] group-hover:decoration-[#172338]/50">
            {contactPhone}
          </span>
        </a>
      </div>
      <p className="mb-4 px-0.5 text-[10px] font-haas font-normal uppercase leading-snug tracking-[0.18em] text-[#506A70] md:text-[11px]">
        Or leave your details — she will reach out to you.
      </p>
      <form className="space-y-2 text-left" onSubmit={onSimpleCardSubmit} noValidate>
        <label
          htmlFor="re-contact-name"
          className="flex w-full min-h-[40px] cursor-text border border-[#506A70] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#172338]/20 focus-within:ring-inset"
        >
          <span className="flex min-w-[5.75rem] shrink-0 items-center border-r border-[#506A70] bg-white px-3 py-2 font-haas text-sm font-normal text-[#172338]">
            Name:
          </span>
          <input
            id="re-contact-name"
            type="text"
            name="re-contact-name"
            autoComplete="name"
            placeholder="First and last name"
            className="min-w-0 flex-1 border-0 bg-white px-3 py-2 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
          />
        </label>
        <div className="flex w-full min-h-[40px] border border-[#506A70] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#172338]/20 focus-within:ring-inset">
          <span className="flex min-w-[4rem] shrink-0 items-center border-r border-[#506A70] bg-white px-3 py-2 font-haas text-sm font-normal text-[#172338]">
            Mobile:
          </span>
          <select
            id="re-contact-country-code"
            name="re-contact-country-code"
            defaultValue=""
            className="w-20 shrink-0 border-0 border-r border-[#506A70] bg-white px-2 py-2 font-haas text-sm font-light text-[#172338] focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="">Code</option>
            {COUNTRY_CODES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.value}</option>
            ))}
          </select>
          <input
            id="re-contact-mobile"
            type="tel"
            name="re-contact-mobile"
            autoComplete="tel"
            placeholder="Phone number"
            className="min-w-0 flex-1 border-0 bg-white px-3 py-2 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
          />
        </div>
        <label
          htmlFor="re-contact-email"
          className="flex w-full min-h-[40px] cursor-text border border-[#506A70] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#172338]/20 focus-within:ring-inset"
        >
          <span className="flex min-w-[5.75rem] shrink-0 items-center border-r border-[#506A70] bg-white px-3 py-2 font-haas text-sm font-normal text-[#172338]">
            Email:
          </span>
          <input
            id="re-contact-email"
            type="email"
            name="re-contact-email"
            autoComplete="email"
            placeholder="email@mail.com"
            className="min-w-0 flex-1 border-0 bg-white px-3 py-2 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
          />
        </label>
        <label
          htmlFor="re-contact-message"
          className="flex w-full cursor-text border border-[#506A70] bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#172338]/20 focus-within:ring-inset"
        >
          <span className="flex min-w-[5.75rem] shrink-0 items-start border-r border-[#506A70] bg-white px-3 pt-2 pb-2 font-haas text-sm font-normal text-[#172338]">
            Message:
          </span>
          <textarea
            id="re-contact-message"
            name="re-contact-message"
            rows={3}
            placeholder="How can we help you?"
            className="min-w-0 flex-1 border-0 bg-white px-3 py-2 font-haas text-sm font-light text-[#172338] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0 resize-none"
          />
        </label>
        {submitError && <p className="text-red-600 text-xs font-haas">{submitError}</p>}
        <button
          type="submit"
          disabled={isSubmittingState}
          className="w-full border-0 bg-[#28F7EA] py-3 text-center font-haas text-sm font-normal text-[#172338] transition hover:bg-[#1fe8dc] disabled:opacity-60"
        >
          {isSubmittingState ? 'Sending...' : 'Contact'}
        </button>
      </form>
    </div>
  );
};

// ContactModal component that accepts isOpen and onClose props
export const ContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};
