'use client';

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input1'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Label from '@/components/label'
import { CountryCodeDropdown } from '@/components/custom/CountryCodeDropdown'
import { COUNTRY_DIAL_OPTIONS, splitPhoneByDialCode } from '@/lib/countryDialCodes'
import { createProporsal } from '@/lib/api/proporsal'
import { mutateAPI } from '@/lib/api/fetcher'
import { useAuth } from '@/src/contexts/AuthContext'

/** YYYY-MM-DD en calendario local (evita desfase vs rangos al usar toISOString/UTC). */
const formatDateInputValue = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getCalendarDays = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  return days
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

type LeadType = 'sell-with-us' | 'villa-management'

interface OwnerLeadFormProps {
  leadType: LeadType
  className?: string
  title?: string
  description?: string
  /** Match the navbar Contact overlay form (Speak to an Expert): borders, typography, button — fields unchanged. */
  visualVariant?: 'default' | 'navbarContact'
}

interface OwnerLeadFormValues {
  firstName: string
  lastName: string
  email: string
  countryCode: string
  phone: string
  propertyName: string
  propertyLocation: string
  propertyUrl: string
  expectedPrice: string
  preferredStartDate: string
  preferredEndDate: string
  message: string
  acceptTerms: boolean
}

export const OwnerLeadForm = ({
  leadType,
  className = '',
  title,
  description,
  visualVariant = 'default',
}: OwnerLeadFormProps) => {
  const navContact = visualVariant === 'navbarContact'
  const { user } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const defaultValues = useMemo<OwnerLeadFormValues>(
    () => {
      const { dial: countryCode, local: phone } = splitPhoneByDialCode(user?.phoneNumber)
      return {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        countryCode,
        phone,
        propertyName: '',
        propertyLocation: '',
        propertyUrl: '',
        expectedPrice: '',
        preferredStartDate: '',
        preferredEndDate: '',
        message: '',
        acceptTerms: false,
      }
    },
    [user?.firstName, user?.lastName, user?.email, user?.phoneNumber],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OwnerLeadFormValues>({
    mode: 'onBlur',
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const preferredStart = watch('preferredStartDate')
  const preferredEnd = watch('preferredEndDate')

  const [startCalendarOpen, setStartCalendarOpen] = useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState(false)
  const [startCalendarMonth, setStartCalendarMonth] = useState(() => new Date())
  const [endCalendarMonth, setEndCalendarMonth] = useState(() => new Date())
  const startCalendarRef = useRef<HTMLDivElement | null>(null)
  const endCalendarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target as Node)) {
        setStartCalendarOpen(false)
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target as Node)) {
        setEndCalendarOpen(false)
      }
    }
    if (startCalendarOpen || endCalendarOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [startCalendarOpen, endCalendarOpen])

  const onSubmit = async (values: OwnerLeadFormValues) => {
    setSubmitError(null)
    setSubmitSuccess(null)

    const leadHeading =
      leadType === 'sell-with-us' ? 'Sell with us — owner lead' : 'Villa management — owner lead'

    const detailParts: string[] = [
      leadHeading,
      `Property: ${values.propertyName}`,
      `Location: ${values.propertyLocation}`,
    ]
    if (values.propertyUrl?.trim()) {
      detailParts.push(`Property URL: ${values.propertyUrl.trim()}`)
    }
    if (leadType !== 'sell-with-us' && values.expectedPrice?.trim()) {
      detailParts.push(`Expected price / monthly revenue: ${values.expectedPrice.trim()}`)
    }
    if (leadType !== 'sell-with-us' && values.preferredStartDate) {
      detailParts.push(`Preferred start: ${values.preferredStartDate}`)
    }
    if (leadType !== 'sell-with-us' && values.preferredEndDate) {
      detailParts.push(`Preferred end: ${values.preferredEndDate}`)
    }

    const messageForContact = [
      detailParts.join('\n'),
      values.message?.trim() ? `\nNotes:\n${values.message.trim()}` : '',
    ]
      .filter(Boolean)
      .join('')

    const rawPhone = values.phone.replace(/\s/g, '')
    const phone = rawPhone ? `${values.countryCode}${rawPhone}` : undefined

    try {
      const proposalRes = await createProporsal({
        leadType,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: phone ?? '',
        propertyName: values.propertyName,
        propertyLocation: values.propertyLocation,
        url: values.propertyUrl || null,
        price: values.expectedPrice ? Number(values.expectedPrice) : null,
        message: values.message,
        preferredStartDate: values.preferredStartDate || null,
        preferredEndDate: values.preferredEndDate || null,
        propertyids: [],
        discount: null,
      })

      if (
        proposalRes &&
        typeof proposalRes === 'object' &&
        'success' in proposalRes &&
        (proposalRes as { success: boolean }).success === false
      ) {
        setSubmitError(
          (proposalRes as { message?: string }).message ||
            'We could not submit your request. Please try again.',
        )
        return
      }

      const inquiryType = leadType === 'sell-with-us' ? 'MARKETING' : 'PROPERTY_MANAGEMENT'
      const contactRes = await mutateAPI('contact', 'POST', {
        inquiryType,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone,
        message: messageForContact,
        requestQuote: false,
        newsletter: false,
      })

      if (contactRes?.success === false) {
        setSubmitError(
          contactRes?.message ||
            'Your request was saved but we could not send the notification email. Please try again or contact us directly.',
        )
        return
      }

      setSubmitSuccess('Thank you! Our team will reach out shortly.')
      reset({
        ...defaultValues,
        acceptTerms: false,
      })
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message
      setSubmitError(apiMessage || 'We could not submit your request. Please try again.')
    }
  }

  const shellClass = navContact
    ? `w-full bg-white px-6 pt-8 pb-8 md:px-10 md:pt-10 md:pb-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] [&_.label1]:!font-haas ${className}`
    : `w-full bg-white border border-[#E3EBF5] p-6 md:p-8 [&_.label1]:!font-haas ${className}`

  const inputFieldClass = navContact
    ? 'w-full h-10 rounded-none border-[#506A70]'
    : 'h-11 rounded-none border-[#172338]'

  const countryCodeButtonClass = navContact
    ? 'h-10 rounded-none border border-[#506A70] bg-white focus:border-[#506A70]'
    : 'h-11 rounded-none border border-[#172338] bg-white focus:border-[#172338]'

  const textareaClass = navContact
    ? 'w-full rounded-none border-[#506A70] min-h-[120px] resize-none'
    : 'rounded-none border-[#172338] min-h-[120px] resize-none'

  const checkboxClass = navContact
    ? 'w-5 h-5 border-[#506A70] data-[state=checked]:bg-soft-gray-dark'
    : 'w-5 h-5 border-[#172338] data-[state=checked]:bg-[#172338]'

  const fieldErrorClass = navContact ? 'text-red-500 text-sm mt-1' : 'text-sm text-[#D04444] mt-1'

  return (
    <div className={shellClass}>
      {title && (
        <h3
          className={
            navContact
              ? 'text-2xl text-left text-[#333333] leading-6 mb-5 font-normal'
              : 'text-[#172338] text-xl md:text-2xl font-gtsuper-ds font-light mb-2'
          }
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={
            navContact
              ? 'text-soft-gray-dark font-haas font-light text-md'
              : 'text-sm md:text-base font-haas text-[#506A70] mb-6'
          }
        >
          {description}
        </p>
      )}

      <form className={navContact ? 'flex flex-col gap-5 mt-10' : 'flex flex-col gap-5'} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label label="First Name" mandatory />
            <Input
              {...register('firstName', { required: 'First name is required' })}
              className={inputFieldClass}
            />
            {errors.firstName && <p className={fieldErrorClass}>{errors.firstName.message}</p>}
          </div>
          <div>
            <Label label="Last Name" mandatory />
            <Input
              {...register('lastName', { required: 'Last name is required' })}
              className={inputFieldClass}
            />
            {errors.lastName && <p className={fieldErrorClass}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="w-full">
          <Label label="Email" mandatory />
          <Input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            className={inputFieldClass}
            type="email"
          />
          {errors.email && <p className={fieldErrorClass}>{errors.email.message}</p>}
        </div>

        <div className="w-full">
          <Label label="Phone" mandatory />
          <div className="flex gap-2">
            <div className="w-48 shrink-0">
              <Controller
                name="countryCode"
                control={control}
                rules={{ required: 'Country code is required' }}
                render={({ field }) => (
                  <CountryCodeDropdown
                    options={COUNTRY_DIAL_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select country"
                    buttonClassName={countryCodeButtonClass}
                  />
                )}
              />
            </div>
            <Input
              {...register('phone', { required: 'Phone number is required' })}
              className={`${inputFieldClass} flex-1`}
              type="tel"
            />
          </div>
          {errors.countryCode && <p className={fieldErrorClass}>{errors.countryCode.message}</p>}
          {errors.phone && <p className={fieldErrorClass}>{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label label="Property Name" mandatory />
            <Input
              {...register('propertyName', { required: 'Property name is required' })}
              className={inputFieldClass}
            />
            {errors.propertyName && <p className={fieldErrorClass}>{errors.propertyName.message}</p>}
          </div>
          <div>
            <Label label="Property Location" mandatory />
            <Input
              {...register('propertyLocation', { required: 'Property location is required' })}
              className={inputFieldClass}
            />
            {errors.propertyLocation && <p className={fieldErrorClass}>{errors.propertyLocation.message}</p>}
          </div>
        </div>

        <div className="w-full">
          <Label label="Property URL (optional)" />
          <Input
            {...register('propertyUrl')}
            className={inputFieldClass}
          />
        </div>

        {leadType !== 'sell-with-us' && (
          <div className="w-full">
            <Label label="Expected Price / Monthly Revenue" />
            <Input
              {...register('expectedPrice')}
              className={inputFieldClass}
            />
          </div>
        )}

        {leadType !== 'sell-with-us' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative" ref={startCalendarRef}>
              <Label label="Preferred Start Date" />
              <button
                type="button"
                onClick={() => { setEndCalendarOpen(false); setStartCalendarOpen((o) => !o) }}
                className={`${inputFieldClass} border w-full px-3 py-2 text-sm flex items-center justify-between gap-2 text-left bg-white`}
              >
                <span className="truncate">{preferredStart || ''}</span>
                <CalendarIcon size={14} className="text-[#506A70] shrink-0" />
              </button>
              {startCalendarOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-[#506A70] shadow-xl p-4 w-[280px] z-50">
                  <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => setStartCalendarMonth(new Date(startCalendarMonth.getFullYear(), startCalendarMonth.getMonth() - 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                      <ChevronRight size={16} className="text-[#172338] rotate-180" />
                    </button>
                    <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                      {startCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={() => setStartCalendarMonth(new Date(startCalendarMonth.getFullYear(), startCalendarMonth.getMonth() + 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                      <ChevronRight size={16} className="text-[#172338]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {getCalendarDays(startCalendarMonth.getFullYear(), startCalendarMonth.getMonth()).map((day, i) => {
                      if (!day) return <div key={`start-empty-${i}`} />
                      const dayStr = formatDateInputValue(day)
                      const disabled = preferredEnd ? dayStr > preferredEnd : false
                      const isSelected = preferredStart && isSameDay(day, new Date(preferredStart + 'T00:00:00'))
                      return (
                        <button
                          key={`start-day-${i}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => { setValue('preferredStartDate', dayStr); setStartCalendarOpen(false) }}
                          className={[
                            'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                            disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-[#EEF2F6] text-[#172338]',
                            isSelected ? '!bg-[#D99330] !text-white' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={endCalendarRef}>
              <Label label="Preferred End Date" />
              <button
                type="button"
                onClick={() => { setStartCalendarOpen(false); setEndCalendarOpen((o) => !o) }}
                className={`${inputFieldClass} border w-full px-3 py-2 text-sm flex items-center justify-between gap-2 text-left bg-white`}
              >
                <span className="truncate">{preferredEnd || ''}</span>
                <CalendarIcon size={14} className="text-[#506A70] shrink-0" />
              </button>
              {endCalendarOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-[#506A70] shadow-xl p-4 w-[280px] z-50">
                  <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => setEndCalendarMonth(new Date(endCalendarMonth.getFullYear(), endCalendarMonth.getMonth() - 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                      <ChevronRight size={16} className="text-[#172338] rotate-180" />
                    </button>
                    <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                      {endCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={() => setEndCalendarMonth(new Date(endCalendarMonth.getFullYear(), endCalendarMonth.getMonth() + 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                      <ChevronRight size={16} className="text-[#172338]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {getCalendarDays(endCalendarMonth.getFullYear(), endCalendarMonth.getMonth()).map((day, i) => {
                      if (!day) return <div key={`end-empty-${i}`} />
                      const dayStr = formatDateInputValue(day)
                      const disabled = preferredStart ? dayStr < preferredStart : false
                      const isSelected = preferredEnd && isSameDay(day, new Date(preferredEnd + 'T00:00:00'))
                      return (
                        <button
                          key={`end-day-${i}`}
                          type="button"
                          disabled={disabled}
                          onClick={() => { setValue('preferredEndDate', dayStr); setEndCalendarOpen(false) }}
                          className={[
                            'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                            disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-[#EEF2F6] text-[#172338]',
                            isSelected ? '!bg-[#D99330] !text-white' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <Label label="Tell us more about your property" />
          <Textarea
            {...register('message')}
            className={textareaClass}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            className={checkboxClass}
            {...register('acceptTerms', {
              required: 'You must accept the privacy policy to continue',
            })}
          />
          <label
            htmlFor="acceptTerms"
            className={
              navContact
                ? 'text-soft-gray-dark font-haas font-light text-md'
                : 'text-sm md:text-base font-haas text-[#506A70]'
            }
          >
            I accept the{' '}
            <a href="/privacy-policy" className="underline font-bold hover:opacity-80">
              privacy policy
            </a>{' '}
            and agree to be contacted about my submission.
          </label>
        </div>
        {errors.acceptTerms && <p className={fieldErrorClass}>{errors.acceptTerms.message}</p>}

        {submitError && (
          <p className={navContact ? 'text-red-500 text-sm' : 'text-sm text-[#D04444]'}>{submitError}</p>
        )}
        {submitSuccess && (
          <p
            className={
              navContact ? 'text-soft-gray-dark font-haas font-light text-md' : 'text-sm text-[#1F7D63]'
            }
          >
            {submitSuccess}
          </p>
        )}

        {navContact ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#172338] text-white w-full mt-4 py-3 disabled:opacity-70 font-haas"
          >
            {isSubmitting ? 'Sending...' : 'Send your request'}
          </button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 bg-[#172338] text-white rounded-none hover:bg-[#172338]/90"
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </Button>
        )}
      </form>
    </div>
  )
}

export default OwnerLeadForm
