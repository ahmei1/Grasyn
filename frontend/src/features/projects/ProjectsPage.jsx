/**
 * All projects in the active workspace.
 *
 * Read:   GET  /workspaces/:workspaceId/projects   (paginated)
 * Create: POST /workspaces/:workspaceId/projects   { name, description }
 *
 * Four render states, all of them required: loading skeleton, error with a
 * retry, empty state that invites the first project, and the grid itself.
 * Each card links to /app/projects/:projectId.
 */
export function ProjectsPage() {
  return <h1 className="text-h2 font-semibold">Projects</h1>
}
