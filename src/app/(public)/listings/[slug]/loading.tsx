export default function PropertyLoading() {
  return (
    <main className="bg-night text-paper">
      <div className="rm-progress" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rm-skeleton h-4 w-28 rounded" />

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rm-skeleton aspect-[4/3] rounded-lg sm:row-span-2 sm:aspect-auto sm:h-full" />
          <div className="rm-skeleton aspect-[4/3] rounded-lg" />
          <div className="rm-skeleton aspect-[4/3] rounded-lg" />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="rm-skeleton h-10 w-3/4 rounded" />
            <div className="rm-skeleton h-4 w-40 rounded" />
            <div className="rm-skeleton h-8 w-48 rounded" />
            <div className="rm-skeleton h-4 w-full rounded" />
            <div className="rm-skeleton h-4 w-5/6 rounded" />
            <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rm-skeleton h-12 rounded" />
              ))}
            </div>
          </div>
          <div className="rm-skeleton h-64 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
