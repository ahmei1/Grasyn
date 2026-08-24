/**
 * One project: header, task list, members, activity.
 *
 * Id:       const { projectId } = useParams()
 * Read:     GET    /projects/:projectId
 * Tasks:    GET    /projects/:projectId/tasks
 * Activity: GET    /projects/:projectId/activity
 * Edit:     PATCH  /projects/:projectId
 * Archive:  POST   /projects/:projectId/archive
 * Members:  POST   /projects/:projectId/members            { userId, role }
 *           DELETE /projects/:projectId/members/:memberUserId
 *
 * A wrong or foreign projectId returns 403/404 — render a "not found" state
 * rather than letting the error bubble into a blank screen.
 */
export function ProjectDetailPage() {
  return <h1 className="text-h2 font-semibold">Project detail</h1>
}
