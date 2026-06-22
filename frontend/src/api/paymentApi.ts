import { httpClient } from './httpClient'

export type PaymentStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'PENDING'
  | 'CANCELLED'
  | 'OFFLINE'
  | 'OFFLINE_APPROVED'

export type PaymentMethod = 'ONLINE' | 'OFFLINE'

export type PaymentResponse = {
  id: number
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  vendorId: number | null
  expenseId: number | null
  eventId: number | null
  taskId: number | null
  gatewayPaymentId: string | null
  failureReason: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentSummaryResponse = {
  totalAmount: number
  successAmount: number
  pendingAmount: number
  failedAmount: number
  cancelledAmount: number
  offlineAmount: number
  offlineApprovedAmount: number
}

export type CreatePaymentRequest = {
  amount: number
  currency?: string
  method: PaymentMethod
  vendorId?: number
  expenseId?: number
  eventId?: number
  taskId?: number
}

export type ConfirmOnlinePaymentRequest = Record<string, unknown>
export type CancelPaymentRequest = Record<string, unknown>
export type OfflineApprovePaymentRequest = Record<string, unknown>

type PaymentRequestOptions = {
  token?: string
}

export function getPayments(options: PaymentRequestOptions & { eventId?: number } = {}) {
  const query = options.eventId ? `?eventId=${options.eventId}` : ''
  return httpClient<PaymentResponse[]>(`/api/payments${query}`, {
    token: options.token,
  })
}

export function getPaymentSummary(options: PaymentRequestOptions & { eventId?: number } = {}) {
  const query = options.eventId ? `?eventId=${options.eventId}` : ''
  return httpClient<PaymentSummaryResponse>(`/api/payments/summary${query}`, {
    token: options.token,
  })
}

export function createPayment(request: CreatePaymentRequest, options: PaymentRequestOptions = {}) {
  return httpClient<PaymentResponse>('/api/payments', {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function confirmOnlinePayment(
  id: number,
  request: ConfirmOnlinePaymentRequest,
  options: PaymentRequestOptions = {},
) {
  return httpClient<PaymentResponse>(`/api/payments/${id}/confirm-online`, {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function cancelPayment(
  id: number,
  request: CancelPaymentRequest = {},
  options: PaymentRequestOptions = {},
) {
  return httpClient<PaymentResponse>(`/api/payments/${id}/cancel`, {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function retryPayment(id: number, options: PaymentRequestOptions = {}) {
  return httpClient<PaymentResponse>(`/api/payments/${id}/retry`, {
    method: 'POST',
    token: options.token,
  })
}

export function approveOfflinePayment(
  id: number,
  request: OfflineApprovePaymentRequest = {},
  options: PaymentRequestOptions = {},
) {
  return httpClient<PaymentResponse>(`/api/payments/${id}/offline-approve`, {
    method: 'POST',
    body: request,
    token: options.token,
  })
}
