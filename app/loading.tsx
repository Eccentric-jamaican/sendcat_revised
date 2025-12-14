export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Nav skeleton */}
      <nav className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/90 px-6 py-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-12 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 rounded-full bg-white/5 animate-pulse" />
            <div className="h-9 w-32 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero skeleton */}
      <section className="relative pt-32 pb-20 text-center px-4">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent -z-10" />
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="h-12 md:h-16 w-3/4 mx-auto rounded bg-white/5 animate-pulse" />
            <div className="h-12 md:h-16 w-1/2 mx-auto rounded bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="h-5 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-5 w-4/5 mx-auto rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="h-12 w-40 rounded-full bg-white/5 animate-pulse" />
            <div className="h-12 w-44 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
