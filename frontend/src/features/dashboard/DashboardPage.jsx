import { useAuth } from '../auth/AuthContext'

/**
 * Home of the signed-in app. Lives inside AppShell's <Outlet />.
 *
 * Next: fetch GET /workspaces/:workspaceId/dashboard once WorkspaceContext
 * exists, then show assigned tasks, recent projects, and activity.
 */
export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="font-display text-h2 font-semibold tracking-tight">
        Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
      </h1>
      <p className="mt-1 text-body-sm text-muted-foreground">
        {user?.email}
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-h4 font-medium">Dashboard</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          The shell is live. Next we wire WorkspaceContext, then load real
          dashboard data from the API.
        </p>
      </div>
    </div>
  )
}
