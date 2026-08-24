/**
 * Shown when a signed-in user belongs to zero workspaces.
 *
 * API:   POST /workspaces  { name }
 * After: store the new workspace as the active one, then go to /app
 *
 * This page is the reason the workspace list has to load before the app
 * shell renders: with no workspace there is no id to build URLs from.
 */
export function WorkspaceOnboardingPage() {
  return <h1 className="text-h2 font-semibold">Create your workspace</h1>
}
