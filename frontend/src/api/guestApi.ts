import { httpClient } from './httpClient'

export type GuestResponse = {
  id: number
  firstName: string | null
  lastName: string | null
  email: string | null
  rsvpStatus: string | null
}

type GuestRequestOptions = {
  token: string
}

export function getGuests(eventId: number, options: GuestRequestOptions) {
  return httpClient<GuestResponse[]>(`/api/events/${eventId}/guests`, {
    token: options.token,
  })
}
