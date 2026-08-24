/** Soft drifting brand blobs behind the hero (21st floating-gradient pattern). */
export function FloatingBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="landing-blob-a absolute -left-24 top-10 size-[28rem] rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-500/20" />
      <div className="landing-blob-b absolute -right-20 top-32 size-[24rem] rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-400/15" />
      <div className="landing-blob-c absolute bottom-0 left-1/3 size-[22rem] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-600/20" />
    </div>
  )
}
