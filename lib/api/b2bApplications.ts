import { mutateAPI } from './fetcher'

/** Matches kennedys-api's B2BApplicationInput — the public submission shape for the
 * agent-portfolio "Request B2B Access" wizard (components/custom/B2BApplicationForm.tsx). */
export interface B2BApplicationPayload {
  firstName: string
  lastName: string
  jobTitle: string
  businessEmail: string
  phone: string

  companyName: string
  companyWebsite: string
  companyHqLocation: string
  companyType: string

  companyRegistrationNumber?: string
  professionalNetworks?: string
  otherAffiliations?: string

  clientTypes?: string
  clientsBasedLocation: string

  destinationsOfInterest?: string

  portalUserFullName: string
  portalUserPosition: string
  portalUserEmail: string
  needsAdditionalUsers: boolean
  additionalUserCount?: number

  wantsNewsUpdates: boolean
}

/** POST /b2b-applications — public, unauthenticated. Creates a pending application for review. */
export async function submitB2BApplication(payload: B2BApplicationPayload) {
  return mutateAPI('/b2b-applications', 'POST', payload)
}
