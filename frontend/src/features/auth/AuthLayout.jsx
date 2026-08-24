/**
 * Form chrome shared by login and register. The sliding frame lives in
 * AuthShell; pages only pass title, subtitle, footer, and the form body.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <>
      <h1 className="text-h1 font-semibold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-body-sm text-muted-foreground">{subtitle}</p>
      ) : null}

      {children}

      {footer ? (
        <p className="mt-8 text-body-sm text-muted-foreground">{footer}</p>
      ) : null}
    </>
  )
}
