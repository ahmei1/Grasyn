/**
 * One task with its comments and history.
 *
 * Read:     GET   /tasks/:taskId
 * Edit:     PATCH /tasks/:taskId       { title, description, status, priority,
 *                                       assigneeId, dueDate }
 * Comments: GET   /tasks/:taskId/comments
 *           POST  /tasks/:taskId/comments   { body }
 * History:  GET   /tasks/:taskId/activity
 *
 * Posting a comment must invalidate both the comments and activity queries,
 * since the backend writes an activity event for it too.
 */
export function TaskDetailPage() {
  return <h1 className="text-h2 font-semibold">Task detail</h1>
}
