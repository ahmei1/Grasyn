import clsx from 'clsx'

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
  outline: 'border border-border bg-surface hover:bg-surface-muted',
  ghost: 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
  danger: 'bg-error text-primary-foreground hover:bg-error-hover',
}

const SIZES = {
  sm: 'h-8 px-3 text-caption',
  md: 'h-10 px-4 text-body-sm',
  lg: 'h-11 px-5 text-body',
  xl: 'h-12 px-6 text-body',
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  pill = false,
  loading = false,
  disabled = false,
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        pill ? 'rounded-full' : 'rounded-lg',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
