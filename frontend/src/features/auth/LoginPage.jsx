import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AuthLayout } from './AuthLayout'
import { SocialAuthButtons } from './SocialAuthButtons'
import { Button } from '../../shared/ui/Button'
import { Checkbox } from '../../shared/ui/Checkbox'
import { Input } from '../../shared/ui/Input'
import { notify } from '../../shared/ui/notify'

/**
 * "Remember me" stores the email, not the session. A true keep-me-signed-in
 * would need the backend to vary the refresh cookie lifetime, so the checkbox
 * promises only what the frontend can actually deliver.
 */
const REMEMBERED_EMAIL_KEY = 'grasyn:remembered-email'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''

  const [email, setEmail] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(rememberedEmail))
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    const trimmedEmail = email.trim()
    setSubmitting(true)
    try {
      const user = await login({ email: trimmedEmail, password })

      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      notify.success(`Welcome back, ${user.name.split(' ')[0]}.`)
      navigate(location.state?.from?.pathname ?? '/app', { replace: true })
    } catch (error) {
      notify.apiError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where your team left off."
      footer={
        <>
          New to Grasyn?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <SocialAuthButtons />

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          size="lg"
          placeholder="you@company.com"
          autoComplete="email"
          leading={<Mail className="size-4" />}
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          size="lg"
          placeholder="Your password"
          autoComplete="current-password"
          leading={<Lock className="size-4" />}
          trailing={
            <Button
              variant="ghost"
              size="sm"
              pill
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="px-2"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </Button>
          }
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex items-center justify-between gap-4">
          <Checkbox
            label="Remember my email"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />

          <button
            type="button"
            onClick={() =>
              notify.info(
                'Password reset is not available yet. Ask your workspace owner for help.',
              )
            }
            className="rounded text-body-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          size="xl"
          pill
          loading={submitting}
          className="mt-1 w-full"
        >
          {submitting ? 'Signing in' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
