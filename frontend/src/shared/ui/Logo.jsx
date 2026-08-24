import clsx from 'clsx'

/**
 * `on` describes the surface behind the logo, not the active theme:
 *
 *   on="theme"  follow light/dark mode (default)
 *   on="light"  always dark ink — for white and near-white surfaces
 *   on="dark"   always light ink — for the brand gradient, in either theme
 *
 * The explicit values matter because a panel that is always dark needs the
 * light logo even while the app is in light mode.
 */
const SOURCES = {
  light: { src: '/grasyn-logo-light.svg', width: 277, height: 51 },
  dark: { src: '/grasyn-logo-dark.svg', width: 285, height: 59 },
}

const SIZES = {
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-10',
}

export function Logo({ className, on = 'theme', size = 'md' }) {
  if (on !== 'theme') {
    const { src, width, height } = SOURCES[on]
    return (
      <img
        src={src}
        alt="Grasyn"
        width={width}
        height={height}
        className={clsx(SIZES[size], 'w-auto', className)}
      />
    )
  }

  // Both files ship and CSS picks one. Choosing in JS would mean every
  // caller had to know the current theme.
  return (
    <>
      <img
        src={SOURCES.light.src}
        alt="Grasyn"
        width={SOURCES.light.width}
        height={SOURCES.light.height}
        className={clsx(SIZES[size], 'w-auto', 'block dark:hidden', className)}
      />
      <img
        src={SOURCES.dark.src}
        alt=""
        aria-hidden="true"
        width={SOURCES.dark.width}
        height={SOURCES.dark.height}
        className={clsx(SIZES[size], 'w-auto', 'hidden dark:block', className)}
      />
    </>
  )
}
