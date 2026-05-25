const MOCK_EMAIL = 'admin@admin.com'
const MOCK_PASSWORD = 'admin'
const AUTH_KEY = 'brand_aid_auth'

export function login(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === MOCK_EMAIL && password === MOCK_PASSWORD) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: MOCK_EMAIL, loggedIn: true }))
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated(): boolean {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return false
    return JSON.parse(data).loggedIn === true
  } catch {
    return false
  }
}

export function getUser(): { email: string } | null {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return null
    return JSON.parse(data)
  } catch {
    return null
  }
}
