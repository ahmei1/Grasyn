import { Toaster } from 'react-hot-toast'

/**
 * Colors come from CSS variables rather than Tailwind classes so the toast
 * follows the .dark theme without needing dark: variants.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        className: 'text-body-sm',
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-foreground)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: '10px 14px',
          maxWidth: '380px',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'var(--color-surface)',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'var(--color-surface)',
          },
        },
      }}
    />
  )
}
