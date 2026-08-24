import { useEffect, useRef } from 'react'

/** Soft brand spotlight that follows the pointer across the hero. */
export function MouseGlow() {
  const glowRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const section = glow.closest('[data-mouse-glow-root]')
    if (!section) return

    function onMove(event) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect()
        glow.style.transform = `translate(${event.clientX - rect.left - 192}px, ${event.clientY - rect.top - 192}px)`
        glow.style.opacity = '1'
      })
    }

    function onLeave() {
      glow.style.opacity = '0'
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frameRef.current)
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-0 size-96 rounded-full opacity-0 blur-3xl transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(circle, color-mix(in oklab, var(--color-brand-400) 28%, transparent) 0%, transparent 70%)',
      }}
    />
  )
}
