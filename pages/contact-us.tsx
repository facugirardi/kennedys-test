import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm, Controller } from 'react-hook-form'
import { X } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { CountryCodeDropdown } from '@/components/custom/CountryCodeDropdown'
import { Checkbox } from '@/components/ui/checkbox'
import { mutateAPI } from '@/lib/api/fetcher'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage } from '@/lib/pageHeroBanner'
import { useAuth } from '@/src/contexts/AuthContext'
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME, getSiteUrl } from '@/lib/seo/config'
import type { ContactInquiryType } from '@/lib/contactInquiryTypes'
import { CONTACT_INQUIRY_OPTIONS, isContactInquiryType } from '@/lib/contactInquiryTypes'
import { COUNTRY_DIAL_OPTIONS, splitPhoneByDialCode } from '@/lib/countryDialCodes'
import type { GetServerSideProps } from 'next'

const TITLE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' },
]

const OFFICES = [
  {
    label: 'Athens Office',
    address: 'Dimarchou Aggelou Metaxa 31, 166 75, Glyfada, Greece',
    phone: '+30 210 008 7226',
    whatsapp: 'https://wa.me/302100087226',
  },
  {
    label: 'Mykonos Office',
    address: 'Argirena, 846 00, Mykonos, Greece',
    phone: '+30 2289 028 233',
    whatsapp: 'https://wa.me/302289028233',
  },
]

const CONTACT_EMAIL = 'reservations@kennedysgroup.com'

/** Keep in sync with CONTACT_INQUIRY_TYPE_EMAIL in patches/kennedys-api-emailService.ts */
const CONTACT_INQUIRY_TYPE_EMAIL: Record<string, string> = {
  VILLA_RENTALS: 'reservations@kennedysgroup.com',
  PROPERTY_MANAGEMENT: 'partnerships@kennedysgroup.com',
  CONCIERGE: 'concierge@kennedysgroup.com',
  EVENTS: 'events@kennedysgroup.com',
  REAL_ESTATE: 'realestate@kennedysgroup.com',
  MARKETING: 'marketing@kennedysgroup.com',
};

/**
 * The `propertyImage` query param is attacker-controllable (anyone can craft a
 * `/contact-us?propertyImage=...` link). Only render it as an <img src> when it
 * points at our own site or our media API — otherwise a crafted link could make
 * this trusted page display arbitrary third-party content (content spoofing).
 */
function isTrustedPropertyImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url, getSiteUrl() || 'https://kennedysgroup.com');
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const allowedHosts = new Set<string>();
    const siteUrl = getSiteUrl();
    if (siteUrl) {
      try { allowedHosts.add(new URL(siteUrl).host); } catch { /* ignore */ }
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try { allowedHosts.add(new URL(apiUrl).host); } catch { /* ignore */ }
    }
    return allowedHosts.has(parsed.host);
  } catch {
    return false;
  }
}

type FormData = {
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
  interests: string[];
  privacyPolicy: boolean;
  newsletter: boolean;
};

const REAL_ESTATE_INTEREST_OPTIONS = [
  { value: 'contacted', label: 'To be contacted' },
  { value: 'visit', label: 'To visit' },
  { value: 'photos', label: 'More photos' },
  { value: 'info', label: 'More information' },
] as const;

const INPUT_CLASS =
  'w-full h-12 rounded-none border border-[#172338]/20 bg-white px-4 font-haas font-light text-[15px] text-[#172338] placeholder:text-[#172338]/35 transition-colors focus:border-[#172338] focus:outline-none'

function FieldLabel({ children, required = false, htmlFor }: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className='mb-2 block font-haas text-[13px] font-light text-[#172338]'>
      {children}
      {required && <span className='text-[#D99330]'>&nbsp;*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className='mt-1.5 block font-haas text-xs text-red-500'>{message}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='font-gtsuper-ds text-[28px] font-light leading-tight text-[#172338] md:text-[32px]'>
      {children}
    </h2>
  );
}

const DEFAULT_HERO_TITLE = 'Contact us';
const DEFAULT_HERO_SUBTITLE = 'Questions about our villas, help with a booking, or curious about our concierge and real estate services? Our dedicated team is here to assist you.';

export const getServerSideProps: GetServerSideProps = async () => {
  const [pageRow, seoRow] = await Promise.all([
    fetchPageByKeyServer(PAGE_HERO_KEYS.contactUsHero),
    fetchPageByKeyServer("contact-us").catch(() => null),
  ]);
  const heroImageUrl = resolvePageHeroImage(PAGE_HERO_KEYS.contactUsHero, pageRow?.heroBannerPath);
  const heroTitle = pageRow?.heroTitle || DEFAULT_HERO_TITLE;
  const heroSubtitle = pageRow?.heroSubtitle || DEFAULT_HERO_SUBTITLE;
  const initialSeoMeta = {
    title: seoRow?.metaTitle || null,
    description: seoRow?.metaDescription || null,
    imageUrl: seoRow?.metaImageUrl || null,
  };
  return { props: { heroImageUrl, heroTitle, heroSubtitle, initialSeoMeta } };
};

const ContactUsPage = ({
  heroImageUrl,
  heroTitle,
  heroSubtitle,
  initialSeoMeta,
}: {
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
}) => {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const { user, isAuthenticated } = useAuth();
  const queryType = typeof router.query.type === 'string' ? router.query.type : '';
  const initialInquiryType: ContactInquiryType | null = isContactInquiryType(queryType) ? queryType : null;
  const propertyTitle = typeof router.query.propertyTitle === 'string' ? router.query.propertyTitle.slice(0, 200) : null;
  const propertyPrice = typeof router.query.propertyPrice === 'string' ? router.query.propertyPrice.slice(0, 50) : null;
  const rawPropertyImage = typeof router.query.propertyImage === 'string' ? router.query.propertyImage : null;
  const propertyImage = rawPropertyImage && isTrustedPropertyImageUrl(rawPropertyImage) ? rawPropertyImage : null;

  const { register, handleSubmit, control, formState: { errors }, watch, reset, getValues } = useForm<FormData>({
    defaultValues: {
      inquiryType: initialInquiryType ?? '',
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      countryCode: '',
      note: '',
      travelDates: '',
      requestQuote: false,
      interests: [],
      privacyPolicy: false,
      newsletter: false,
    },
  });
  const [currentStep, setCurrentStep] = useState<'contactInfo' | 'greetings'>('contactInfo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const requestQuote = watch('requestQuote');
  const inquiryType = watch('inquiryType');
  const contactEmail = CONTACT_INQUIRY_TYPE_EMAIL[inquiryType] || CONTACT_EMAIL;

  useEffect(() => {
    if (!router.isReady) return;
    reset((prev) => ({ ...prev, inquiryType: initialInquiryType ?? prev.inquiryType }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, initialInquiryType]);

  useEffect(() => {
    if (!router.isReady) return;
    if (initialInquiryType !== 'REAL_ESTATE' || !propertyTitle) return;
    const priceLine = propertyPrice ? ` — ${propertyPrice}` : '';
    reset((prev) => ({
      ...prev,
      note: prev.note || `Regarding: ${propertyTitle}${priceLine}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, initialInquiryType, propertyTitle, propertyPrice]);

  useEffect(() => {
    if (isAuthenticated && user && currentStep === 'contactInfo') {
      const { dial: countryCode, local: phoneNumber } = splitPhoneByDialCode(user.phoneNumber);
      reset((prev) => ({
        inquiryType: getValues('inquiryType') || initialInquiryType || '',
        salutation: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber,
        countryCode,
        note: prev.note,
        travelDates: '',
        requestQuote: false,
        interests: prev.interests,
        privacyPolicy: false,
        newsletter: false,
      }));
    }
  }, [isAuthenticated, user, reset, currentStep, getValues, initialInquiryType]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const phone = data.countryCode && data.phoneNumber
        ? `${data.countryCode}${data.phoneNumber.replace(/\s/g, '')}`
        : data.phoneNumber;
      const interestLabels = data.interests
        ?.map(v => REAL_ESTATE_INTEREST_OPTIONS.find(o => o.value === v)?.label)
        .filter(Boolean);
      const messageWithInterests = [
        data.note || '',
        interestLabels && interestLabels.length > 0 ? `Would like: ${interestLabels.join(', ')}` : '',
      ].filter(Boolean).join('\n\n');
      const payload = {
        inquiryType: data.inquiryType,
        salutation: data.salutation || undefined,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: phone || undefined,
        message: messageWithInterests || undefined,
        travelDates: data.requestQuote ? data.travelDates : undefined,
        requestQuote: data.requestQuote,
        newsletter: data.newsletter,
      };
      const res = await mutateAPI('contact', 'POST', payload);
      if (res?.success !== false) {
        setCurrentStep('greetings');
      } else {
        setSubmitError(res?.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitError('Failed to send your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAgentPortfolioSite) {
    return (
      <>
        <SeoHead
          title="Contact"
          description=""
          canonicalPath="/contact-us"
          suppressSiteBranding
        />
        <main className="flex min-h-screen items-center justify-center px-6">
          <p className="font-haas text-sm text-[#172338]/60">
            Contact is not available on this site.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={initialSeoMeta?.title || `Contact Us | ${SITE_NAME}`}
        description={initialSeoMeta?.description || "Speak to an expert about villa rentals, property management, concierge services, events, and real estate."}
        canonicalPath="/contact-us"
        imageUrl={initialSeoMeta?.imageUrl ?? undefined}
      />
      <div className='w-full'>
        <Navbar textBlack={true} />
      </div>

      <main className='w-full bg-white pt-[76px] md:pt-[125px]'>
        {/* ─── Cabecera ────────────────────────────────────────── */}
        <div className='mx-auto w-full max-w-[1250px] px-6 md:px-10'>
          <header className='pb-10 pt-12 md:pb-14 md:pt-16'>
            <h1 className='font-gtsuper-ds text-[40px] font-light leading-[1.05] text-[#172338] md:text-[56px]'>
              {heroTitle}
            </h1>
            <p className='mt-5 max-w-[560px] font-haas text-[15px] font-light leading-[1.7] text-[#506A70] md:text-[16px]'>
              {heroSubtitle}
            </p>
          </header>
        </div>

        {/* ─── Banda fotográfica ───────────────────────────────── */}
        <div className='relative h-[180px] w-full overflow-hidden bg-[#172338] md:h-[260px]'>
          <img
            src={heroImageUrl}
            alt=''
            className='absolute inset-0 h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-[#172338]/75 via-[#172338]/45 to-[#172338]/20' />
          <div className='relative z-10 mx-auto flex h-full w-full max-w-[1250px] flex-col justify-center px-6 md:px-10'>
            <p className='max-w-[520px] font-gtsuper-ds text-[24px] font-light leading-[1.2] text-white md:text-[32px]'>
              Your perfect stay begins with a conversation.
            </p>
          </div>
        </div>

        <div className='mx-auto w-full max-w-[1250px] px-6 md:px-10'>

          {/* ─── Call us ───────────────────────────────────────── */}
          <section className='grid grid-cols-1 gap-8 py-12 md:grid-cols-[minmax(240px,380px)_1fr] md:gap-16 md:py-16'>
            <SectionTitle>Call us</SectionTitle>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2'>
              {OFFICES.map(office => (
                <div key={office.label}>
                  <p className='mb-2 font-haas text-[11px] uppercase tracking-[0.22em] text-[#D99330]'>
                    {office.label}
                  </p>
                  <a
                    href={office.whatsapp}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-haas text-[17px] font-normal text-[#172338] transition-opacity hover:opacity-70'
                  >
                    {office.phone}
                  </a>
                  <p className='mt-2 font-haas text-[13px] font-light leading-relaxed text-[#506A70]'>
                    {office.address}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── By email ──────────────────────────────────────── */}
          <section className='grid grid-cols-1 gap-8 border-t border-[#D99330]/30 py-12 md:grid-cols-[minmax(240px,380px)_1fr] md:gap-16 md:py-16'>
            <div>
              <SectionTitle>By email</SectionTitle>
              <p className='mt-4 max-w-[300px] font-haas text-[14px] font-light leading-[1.7] text-[#506A70]'>
                Select a subject and fill out the form to contact us. We reply within 24 hours.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className='mt-4 block w-fit font-haas text-[14px] font-light text-[#172338] underline underline-offset-4 transition-opacity hover:opacity-70'
              >
                {contactEmail}
              </a>
            </div>

            <div className='w-full max-w-[640px]'>
              {currentStep === 'contactInfo' ? (
                <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col gap-6'>
                  {inquiryType === 'REAL_ESTATE' && propertyTitle && (
                    <div className='flex items-center gap-4 border border-[#172338]/15 bg-white p-3'>
                      {propertyImage && (
                        <div className='relative h-20 w-24 shrink-0 overflow-hidden bg-[#EEF2F6]'>
                          <img
                            src={propertyImage}
                            alt={propertyTitle}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      )}
                      <div className='min-w-0'>
                        <p className='font-haas text-[11px] uppercase tracking-[0.14em] text-[#506A70]'>Enquiring about</p>
                        <p className='mt-1 truncate font-gtsuper-ds text-lg font-light text-[#172338]'>{propertyTitle}</p>
                        {propertyPrice && (
                          <p className='mt-0.5 font-haas text-sm font-light text-[#D99330]'>{propertyPrice}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <FieldLabel required>How can we help you?</FieldLabel>
                    <Controller
                      name='inquiryType'
                      control={control}
                      rules={{ required: 'Please select a subject' }}
                      render={({ field }) => (
                        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                          {CONTACT_INQUIRY_OPTIONS.map(opt => {
                            const active = field.value === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type='button'
                                aria-pressed={active}
                                onClick={() => field.onChange(opt.value)}
                                className={`h-11 border px-2 font-haas text-[11px] uppercase tracking-[0.14em] transition-colors ${
                                  active
                                    ? 'border-[#172338] bg-[#172338] text-white'
                                    : 'border-[#172338]/25 bg-white text-[#506A70] hover:border-[#D99330] hover:text-[#172338]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    <FieldError message={errors.inquiryType?.message} />
                  </div>

                  <div>
                    <FieldLabel>Your request</FieldLabel>
                    <textarea
                      rows={5}
                      className='w-full resize-none rounded-none border border-[#172338]/20 bg-white px-4 py-3 font-haas font-light text-[15px] text-[#172338] placeholder:text-[#172338]/35 transition-colors focus:border-[#172338] focus:outline-none'
                      placeholder='Dates, destination, number of guests — anything that helps us help you.'
                      {...register('note')}
                    />
                  </div>

                  {inquiryType === 'REAL_ESTATE' && (
                    <div>
                      <FieldLabel>Would you like...</FieldLabel>
                      <Controller
                        name='interests'
                        control={control}
                        render={({ field }) => (
                          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                            {REAL_ESTATE_INTEREST_OPTIONS.map(opt => {
                              const active = field.value?.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  type='button'
                                  aria-pressed={active}
                                  onClick={() => {
                                    const current = field.value || [];
                                    field.onChange(
                                      active ? current.filter(v => v !== opt.value) : [...current, opt.value]
                                    );
                                  }}
                                  className={`h-11 border px-2 font-haas text-[11px] uppercase tracking-[0.14em] transition-colors ${
                                    active
                                      ? 'border-[#172338] bg-[#172338] text-white'
                                      : 'border-[#172338]/25 bg-white text-[#506A70] hover:border-[#D99330] hover:text-[#172338]'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                    </div>
                  )}

                  <div className='flex flex-col gap-4'>
                    <div className='flex items-center gap-3'>
                      <Controller
                        name='requestQuote'
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id='requestQuote'
                            className='h-5 w-5 rounded-none border-[#506A70] data-[state=checked]:bg-[#172338]'
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <label htmlFor='requestQuote' className='font-haas text-sm font-light text-[#506A70]'>
                        Request a quote
                      </label>
                    </div>
                    {requestQuote && (
                      <div className='ml-8'>
                        <FieldLabel htmlFor='travelDates'>Travel dates</FieldLabel>
                        <input
                          id='travelDates'
                          className={INPUT_CLASS}
                          type='text'
                          placeholder='e.g. June 15–22, 2026'
                          {...register('travelDates')}
                        />
                      </div>
                    )}
                  </div>

                  <p className='mt-4 font-haas text-[12px] font-normal uppercase tracking-[0.18em] text-[#172338]'>
                    How can we get back in touch with you?
                  </p>

                  <div className='grid grid-cols-1 gap-5 sm:grid-cols-[110px_1fr_1fr]'>
                    <div>
                      <FieldLabel>Title</FieldLabel>
                      <Controller
                        name='salutation'
                        control={control}
                        render={({ field }) => (
                          <CountryCodeDropdown
                            options={TITLE_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='—'
                          />
                        )}
                      />
                    </div>
                    <div>
                      <FieldLabel required>First name</FieldLabel>
                      <input
                        className={INPUT_CLASS}
                        type='text'
                        autoComplete='given-name'
                        {...register('firstName', { required: 'First name is required' })}
                      />
                      <FieldError message={errors.firstName?.message} />
                    </div>
                    <div>
                      <FieldLabel required>Last name</FieldLabel>
                      <input
                        className={INPUT_CLASS}
                        type='text'
                        autoComplete='family-name'
                        {...register('lastName', { required: 'Last name is required' })}
                      />
                      <FieldError message={errors.lastName?.message} />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>Email</FieldLabel>
                    <input
                      className={INPUT_CLASS}
                      type='email'
                      autoComplete='email'
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>

                  <div className='grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]'>
                    <div>
                      <FieldLabel required htmlFor='countryCode'>Country code</FieldLabel>
                      <Controller
                        name='countryCode'
                        control={control}
                        rules={{
                          required: 'Country code is required',
                          pattern: { value: /^\+\d{1,4}$/, message: 'Enter a valid country code' },
                        }}
                        render={({ field }) => (
                          <CountryCodeDropdown
                            options={COUNTRY_DIAL_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='Select country'
                          />
                        )}
                      />
                      <FieldError message={errors.countryCode?.message} />
                    </div>
                    <div>
                      <FieldLabel required>Mobile phone</FieldLabel>
                      <input
                        className={INPUT_CLASS}
                        type='tel'
                        autoComplete='tel-national'
                        {...register('phoneNumber', { required: 'Phone number is required' })}
                      />
                      <FieldError message={errors.phoneNumber?.message} />
                    </div>
                  </div>

                  <div className='flex flex-col gap-4'>
                    <div className='flex items-start gap-3'>
                      <Controller
                        name='privacyPolicy'
                        control={control}
                        rules={{ required: 'You must accept the Privacy Policy' }}
                        render={({ field }) => (
                          <Checkbox
                            id='privacyPolicy'
                            className='mt-0.5 h-5 w-5 rounded-none border-[#506A70] data-[state=checked]:bg-[#172338]'
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <label htmlFor='privacyPolicy' className='font-haas text-sm font-light leading-relaxed text-[#506A70]'>
                        I accept the{' '}
                        <button
                          type='button'
                          onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}
                          className='text-left font-normal text-[#172338] underline underline-offset-4 hover:opacity-70'
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                    <FieldError message={errors.privacyPolicy?.message} />

                    <div className='flex items-start gap-3'>
                      <Controller
                        name='newsletter'
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id='newsletter'
                            className='mt-0.5 h-5 w-5 rounded-none border-[#506A70] data-[state=checked]:bg-[#172338]'
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <label htmlFor='newsletter' className='font-haas text-sm font-light leading-relaxed text-[#506A70]'>
                        I want to receive News &amp; Updates from Kennedy&apos;s Group
                      </label>
                    </div>
                  </div>

                  {submitError && (
                    <p className='border border-red-200 bg-red-50 px-4 py-3 font-haas text-sm text-red-600'>
                      {submitError}
                    </p>
                  )}

                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='mt-2 h-12 w-full bg-[#172338] px-10 font-haas text-[12px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#D99330] disabled:pointer-events-none disabled:opacity-60 sm:w-fit'
                  >
                    {isSubmitting ? 'Sending…' : 'Send your request'}
                  </button>
                </form>
              ) : (
                <div className='flex flex-col'>
                  <p className='mb-5 font-haas text-[11px] uppercase tracking-[0.3em] text-[#D99330]'>
                    Request received
                  </p>
                  <h3 className='font-gtsuper-ds text-4xl font-light text-[#172338]'>
                    Thank you.
                  </h3>
                  <div className='mb-6 mt-7 h-[1.5px] w-16 bg-[#D99330]' />
                  <p className='max-w-[420px] font-haas text-[15px] font-light leading-[1.7] text-[#506A70]'>
                    Your request is with our team — expect a personal reply within the next 24 hours.
                  </p>
                  <button
                    type='button'
                    className='mt-10 h-12 w-full bg-[#172338] px-10 font-haas text-[12px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#D99330] sm:w-fit'
                    onClick={() => router.push('/')}
                  >
                    Back to home
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {showPrivacyModal && (
        <div
          className='fixed inset-0 z-[220] flex items-center justify-center bg-[#172338]/70 p-4'
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className='max-h-[85vh] w-full max-w-lg overflow-y-auto bg-white p-8 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-5 flex items-start justify-between gap-4'>
              <h2 className='font-gtsuper-ds text-2xl font-light text-[#172338]'>Privacy Policy</h2>
              <button
                type='button'
                onClick={() => setShowPrivacyModal(false)}
                className='shrink-0 text-[#506A70] transition-colors hover:text-[#172338]'
                aria-label='Close'
              >
                <X size={22} />
              </button>
            </div>
            <div className='space-y-3 font-haas text-sm font-light leading-relaxed text-[#506A70]'>
              <p>Kennedy&apos;s Group respects your privacy. By submitting this form, you consent to the collection and use of your contact details so we can respond to your request and, if you have opted in, send you news and updates.</p>
              <p>We do not share your data with third parties for marketing purposes. For the full privacy policy, please visit our website or contact us at {CONTACT_EMAIL}.</p>
            </div>
            <button
              type='button'
              className='mt-8 h-12 w-full bg-[#172338] font-haas text-[12px] uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#D99330]'
              onClick={() => setShowPrivacyModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer disableTravelSection={true} />
    </>
  );
};

export default ContactUsPage;
