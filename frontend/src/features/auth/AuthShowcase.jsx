import { Check } from 'lucide-react'
import { Logo } from '../../shared/ui/Logo'

/**
 * The decorative half of the auth screens. Hidden below lg by AuthShell.
 * Always dark gradient ink — uses white alpha, not semantic theme tokens.
 */

const PREVIEW_TASKS = [
  { title: 'Audit color tokens', meta: 'Due today', tone: 'bg-error-500' },
  { title: 'Ship invite flow', meta: 'In review', tone: 'bg-warning-500' },
  { title: 'Write API contract', meta: 'Done', tone: 'bg-success-500' },
]

export function AuthShowcase() {
  return (
    <aside className="relative flex h-full min-h-svh flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 lg:min-h-0 lg:rounded-3xl">
      <div>
        <Logo on="dark" size="sm" />

        <h2 className="mt-14 max-w-sm text-h1 font-semibold tracking-tight text-white">
          Every task, decision, and discussion in one place.
        </h2>
        <p className="mt-3 max-w-sm text-body-sm text-white/70">
          Stop stitching context together across five tools. Grasyn keeps the
          work and the reasoning behind it side by side.
        </p>
      </div>

      <div aria-hidden="true" className="relative my-10 max-w-sm">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-body-sm font-medium text-white">Design system</p>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-caption text-white/80">
              In progress
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/3 rounded-full bg-white/80" />
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {PREVIEW_TASKS.map((task) => (
              <li
                key={task.title}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <span className={`size-2 rounded-full ${task.tone}`} />
                <span className="flex-1 text-body-sm text-white">
                  {task.title}
                </span>
                <span className="text-caption text-white/50">{task.meta}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute -bottom-5 -left-5 flex items-center gap-2.5 rounded-xl border border-white/15 bg-brand-950/80 px-4 py-3 backdrop-blur-sm">
          <span className="grid size-6 place-items-center rounded-full bg-success-500">
            <Check className="size-3.5 text-white" strokeWidth={3} />
          </span>
          <span className="text-caption text-white/80">
            8 tasks closed today
          </span>
        </div>
      </div>

      <figure>
        <blockquote className="max-w-sm text-body-lg text-white">
          &ldquo;We used to spend the first ten minutes of standup working out
          where things stood. Now nobody has to ask.&rdquo;
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-white/15 text-body-sm font-medium text-white">
            MK
          </span>
          <span className="text-body-sm text-white/80">
            Maya Khoury
            <span className="block text-caption text-white/50">
              Engineering lead, Northwind
            </span>
          </span>
        </figcaption>
      </figure>
    </aside>
  )
}
