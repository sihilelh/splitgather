import { apiRequest, ApiError } from './client.js'

const TOKEN_KEY = 'auth_token'

function saveToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token)
    } else {
      window.localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export function getStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export class AuthError extends ApiError {
  constructor(message, status, data) {
    super(message, status, data)
    this.name = 'AuthError'
  }
}

export async function login({ email, password }) {
  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    const { token, user } = result || {}
    if (token) {
      saveToken(token)
    }
    return user || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AuthError(err.message, err.status, err.data)
    }
    throw err
  }
}

export async function register(payload) {
  try {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload,
    })

    const { token, user } = result || {}
    if (token) {
      saveToken(token)
    }
    return user || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AuthError(err.message, err.status, err.data)
    }
    throw err
  }
}

export async function getCurrentUser() {
  try {
    const result = await apiRequest('/auth/me', {
      method: 'GET',
    })
    // Extract user from response (API returns { success: true, user: {...} })
    return result.user || result || null
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      // token invalid/expired
      saveToken(null)
      throw new AuthError(err.message, err.status, err.data)
    }
    throw err
  }
}

export function logout() {
  saveToken(null)
}

