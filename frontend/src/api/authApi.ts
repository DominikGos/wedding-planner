import { httpClient } from './httpClient'

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  token: string
}

export function login(payload: LoginPayload) {
  return httpClient<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  })
}
