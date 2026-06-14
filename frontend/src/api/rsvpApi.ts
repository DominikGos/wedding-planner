import { httpClient } from './httpClient'

export type RsvpStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED'

export type PublicRsvpResponse = {
  eventName: string
  eventDate: string
  eventLocation: string | null
  guestName: string
  rsvpStatus: string
  allergies: string | null
  declineReason: string | null
  eventCode: string
  guestCode: string
}

export type FindRsvpRequest = {
  eventCode: string
  firstName: string
  lastName: string
}

export function findPublicRsvp(request: FindRsvpRequest) {
  return httpClient<PublicRsvpResponse>('/api/public/rsvp/find', {
    method: 'POST',
    body: request,
  })
}

export function getPublicRsvp(eventCode: string, guestCode: string) {
  return httpClient<PublicRsvpResponse>(`/api/public/rsvp/${eventCode}/${guestCode}`)
}

export function updatePublicRsvp(
  eventCode: string,
  guestCode: string,
  request: { rsvpStatus: RsvpStatus; allergies: string; declineReason: string | null },
) {
  return httpClient<PublicRsvpResponse>(`/api/public/rsvp/${eventCode}/${guestCode}`, {
    method: 'PATCH',
    body: request,
  })
}
