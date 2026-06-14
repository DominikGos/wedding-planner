import { httpClient } from './httpClient'

export type NotificationResponse = {
  id: number
  message: string
  isRead: boolean
  createdAt: string
}

type NotificationRequestOptions = {
  token: string
}

export function getNotifications(options: NotificationRequestOptions) {
  return httpClient<NotificationResponse[]>('/api/notifications', { token: options.token })
}

export function markNotificationAsRead(id: number, options: NotificationRequestOptions) {
  return httpClient<NotificationResponse>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    token: options.token,
  })
}
