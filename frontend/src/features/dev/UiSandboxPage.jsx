import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Logo } from '../../shared/ui/Logo'
import { notify } from '../../shared/ui/notify'

/** Scratch page for building primitives in isolation. Route: /ui */
export function UiSandboxPage() {
  const [email, setEmail] = useState('')

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Logo />
      <h1 className="mt-6 text-h1 font-semibold">UI sandbox</h1>

      <section className="mt-8">
        <h2 className="text-h3 font-medium">Buttons</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-h3 font-medium">Toasts</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => notify.success('Project created.')}>
            Success
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => notify.error('You do not have permission to do this.')}
          >
            Error
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => notify.info('Sam was invited to the workspace.')}
          >
            Info
          </Button>
        </div>
      </section>

      <section className="mt-8 max-w-sm">
        <h2 className="text-h3 font-medium">Inputs</h2>
        <div className="mt-3 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            hint="We never share your address."
          />
          <Input
            label="Password"
            type="password"
            error="Password must be at least 8 characters."
          />
          <Input label="Disabled" disabled value="Not editable" readOnly />
        </div>
      </section>
    </main>
  )
}
