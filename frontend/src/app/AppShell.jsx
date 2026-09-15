import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Activity,
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
} from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { Button } from '../shared/ui/Button'
import { Logo } from '../shared/ui/Logo'
import { notify } from '../shared/ui/notify'

const NAV = [
  { name: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
  { name: 'Projects', to: '/app/projects', icon: FolderKanban },
  { name: 'My tasks', to: '/app/tasks', icon: ListTodo },
  { name: 'Activity', to: '/app/activity', icon: Activity },
  { name: 'Notifications', to: '/app/notifications', icon: Bell },
  { name: 'Settings', to: '/app/settings/workspace', icon: Settings },
]

/**
 * Persistent chrome around every signed-in page. Lives in app/ rather than
 * features/ because it belongs to no single feature.
 *
 * Outlet is where the matched child route renders — it is the whole reason
 * this component can stay mounted while pages change.
 */
export function AppShell() {
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
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <NavLink
            to="/app"
            end
            className="inline-flex rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <Logo size="sm" />
          </NavLink>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'inline-flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm font-medium transition duration-200',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                  )
                }
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-3">
            <p className="truncate text-body-sm font-medium">{user?.name}</p>
            <p className="truncate text-caption text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
