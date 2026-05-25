export function MarqueeBanner() {
  const message =
    "Any Queries? Contact Your National Administrator Directly."

  return (
    <section className="overflow-hidden bg-foreground py-3">
      <div className="relative flex">
        <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-medium text-background">
              <span>{message}</span>
              <span className="text-background/60">•</span>
            </span>
          ))}
        </div>
        <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-medium text-background">
              <span>{message}</span>
              <span className="text-background/60">•</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
