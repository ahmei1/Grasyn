const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

/**
 * Errors thrown by the API layer carry the backend's error contract:
 * { code, message } plus the HTTP status.
 */
export class ApiError extends Error {
  constructor({ message, code, status }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

// Refreshing on a 401 from these paths would either loop or hide a real
// "wrong credentials" answer from the user.
const SKIP_REFRESH = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
])

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

async function request(path, { method = 'GET', body } = {}, canRefresh = true) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError({
      message: 'Cannot reach the server. Is the API running?',
      code: 'NETWORK_ERROR',
      status: 0,
    })
  }

  if (response.status === 401 && canRefresh && !SKIP_REFRESH.has(path)) {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (refreshed.ok) {
      return request(path, { method, body }, false)
    }
  }

  const data = await parseBody(response)

  if (!response.ok) {
    throw new ApiError({
      message: data?.message ?? 'Something went wrong',
      code: data?.code ?? 'ERROR',
      status: response.status,
    })
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
