export default function PageSkeleton({ rows = 6, cards = false }: { rows?: number; cards?: boolean }) {
  return (
    <div aria-label="Loading content" role="status" className="animate-pulse space-y-5">
      <span className="sr-only">Loading content...</span>
      <div className="h-8 w-48 rounded bg-slate-200" />
      {cards ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-line p-5">
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex gap-4 border-b border-line p-4 last:border-0">
              <div className="h-5 flex-1 rounded bg-slate-200" />
              <div className="h-5 w-1/4 rounded bg-slate-100" />
              <div className="h-5 w-1/6 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
