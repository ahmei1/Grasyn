import clsx from 'clsx'

/** Word-by-word blur/slide entrance (21st.dev text-reveal pattern). */
export function WordReveal({
  text,
  as: Tag = 'span',
  className,
  delayMs = 0,
  staggerMs = 70,
}) {
  const words = text.trim().split(/\s+/)

  return (
    <Tag className={clsx(className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="landing-word inline-block whitespace-pre"
          style={{ animationDelay: `${delayMs + index * staggerMs}ms` }}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
