import { httpClient } from './httpClient'

export type GuestResponse = {
  id: number
  firstName: string | null
  lastName: string | null
  email: string | null
  rsvpStatus: string | null
}

export type GuestRequest = {
  firstName: string
  lastName: string
  email: string
  rsvpStatus: string
}

type GuestRequestOptions = {
  token: string
}

export function getGuests(eventId: number, options: GuestRequestOptions) {
  return httpClient<GuestResponse[]>(`/api/events/${eventId}/guests`, {
    token: options.token,
  })
}

export function createGuest(eventId: number, request: GuestRequest, options: GuestRequestOptions) {
  return httpClient<GuestResponse>(`/api/events/${eventId}/guests`, {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function updateGuest(eventId: number, guestId: number, request: GuestRequest, options: GuestRequestOptions) {
  return httpClient<GuestResponse>(`/api/events/${eventId}/guests/${guestId}`, {
    method: 'PUT',
    body: request,
    token: options.token,
  })
}

export function deleteGuest(eventId: number, guestId: number, options: GuestRequestOptions) {
  return httpClient<void>(`/api/events/${eventId}/guests/${guestId}`, {
    method: 'DELETE',
    token: options.token,
  })
}
