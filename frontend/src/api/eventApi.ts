import { httpClient } from './httpClient'
import type { Wedding } from '../store/slices/authSlice'

export type EventResponse = {
  id: number
  name: string
  eventDate: string
  location: string | null
  status: string
}

export type CreateEventRequest = {
  name: string
  eventDate: string
  location: string
  status: 'PLANNED'
}

export type UpdateEventRequest = {
  name: string
  eventDate: string
  location: string
  status: string
}

type EventRequestOptions = {
  token?: string
}

export function toWedding(event: EventResponse): Wedding {
  return {
    id: event.id,
    name: event.name,
    date: event.eventDate?.split('T')[0] ?? '',
    venue: event.location ?? 'Nie określono',
    status: event.status,
  }
}

export function getEvents(options: EventRequestOptions = {}) {
  return httpClient<EventResponse[]>('/api/events', {
    token: options.token,
  })
}

export function createEvent(request: CreateEventRequest, options: EventRequestOptions = {}) {
  return httpClient<EventResponse>('/api/events', {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function getEvent(eventId: number, options: EventRequestOptions = {}) {
  return httpClient<EventResponse>(`/api/events/${eventId}`, {
    token: options.token,
  })
}

export function updateEvent(eventId: number, request: UpdateEventRequest, options: EventRequestOptions = {}) {
  return httpClient<EventResponse>(`/api/events/${eventId}`, {
    method: 'PUT',
    body: request,
    token: options.token,
  })
}
