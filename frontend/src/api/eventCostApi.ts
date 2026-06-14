import { httpClient } from './httpClient'
import type { TaskType } from './taskApi'

export type TaskCostItemResponse = {
  taskId: number
  taskName: string
  taskType: TaskType
  cost: number
}

export type EventCostSummaryResponse = {
  eventId: number
  tasks: TaskCostItemResponse[]
  totalCost: number
}

type EventCostRequestOptions = {
  token?: string
}

export function getEventCostSummary(eventId: number, options: EventCostRequestOptions = {}) {
  return httpClient<EventCostSummaryResponse>(`/api/events/${eventId}/cost-summary`, {
    token: options.token,
  })
}
