/**
 * Edit your own name / avatar.
 *
 * API:    PATCH /users/me
 * Note:   AuthContext holds the cached user, so after a successful save you
 *         must push the new values back into it or the header stays stale.
 *         Adding a setUser or refresh helper to AuthContext is the clean fix.
 */
export function ProfilePage() {
  return <h1 className="text-h2 font-semibold">Profile</h1>
}
