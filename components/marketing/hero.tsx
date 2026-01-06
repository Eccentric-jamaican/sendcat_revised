import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 text-center px-5 sm:px-8">
      {/* Optimized gradient background - using transform for GPU acceleration */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-500/20 via-blue-500/10 to-transparent -z-10"
        style={{
          filter: "blur(64px)",
          transform: "translateZ(0)", // Force GPU layer
          willChange: "auto" // Let browser optimize
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-h1 font-bold tracking-tight text-white leading-tight max-w-[18ch] mx-auto">
          Shop US Stores.
          <br />
          <span className="text-zinc-400">Delivered to Jamaica.</span>
        </h1>

        <p className="max-w-prose mx-auto text-body text-zinc-400 text-balance">
          Shop from your favourite US and UK brands in one place—let us handle shipping, duties, and delivery to your door.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 max-w-xl mx-auto">
          <Button
            asChild
            variant="outline"
            className="h-12 w-full md:w-auto rounded-full border-white/10 bg-white/5 px-6 md:px-7 text-base text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <Link href="#how-it-works">How It Works</Link>
          </Button>
          <Button
            asChild
            className="h-12 w-full md:w-auto rounded-full bg-white px-6 md:px-7 text-base font-semibold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <Link href="/app">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
