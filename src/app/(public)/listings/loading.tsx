export default function ListingsLoading() {
  return (
    <main className="bg-night text-paper">
      <div className="rm-progress" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs tracking-[0.25em] text-gold-bright">PROPERTIES</p>
          <h1 className="mt-3 font-display text-4xl text-paper">Find your next home</h1>
          <div className="thread-divider mx-auto mt-5 w-24 opacity-70" />
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rm-skeleton h-10 rounded-md" />
          ))}
          <div className="rm-skeleton col-span-2 h-10 rounded-md sm:col-span-4" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gold/20 bg-night-soft">
              <div className="rm-skeleton aspect-[4/3] w-full" />
              <div className="space-y-2 px-5 py-5">
                <div className="rm-skeleton h-6 w-32 rounded" />
                <div className="rm-skeleton h-4 w-44 rounded" />
                <div className="rm-skeleton h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
