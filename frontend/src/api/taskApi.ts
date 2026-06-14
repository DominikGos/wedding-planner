import { httpClient } from './httpClient'

export type TaskType = 'CATERING' | 'DECORATION' | 'ENTERTAINMENT'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export type TaskResponse = {
  id: number
  type: TaskType
  name: string
  description: string | null
  dueDate: string | null
  status: TaskStatus
  priority: number | null
  pricePerGuest?: number | null
  numberOfGuests?: number | null
  mealType?: string | null
  theme?: string | null
  performerName?: string | null
  totalPrice?: number | null
}

export type TaskRequest = {
  type: TaskType
  name: string
  description: string
  dueDate: string | null
  priority: number
  pricePerGuest?: number
  numberOfGuests?: number
  mealType?: string
  theme?: string
  performerName?: string
  totalPrice?: number
}

type TaskRequestOptions = {
  token: string
}

export function getTasks(eventId: number, options: TaskRequestOptions) {
  return httpClient<TaskResponse[]>(`/api/events/${eventId}/tasks`, { token: options.token })
}

export function getTaskSchedule(eventId: number, options: TaskRequestOptions) {
  return httpClient<TaskResponse[]>(`/api/events/${eventId}/tasks/schedule`, { token: options.token })
}

export function createTask(eventId: number, request: TaskRequest, options: TaskRequestOptions) {
  return httpClient<TaskResponse>(`/api/events/${eventId}/tasks`, {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function updateTask(eventId: number, taskId: number, request: TaskRequest, options: TaskRequestOptions) {
  return httpClient<TaskResponse>(`/api/events/${eventId}/tasks/${taskId}`, {
    method: 'PUT',
    body: request,
    token: options.token,
  })
}

export function deleteTask(eventId: number, taskId: number, options: TaskRequestOptions) {
  return httpClient<void>(`/api/events/${eventId}/tasks/${taskId}`, {
    method: 'DELETE',
    token: options.token,
  })
}

export function updateTaskStatus(eventId: number, taskId: number, status: TaskStatus, options: TaskRequestOptions) {
  return httpClient<TaskResponse>(`/api/events/${eventId}/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: { status },
    token: options.token,
  })
}
