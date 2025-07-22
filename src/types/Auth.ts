export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refresh_token: string
}

export interface User {
  id: number
  email: string
  roles: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthError {
  message: string
  code?: string
}