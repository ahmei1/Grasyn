import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

function SessionLoading() {
  return (
    <div className="grid min-h-svh place-items-center text-body-sm text-muted-foreground">
      Loading…
    </div>
  )
}

/** Blocks a route until we know there is a signed-in user. */
export function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) return <SessionLoading />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

/** Keeps signed-in users out of the login and register screens. */
export function GuestRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <SessionLoading />
  if (isAuthenticated) return <Navigate to="/app" replace />
  return children
}
