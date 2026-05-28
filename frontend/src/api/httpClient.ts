const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  token?: string
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
