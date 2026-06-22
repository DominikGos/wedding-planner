const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  token?: string
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  let token = options.token
  if (!token && typeof window !== 'undefined') {
    token = window.localStorage.getItem('weddingPlannerToken') || undefined
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('weddingPlannerAuth')
      window.localStorage.removeItem('weddingPlannerToken')
      window.dispatchEvent(new Event('auth:unauthorized'))
      window.location.href = '/login?tab=login'
    }
    throw new Error('Session expired (401 Unauthorized)')
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
