/**
 * Notification inbox for the active workspace.
 *
 * Read:     GET   /workspaces/:workspaceId/notifications
 * Mark one: PATCH /notifications/:notificationId/read
 * Mark all: POST  /workspaces/:workspaceId/notifications/read-all
 *
 * The unread count in the app shell reads the same data, so invalidate this
 * query after every write and both places stay in sync for free.
 * Each row links to the task or project it refers to.
 */
export function NotificationsPage() {
  return <h1 className="text-h2 font-semibold">Notifications</h1>
}
