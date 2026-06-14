import { httpClient } from './httpClient'

export type VendorResponse = {
  id: number
  companyName: string | null
  serviceType: string | null
  contact: string | null
  price: number | string | null
}

export type VendorRequest = {
  companyName: string
  serviceType: string
  contact: string
  price: number
}

type VendorRequestOptions = {
  token?: string
}

export function getVendors(options: VendorRequestOptions = {}) {
  return httpClient<VendorResponse[]>('/api/vendors', {
    token: options.token,
  })
}

export function createVendor(request: VendorRequest, options: VendorRequestOptions = {}) {
  return httpClient<VendorResponse>('/api/vendors', {
    method: 'POST',
    body: request,
    token: options.token,
  })
}

export function updateVendor(id: number, request: VendorRequest, options: VendorRequestOptions = {}) {
  return httpClient<VendorResponse>(`/api/vendors/${id}`, {
    method: 'PUT',
    body: request,
    token: options.token,
  })
}

export function deleteVendor(id: number, options: VendorRequestOptions = {}) {
  return httpClient<void>(`/api/vendors/${id}`, {
    method: 'DELETE',
    token: options.token,
  })
}
