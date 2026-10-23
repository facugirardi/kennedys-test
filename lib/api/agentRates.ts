import { fetchAPI } from './fetcher'

export interface AgentRateQuote {
  propertyId: string
  propertyTitle: string
  managedProperty: boolean
  checkIn: string
  checkOut: string
  nights: number
  pricedNights: number
  netOwnerTotal: number
  appliedPct: number
  isOverride: boolean
  netToAgentTotal: number
}

/** GET /agent-rates/quote — authenticated. Net to Agent total for a villa across a date range,
 * built up from Net to Owner + the applicable commission % (management fee, non-management
 * commission, or a villa-specific override — see kennedys-api's agentRateService.ts). */
export async function getAgentRateQuote(propertyId: string, checkIn: string, checkOut: string) {
  const params = new URLSearchParams({ propertyId, checkIn, checkOut })
  return fetchAPI(`/agent-rates/quote?${params.toString()}`)
}
