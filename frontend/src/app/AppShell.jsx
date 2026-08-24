import { Outlet } from 'react-router-dom'

/**
 * Persistent chrome around every signed-in page. Lives in app/ rather than
 * features/ because it belongs to no single feature.
 *
 * To build: sidebar nav (Dashboard, Projects, My tasks, Activity, Settings),
 * a workspace switcher, the notification bell with its unread count, the
 * user menu with sign out, and the Logo. Collapse the sidebar under md.
 *
 * Outlet is where the matched child route renders — it is the whole reason
 * this component can stay mounted while pages change.
 */
export function AppShell() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
