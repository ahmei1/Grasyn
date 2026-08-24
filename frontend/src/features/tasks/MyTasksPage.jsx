/**
 * Everything assigned to me across the workspace.
 *
 * Read: GET /workspaces/:workspaceId/tasks?assigneeId=<me>&status=&priority=
 *
 * Filters belong in the URL via useSearchParams, not useState, so a filtered
 * view survives a refresh and can be shared as a link. Include the filter
 * values in the query key or TanStack Query will serve stale results.
 */
export function MyTasksPage() {
  return <h1 className="text-h2 font-semibold">My tasks</h1>
}
