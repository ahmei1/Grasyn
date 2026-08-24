import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../../shared/ui/Button'
import { Logo } from '../../shared/ui/Logo'
import { notify } from '../../shared/ui/notify'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      notify.success('Signed out.')
      navigate('/login', { replace: true })
    } catch (error) {
      notify.apiError(error)
    }
  }

  return (
    <div>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Logo className="h-7" />
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-h2 font-semibold">Signed in as {user?.name}</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {user?.email} · {user?.timezone}
        </p>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-h4 font-medium">The workspace shell goes here</h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            This placeholder proves the session survives a page reload. Replace
            it when you build the workspace dashboard.
          </p>
        </div>
      </main>
    </div>
  )
}
