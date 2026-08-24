/**
 * Kanban board for one project: columns per TaskStatus, drag to move.
 *
 * Read: GET   /projects/:projectId/tasks
 * Move: PATCH /tasks/:taskId/position   { status, position }
 *
 * Build it in two passes. First: static columns grouped by status with no
 * dragging at all. Only once that reads correctly, add drag and drop.
 * The move should be optimistic — the card follows the cursor immediately
 * and rolls back if the request fails.
 */
export function ProjectBoardPage() {
  return <h1 className="text-h2 font-semibold">Board</h1>
}
