import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  FolderKanban,
  Layers,
  MessageSquareText,
  Users,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Logo } from '../../shared/ui/Logo'
import { ContextLattice } from './ContextLattice'
import { FloatingBlobs } from './FloatingBlobs'
import { MouseGlow } from './MouseGlow'
import { ProductPreview } from './ProductPreview'
import { Reveal } from './Reveal'
import { WordReveal } from './WordReveal'

const FEATURES = [
  {
    icon: Users,
    title: 'Workspaces that hold the team',
    body: 'Members, roles, and invites live in one place so access and ownership stay clear as the team grows.',
    image: '/marketing/grasyn-feature-workspaces.png',
    imageAlt: 'Illustration of a workspace with teammates and invites connected together',
  },
  {
    icon: FolderKanban,
    title: 'Projects and tasks with context',
    body: 'Priorities, assignees, due dates, and status sit next to the work — not buried in another tool.',
    image: '/marketing/grasyn-feature-projects.png',
    imageAlt: 'Illustration of a project board with task cards across columns',
  },
  {
    icon: MessageSquareText,
    title: 'Comments where decisions happen',
    body: 'Discuss the task on the task. The reasoning stays attached to the work instead of vanishing in chat.',
    image: '/marketing/grasyn-feature-comments.png',
    imageAlt: 'Illustration of comments and a decision attached directly to a task',
  },
  {
    icon: Activity,
    title: 'Activity you can catch up on',
    body: 'See what moved, who decided what, and what needs attention when you come back online.',
    image: '/marketing/grasyn-feature-activity.png',
    imageAlt: 'Illustration of an activity timeline showing recent team events',
  },
]

const FLOW = [
  { label: 'Conversation', detail: 'A decision is made' },
  { label: 'Action', detail: 'It becomes a task' },
  { label: 'Progress', detail: 'Status and ownership' },
  { label: 'Knowledge', detail: 'History stays searchable' },
]

function CtaLink({ to, children, variant = 'primary' }) {
  const styles =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
      : 'border border-border bg-surface text-foreground hover:bg-surface-muted'

  return (
    <Link
      to={to}
      viewTransition
      className={`inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-body font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${styles}`}
    >
      {children}
    </Link>
  )
}

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const primaryTo = isAuthenticated ? '/app' : '/register'
  const secondaryTo = isAuthenticated ? '/app' : '/login'
  const primaryLabel = isAuthenticated ? 'Open Grasyn' : 'Get started'
  const secondaryLabel = isAuthenticated ? 'Go to app' : 'Sign in'

  return (
    <div className="min-h-svh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <a
            href="#top"
            className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label="Grasyn home"
          >
            <Logo size="sm" />
          </a>

          <nav className="hidden items-center gap-6 text-body-sm font-medium text-muted-foreground md:flex">
            <a
              href="#problem"
              className="cursor-pointer transition duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Problem
            </a>
            <a
              href="#features"
              className="cursor-pointer transition duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="cursor-pointer transition duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={secondaryTo}
              viewTransition
              className="cursor-pointer rounded-full px-3 py-2 text-body-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              {secondaryLabel}
            </Link>
            <Link
              to={primaryTo}
              viewTransition
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-primary px-4 text-body-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:h-10 sm:px-5"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero — brand, copy, CTAs, then full-bleed visual plane */}
        <section data-mouse-glow-root className="relative overflow-hidden">
          <FloatingBlobs />
          <MouseGlow />

          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 sm:pt-20 lg:pt-24">
            <WordReveal
              as="p"
              text="Grasyn"
              className="font-display text-display-lg font-semibold tracking-tight text-primary sm:text-display-xl"
              delayMs={40}
              staggerMs={90}
            />

            <WordReveal
              as="h1"
              text="Connect the context of your software team."
              className="mt-5 max-w-3xl font-display text-h1 font-semibold tracking-tight sm:text-display-lg"
              delayMs={220}
              staggerMs={55}
            />

            <p
              className="landing-hero-rise mt-4 max-w-xl text-body-lg text-muted-foreground"
              style={{ animationDelay: '780ms' }}
            >
              Stop stitching chat, tasks, and decisions back together by hand.
              Grasyn keeps people, work, and history in one place.
            </p>

            <div
              className="landing-hero-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '920ms' }}
            >
              <CtaLink to={primaryTo}>
                {primaryLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </CtaLink>
              {!isAuthenticated ? (
                <CtaLink to={secondaryTo} variant="secondary">
                  {secondaryLabel}
                </CtaLink>
              ) : null}
            </div>
          </div>

          <div
            className="landing-preview-rise relative z-10 mt-12 sm:mt-16"
            style={{ animationDelay: '1100ms' }}
          >
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
              <img
                src="/marketing/grasyn-hero-network.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-x-4 -top-8 -z-10 h-[70%] rounded-3xl object-cover opacity-80 sm:inset-x-6"
              />
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* Problem — copy + fragmentation illustration */}
        <section id="problem" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <p className="text-caption font-medium uppercase tracking-widest text-primary">
                  The problem
                </p>
                <h2 className="mt-3 font-display text-h2 font-semibold tracking-tight sm:text-h1">
                  Your team&apos;s context is already there — just not in one
                  place.
                </h2>
                <p className="mt-4 text-body-lg text-muted-foreground">
                  Architectural decisions land in chat. Tasks live in a board.
                  Reviews sit in GitHub. Standups reconstruct what happened.
                  Grasyn is built so that reconstruction is no longer the job.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={120}>
              <figure className="overflow-hidden rounded-3xl border border-border bg-surface shadow-md">
                <img
                  src="/marketing/grasyn-fragmentation.png"
                  alt="Illustration of scattered chat, boards, documents, and calendars disconnected from each other"
                  className="h-auto w-full object-cover"
                  width={1200}
                  height={900}
                  loading="lazy"
                />
                <figcaption className="border-t border-border px-5 py-3 text-caption text-muted-foreground">
                  Fragmented tools force teams to rebuild context by hand.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* Connected idea — photo + lattice */}
        <section className="border-y border-border bg-surface-muted/50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <figure className="overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src="/marketing/grasyn-team-collab.png"
                    alt="Three teammates collaborating around a laptop in a bright office"
                    className="aspect-[16/10] h-auto w-full object-cover"
                    width={1600}
                    height={1000}
                    loading="lazy"
                  />
                </figure>
              </Reveal>

              <Reveal delayMs={100}>
                <div>
                  <p className="text-caption font-medium uppercase tracking-widest text-primary">
                    The Grasyn idea
                  </p>
                  <h2 className="mt-3 font-display text-h2 font-semibold tracking-tight sm:text-h1">
                    A strong connected structure for team synergy.
                  </h2>
                  <p className="mt-4 text-body-lg text-muted-foreground">
                    GRA for structure and connectivity. SYN for collaboration.
                    Together: one environment where people, work, and knowledge
                    reinforce each other instead of competing for attention.
                  </p>
                  <ContextLattice className="mt-8 w-full" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-caption font-medium uppercase tracking-widest text-primary">
                  What you get
                </p>
                <h2 className="mt-3 font-display text-h2 font-semibold tracking-tight sm:text-h1">
                  A connected workspace for how software teams actually work.
                </h2>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Reveal key={feature.title} delayMs={index * 90}>
                    <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition duration-300 hover:border-primary/30 hover:shadow-md">
                      {feature.image ? (
                        <img
                          src={feature.image}
                          alt={feature.imageAlt}
                          className="aspect-[16/9] w-full rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="flex gap-4">
                        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-h4 font-semibold tracking-tight">
                            {feature.title}
                          </h3>
                          <p className="mt-2 text-body text-muted-foreground">
                            {feature.body}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-t border-border bg-surface-muted/40 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-caption font-medium uppercase tracking-widest text-primary">
                  How context moves
                </p>
                <h2 className="mt-3 font-display text-h2 font-semibold tracking-tight sm:text-h1">
                  From discussion to done — without losing the thread.
                </h2>
              </div>
            </Reveal>

            <Reveal delayMs={80}>
              <figure className="mt-10 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                <img
                  src="/marketing/grasyn-context-flow.png"
                  alt="Illustration of conversation flowing into action, progress, and knowledge"
                  className="h-auto w-full object-cover"
                  width={1600}
                  height={900}
                  loading="lazy"
                />
              </figure>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FLOW.map((step, index) => (
                <Reveal key={step.label} delayMs={index * 100}>
                  <div className="relative border-l-2 border-primary/30 pl-4 transition duration-300 hover:border-primary sm:border-l-0 sm:border-t-2 sm:pl-0 sm:pt-4">
                    <p className="text-caption font-medium text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 font-display text-h4 font-semibold tracking-tight">
                      {step.label}
                    </p>
                    <p className="mt-1 text-body-sm text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section id="get-started" className="px-6 py-20 sm:py-28">
          <Reveal>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl">
              <img
                src="/marketing/grasyn-hero-network.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-800/92 via-brand-700/90 to-brand-950/95" />
              <div className="relative px-8 py-14 text-white sm:px-14 sm:py-16">
                <Layers aria-hidden="true" className="size-8 text-white/70" />
                <h2 className="mt-5 max-w-xl font-display text-h2 font-semibold tracking-tight sm:text-h1">
                  Build with shared understanding.
                </h2>
                <p className="mt-3 max-w-lg text-body-lg text-white/80">
                  Create a workspace, invite your team, and keep the next
                  decision next to the work it came from.
                </p>
                <div className="mt-8">
                  <Link
                    to={primaryTo}
                    viewTransition
                    className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-body font-medium text-brand-800 transition duration-200 hover:scale-[1.02] hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {primaryLabel}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <p className="text-body-sm text-muted-foreground">
              Connected work for software teams.
            </p>
          </div>
          <p className="text-caption text-muted-foreground">
            © {new Date().getFullYear()} Grasyn
          </p>
        </div>
      </footer>
    </div>
  )
}
