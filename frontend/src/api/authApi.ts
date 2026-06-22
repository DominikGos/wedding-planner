import { httpClient } from './httpClient'

export type AuthResponse = {
  token: string
  email: string
  role: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name: string
  role: string
}

export function loginLocal(request: LoginRequest) {
  return httpClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: request,
  })
}

export function registerLocal(request: RegisterRequest) {
  return httpClient<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: request,
  })
}
