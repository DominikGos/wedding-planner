import { httpClient } from './httpClient'
import type { PaymentMethod } from './paymentApi'

export type ExpenseResponse = {
  id: number
  taskId: number | null
  amount: number
  description: string | null
  category: string | null
  date: string | null
  status: string | null
  paymentId: number | null
  paymentMethod: PaymentMethod | null
}

type ExpenseRequestOptions = {
  token?: string
}

export function getExpenses(params: { eventId?: number; taskId?: number }, options: ExpenseRequestOptions = {}) {
  const queryParams = new URLSearchParams()
  if (params.eventId !== undefined) {
    queryParams.append('eventId', String(params.eventId))
  }
  if (params.taskId !== undefined) {
    queryParams.append('taskId', String(params.taskId))
  }
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
  return httpClient<ExpenseResponse[]>(`/api/expenses${query}`, {
    token: options.token,
  })
}
