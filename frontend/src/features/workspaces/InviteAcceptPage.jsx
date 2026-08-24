/**
 * Landing page for an invite link: /invite/:token
 *
 * Preview: GET  /invites/:token          (public — shows workspace + role)
 * Accept:  POST /invites/:token/accept   (requires a signed-in user)
 *
 * Four cases to handle:
 *   token invalid or expired  -> explain, link to /login
 *   valid + signed out        -> send to /login, come back here afterwards
 *   valid + signed in         -> show workspace name and an Accept button
 *   already a member          -> just go to /app
 */
export function InviteAcceptPage() {
  return <h1 className="text-h2 font-semibold">Join workspace</h1>
}
