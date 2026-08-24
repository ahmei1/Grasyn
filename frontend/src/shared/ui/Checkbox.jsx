import { useId } from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'

/**
 * A real <input type="checkbox"> with its own styling stripped, so keyboard
 * and screen reader behaviour stays native. The tick is a sibling revealed
 * by peer-checked.
 */
export function Checkbox({ label, id, className, ...rest }) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="relative flex size-4 items-center justify-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={clsx(
            'peer size-4 appearance-none rounded border border-border bg-surface transition',
            'checked:border-primary checked:bg-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          )}
          {...rest}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute size-3 text-primary-foreground opacity-0 peer-checked:opacity-100"
        />
      </span>

      {label ? (
        <label
          htmlFor={checkboxId}
          className="select-none text-body-sm text-muted-foreground"
        >
          {label}
        </label>
      ) : null}
    </div>
  )
}
