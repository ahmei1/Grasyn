import { Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Logo } from '../../shared/ui/Logo'
import { AuthShowcase } from './AuthShowcase'

/**
 * Persistent chrome for /login and /register. The brand panel stays mounted
 * and slides with a CSS transform when the route changes, which is smoother
 * than remounting both pages through the View Transitions API.
 */
export function AuthShell() {
  const { pathname } = useLocation()
  const isRegister = pathname.startsWith('/register')

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div
        className={clsx(
          'auth-pane auth-pane-form',
          isRegister && 'auth-pane-swapped',
        )}
      >
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-6 py-12 sm:px-12">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <div key={pathname} className="auth-form-content">
            <Outlet />
          </div>
        </div>
      </div>

      <div
        className={clsx(
          'auth-pane auth-pane-showcase',
          isRegister && 'auth-pane-swapped',
        )}
      >
        <AuthShowcase />
      </div>
    </main>
  )
}
