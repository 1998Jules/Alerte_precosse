'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

const API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000'

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'utilisateur' | 'administrateur'
  groups: string[]
  permissions: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: Record<string, string | boolean>) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = window.localStorage.getItem('syslap_token')
    if (!savedToken) {
      setLoading(false)
      return
    }
    setToken(savedToken)
    fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Token ${savedToken}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session expirée')
        return response.json()
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        window.localStorage.removeItem('syslap_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Connexion impossible')
    window.localStorage.setItem('syslap_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (data: Record<string, string | boolean>) => {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) throw new Error(Object.values(result).flat().join(' ') || 'Inscription impossible')
    window.localStorage.setItem('syslap_token', result.token)
    setToken(result.token)
    setUser(result.user)
  }

  const logout = async () => {
    if (token) {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      }).catch(() => undefined)
    }
    window.localStorage.removeItem('syslap_token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'administrateur',
    hasPermission: (permission: string) => Boolean(user?.permissions?.includes(permission)),
  }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return context
}
