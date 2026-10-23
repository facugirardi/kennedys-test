import { mutateAPI } from './fetcher'

export async function createProporsal(payload) {
  return mutateAPI('/proporsal', 'POST', payload)
}
