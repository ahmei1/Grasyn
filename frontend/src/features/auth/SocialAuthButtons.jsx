import { Button } from '../../shared/ui/Button'

/**
 * Disabled on purpose. The backend only issues sessions for email and
 * password, and a button that looks live but silently does nothing is worse
 * than one that reads as not-yet-available. Enable these the day the OAuth
 * endpoints exist.
 */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.9 3c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2-6.7-4.8l-4 3.1C3.4 21.3 7.4 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.5c-.3-.7-.4-1.5-.4-2.5s.2-1.8.4-2.5l-4-3.2C.5 7.9 0 9.9 0 12s.5 4.1 1.3 5.7l4-3.2Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c2.2 0 3.7.9 4.5 1.7l3.4-3.3C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.3 6.3l4 3.2C6.3 6.7 8.9 4.8 12 4.8Z"
      />
    </svg>
  )
}

/** Inlined because lucide dropped brand icons over trademark concerns. */
function GithubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
      />
    </svg>
  )
}

export function SocialAuthButtons() {
  return (
    <div className="mt-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg" pill disabled className="w-full">
          <GoogleMark />
          Google
        </Button>
        <Button variant="outline" size="lg" pill disabled className="w-full">
          <GithubMark />
          GitHub
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-muted-foreground">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  )
}
