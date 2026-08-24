import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../../shared/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  // The session lives in an httpOnly cookie the JS cannot read, so on every
  // page load we ask the API who we are.
  useEffect(() => {
    let active = true

    api
      .get('/auth/me')
      .then((data) => {
        if (!active) return
        setUser(data.user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',

      async login({ email, password }) {
        const data = await api.post('/auth/login', { email, password })
        setUser(data.user)
        setStatus('authenticated')
        return data.user
      },

      async register({ name, email, password }) {
        const data = await api.post('/auth/register', { name, email, password })
        setUser(data.user)
        setStatus('authenticated')
        return data.user
      },

      async logout() {
        await api.post('/auth/logout')
        setUser(null)
        setStatus('anonymous')
      },
    }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
