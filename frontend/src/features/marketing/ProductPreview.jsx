/**
 * DOM product mock for the hero — sharp at any DPI, no screenshot asset.
 */
const COLUMNS = [
  {
    title: 'Backlog',
    tasks: [
      { title: 'Define invite roles', tag: 'Auth' },
      { title: 'Seed demo workspace', tag: 'Data' },
    ],
  },
  {
    title: 'In progress',
    tasks: [
      { title: 'Wire task board', tag: 'Frontend', active: true },
      { title: 'Activity feed API', tag: 'API' },
    ],
  },
  {
    title: 'Review',
    tasks: [{ title: 'Comment threads', tag: 'UX' }],
  },
]

const ACTIVITY = [
  { who: 'Maya', what: 'moved Wire task board to In progress', when: '2m' },
  { who: 'Jonas', what: 'commented on Invite roles', when: '14m' },
  { who: 'Ada', what: 'closed Seed demo workspace', when: '1h' },
]

export function ProductPreview() {
  return (
    <div
      aria-hidden="true"
      className="landing-hero-float relative mx-auto w-full max-w-5xl"
    >
      <div className="overflow-hidden rounded-t-2xl border border-border border-b-0 bg-surface/90 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-error/80" />
          <span className="size-2.5 rounded-full bg-warning/80" />
          <span className="size-2.5 rounded-full bg-success/80" />
          <span className="ml-3 text-caption text-muted-foreground">
            grasyn.app / Northwind Engineering
          </span>
        </div>

        <div className="grid md:grid-cols-[11rem_1fr_14rem]">
          <aside className="hidden border-r border-border bg-surface-muted/60 p-4 md:block">
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <ul className="mt-3 space-y-1 text-body-sm">
              {['Dashboard', 'Projects', 'My tasks', 'Activity'].map(
                (item, index) => (
                  <li
                    key={item}
                    className={
                      index === 1
                        ? 'rounded-md bg-primary/10 px-2.5 py-1.5 font-medium text-primary'
                        : 'rounded-md px-2.5 py-1.5 text-muted-foreground'
                    }
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </aside>

          <div className="p-4 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-caption text-muted-foreground">Project</p>
                <p className="text-h4 font-semibold tracking-tight">
                  Platform MVP
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-caption font-medium text-primary">
                12 open
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {COLUMNS.map((column) => (
                <div key={column.title} className="min-w-0">
                  <p className="mb-2 text-caption font-medium text-muted-foreground">
                    {column.title}
                  </p>
                  <ul className="space-y-2">
                    {column.tasks.map((task) => (
                      <li
                        key={task.title}
                        className={
                          task.active
                            ? 'rounded-lg border border-primary/30 bg-brand-50 p-3 shadow-sm dark:bg-brand-950/40'
                            : 'rounded-lg border border-border bg-background p-3'
                        }
                      >
                        <p className="truncate text-body-sm font-medium">
                          {task.title}
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          {task.tag}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden border-l border-border p-4 lg:block">
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              Activity
            </p>
            <ul className="mt-3 space-y-3">
              {ACTIVITY.map((event) => (
                <li key={event.what} className="text-body-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{event.who}</span>{' '}
                    <span className="text-muted-foreground">{event.what}</span>
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {event.when} ago
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}
