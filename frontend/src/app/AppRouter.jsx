import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from '../features/auth/RouteGuards'
import { AuthShell } from '../features/auth/AuthShell'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { UiSandboxPage } from '../features/dev/UiSandboxPage'
import { LandingPage } from '../features/marketing/LandingPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        element={
          <GuestRoute>
            <AuthShell />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="/ui" element={<UiSandboxPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
