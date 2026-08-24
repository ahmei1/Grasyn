import { useId } from 'react'
import clsx from 'clsx'

const SIZES = {
  md: 'h-10 text-body-sm',
  lg: 'h-12 text-body',
}

export function Input({
  label,
  error,
  hint,
  id,
  size = 'md',
  leading,
  trailing,
  className,
  ...rest
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy =
    clsx(error && errorId, hint && !error && hintId) || undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-body-sm font-medium">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leading ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground"
          >
            {leading}
          </span>
        ) : null}

        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(
            'w-full rounded-lg border bg-surface transition',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
            'disabled:cursor-not-allowed disabled:opacity-60',
            SIZES[size],
            // Set each side explicitly: px-3 plus pl-11 would be two rules
            // fighting over the same property.
            leading ? 'pl-11' : 'pl-3',
            trailing ? 'pr-11' : 'pr-3',
            error ? 'border-error' : 'border-border',
            className,
          )}
          {...rest}
        />

        {trailing ? (
          <span className="absolute inset-y-0 right-1.5 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
