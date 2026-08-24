import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useAuth } from './AuthContext'
import { AuthLayout } from './AuthLayout'
import { PasswordStrength } from './PasswordStrength'
import { SocialAuthButtons } from './SocialAuthButtons'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { notify } from '../../shared/ui/notify'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Mirrors RegisterDto on the server. Checking here saves a round trip;
  // the server still checks, because anyone can skip this code.
  function validate() {
    const nextErrors = {}

    if (!name.trim()) nextErrors.name = 'Name is required.'
    else if (name.trim().length > 80)
      nextErrors.name = 'Name cannot be longer than 80 characters.'

    if (!email.trim()) nextErrors.email = 'Email is required.'
    else if (!email.includes('@')) nextErrors.email = 'Enter a valid email.'

    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 8)
      nextErrors.password = 'Use at least 8 characters.'
    else if (password.length > 72)
      nextErrors.password = 'Password cannot be longer than 72 characters.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      notify.success(`Welcome to Grasyn, ${user.name.split(' ')[0]}.`)
      navigate('/app', { replace: true })
    } catch (error) {
      notify.apiError(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your workspace in about a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SocialAuthButtons />

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-5"
        noValidate
      >
        <Input
          label="Full name"
          name="name"
          size="lg"
          placeholder="Ada Lovelace"
          autoComplete="name"
          leading={<User className="size-4" />}
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />

        <Input
          label="Work email"
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

        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            size="lg"
            placeholder="At least 8 characters"
            autoComplete="new-password"
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

          <PasswordStrength value={password} />
        </div>

        <Button
          type="submit"
          size="xl"
          pill
          loading={submitting}
          className="mt-1 w-full"
        >
          {submitting ? 'Creating account' : 'Create account'}
        </Button>

        <p className="text-caption text-muted-foreground">
          By creating an account you agree to keep your workspace data
          accurate. No card required.
        </p>
      </form>
    </AuthLayout>
  )
}
