/**
 * Holds the active workspace. Not a page — every other page needs a
 * workspaceId to build its request URL, and passing it down by props from
 * the router would touch every component in between.
 *
 * Load:   GET /workspaces  once the user is authenticated
 * Expose: { workspaces, activeWorkspace, setActiveWorkspace, isLoading }
 * Persist the chosen id in localStorage so a refresh keeps the same one,
 * and fall back to the first workspace when the stored id no longer exists.
 *
 * Zero workspaces is a real state: that is when WorkspaceOnboardingPage shows.
 *
 * Shape it like AuthContext.jsx — same provider plus hook pattern.
 */
