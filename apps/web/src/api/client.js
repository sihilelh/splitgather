// Simple API client wrapper for the web app
// - Prefixes all requests with http://localhost:4000/api
// - Attaches JSON headers
// - Adds Authorization header when a token exists in localStorage
// - Normalises error responses

const API_BASE = 'http://localhost:4000/api'

function getToken() {
  try {
    return window.localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const finalOptions = {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }

  let response
  try {
    response = await fetch(url, finalOptions)
  } catch (err) {
    throw new ApiError('Network error', 0, { originalError: err })
  }

  let data = null
  const contentType = response.headers.get('Content-Type') || ''
  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else {
    data = await response.text().catch(() => null)
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return data
}

