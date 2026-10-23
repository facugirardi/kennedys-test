'use client';

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input1'
import { Textarea } from '@/components/ui/textarea'
import Label from '@/components/label'
import { createProporsal } from '@/lib/api/proporsal'
import { Button } from '@/components/ui/button'

interface VillaInquiryFormProps {
  propertyId?: string
  propertyName?: string
  propertyLocation?: string
  initialStartDate?: string
  initialEndDate?: string
  onClose: () => void
}

type InquiryFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  guests: number | undefined
  preferredStartDate: string
  preferredEndDate: string
  message: string
}

export const VillaInquiryForm = ({ propertyId, propertyName, propertyLocation, initialStartDate, initialEndDate, onClose }: VillaInquiryFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch,
  } = useForm<InquiryFormValues>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      guests: undefined,
      preferredStartDate: initialStartDate || '',
      preferredEndDate: initialEndDate || '',
      message: '',
    },
  })

  useEffect(() => {
    reset({
      ...getValues(),
      preferredStartDate: initialStartDate || '',
      preferredEndDate: initialEndDate || '',
    })
  }, [initialStartDate, initialEndDate, reset, getValues])

  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const startDate = watch('preferredStartDate')
  const endDateMin = useMemo(() => (startDate ? startDate : undefined), [startDate])

  const onSubmit = async (values: InquiryFormValues) => {
    setSubmitMessage(null)
    setSubmitError(null)

    try {
      await createProporsal({
        leadType: 'villa-inquiry',
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        message: values.message,
        propertyids: propertyId ? [propertyId] : [],
        propertyName: propertyName ?? null,
        propertyLocation: propertyLocation ?? null,
        preferredStartDate: values.preferredStartDate || null,
        preferredEndDate: values.preferredEndDate || null,
      })

      setSubmitMessage('Thank you! Our reservations team will reach out shortly to craft your stay.')
      reset()
    } catch (error: any) {
      console.error('Villa inquiry submission failed', error)
      const apiMessage = error?.response?.data?.message
      setSubmitError(apiMessage || 'We could not submit your inquiry right now. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-xl bg-white p-6 md:p-10">
      <h2 className="text-2xl font-gtsuper-ds font-light text-[#172338]">Plan your stay</h2>
      <p className="mt-2 text-sm md:text-base font-haas text-[#506A70]">
        Share a few details and one of our travel specialists will contact you with tailored options for {propertyName || 'this villa'}.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label label="First Name" mandatory />
            <Input
              className="h-11 rounded-none border-[#172338]"
              {...register('firstName', { required: 'First name is required' })}
            />
            {errors.firstName && <p className="mt-1 text-sm text-[#D04444]">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label label="Last Name" mandatory />
            <Input
              className="h-11 rounded-none border-[#172338]"
              {...register('lastName', { required: 'Last name is required' })}
            />
            {errors.lastName && <p className="mt-1 text-sm text-[#D04444]">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label label="Email" mandatory />
            <Input
              className="h-11 rounded-none border-[#172338]"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-[#D04444]">{errors.email.message}</p>}
          </div>
          <div>
            <Label label="Phone" mandatory />
            <Input
              className="h-11 rounded-none border-[#172338]"
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="mt-1 text-sm text-[#D04444]">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label label="Guests" />
            <Input
              type="number"
              min={1}
              className="h-11 rounded-none border-[#172338]"
              {...register('guests', {
                valueAsNumber: true,
                min: { value: 1, message: 'Guests must be at least 1' },
              })}
            />
            {errors.guests && <p className="mt-1 text-sm text-[#D04444]">{errors.guests.message}</p>}
          </div>
          <div>
            <Label label="Check-in" />
            <Input
              type="date"
              className="h-11 rounded-none border-[#172338]"
              {...register('preferredStartDate')}
            />
          </div>
          <div>
            <Label label="Check-out" />
            <Input
              type="date"
              min={endDateMin}
              className="h-11 rounded-none border-[#172338]"
              {...register('preferredEndDate')}
            />
          </div>
        </div>

        <div>
          <Label label="Tell us about your stay" />
          <Textarea
            className="min-h-[120px] rounded-none border-[#172338]"
            placeholder="Share your travel dates, preferences, or special requests so we can personalize your stay."
            {...register('message')}
          />
        </div>

        {submitError && <p className="text-sm text-[#D04444]">{submitError}</p>}
        {submitMessage && <p className="text-sm text-[#1F7D63]">{submitMessage}</p>}

        <div className="mt-2 flex flex-col gap-3 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-none border-[#172338] text-[#172338]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 rounded-none bg-[#172338] text-white hover:bg-[#172338]/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit inquiry'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VillaInquiryForm
