import clsx from 'clsx'

/**
 * A hint, not a gate. The backend decides what it accepts (8 to 72
 * characters); this only tells the user how much room they have left to
 * do better, which measurably pushes people toward longer passwords.
 */
const LEVELS = [
  { label: 'Too short', tone: 'bg-error' },
  { label: 'Weak', tone: 'bg-error' },
  { label: 'Fair', tone: 'bg-warning' },
  { label: 'Good', tone: 'bg-success' },
  { label: 'Strong', tone: 'bg-success' },
]

function scorePassword(value) {
  if (value.length < 8) return 0

  let score = 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1
  return score
}

export function PasswordStrength({ value }) {
  if (!value) return null

  const score = scorePassword(value)
  const { label, tone } = LEVELS[score]

  return (
    <div className="flex items-center gap-3">
      <div aria-hidden="true" className="flex flex-1 gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={clsx(
              'h-1 flex-1 rounded-full transition',
              segment <= score ? tone : 'bg-border',
            )}
          />
        ))}
      </div>

      <p aria-live="polite" className="w-16 text-caption text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
