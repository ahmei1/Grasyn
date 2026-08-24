/**
 * Members, roles, and invites for the active workspace.
 *
 * Read:   GET    /workspaces/:workspaceId/members
 * Invite: POST   /workspaces/:workspaceId/invites        { email, role }
 * Role:   PATCH  /workspaces/:workspaceId/members/:memberUserId  { role }
 * Remove: DELETE /workspaces/:workspaceId/members/:memberUserId
 *
 * Only OWNER and ADMIN may change roles — the backend enforces this, so
 * hiding the controls for others is polish, not security.
 * Every write needs the members query invalidated afterwards.
 */
export function WorkspaceSettingsPage() {
  return <h1 className="text-h2 font-semibold">Workspace settings</h1>
}
