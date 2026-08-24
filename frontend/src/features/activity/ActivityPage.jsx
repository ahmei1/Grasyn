/**
 * Workspace-wide activity feed — the "what happened while I was away" view.
 *
 * Read: GET /workspaces/:workspaceId/activity   (paginated, newest first)
 *
 * Events arrive as { type, actor, payload, createdAt }. Write one function
 * that turns an event into a sentence and keep it out of the component, so
 * every feed in the app phrases things the same way.
 */
export function ActivityPage() {
  return <h1 className="text-h2 font-semibold">Activity</h1>
}
