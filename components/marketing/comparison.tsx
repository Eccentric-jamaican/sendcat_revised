import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Comparison() {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-6 py-20 md:py-28 overflow-hidden" id="solutions">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16 space-y-4">
        <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-orange-400">
          Why SendCat
        </div>
        <h2 className="text-h2 font-semibold text-white tracking-tight leading-tight">
          Smarter than your average <br /> freight forwarder.
        </h2>
        <p className="max-w-prose mx-auto text-body text-zinc-400">
          Stop guessing duties and managing multiple tabs. SendCat combines search, logistics, and payments into one seamless flow.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="relative overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/80">
        <div className="grid grid-cols-4 min-w-[760px]">

          {/* Column Headers */}
          <div className="col-span-1 p-6 border-b border-white/10 bg-transparent">
            {/* Empty top-left */}
          </div>
          <div className="col-span-1 p-6 border-b border-white/10 bg-orange-600/10 border-t-4 border-t-orange-500 rounded-t-lg">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="font-bold text-white text-h3 tracking-tight">SendCat</span>
              <span className="text-sm-fluid text-orange-400 font-semibold uppercase tracking-wider">AI Shopping + Logistics</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/10 text-center flex flex-col items-center justify-center gap-1">
            <span className="font-semibold text-zinc-300">Local Forwarders</span>
            <span className="text-sm-fluid text-zinc-500">(Mailpac, Shipme, etc.)</span>
          </div>
          <div className="col-span-1 p-6 border-b border-white/10 text-center flex flex-col items-center justify-center gap-1">
            <span className="font-semibold text-zinc-300">Direct Shipping</span>
            <span className="text-sm-fluid text-zinc-500">(Amazon/eBay Global)</span>
          </div>

          {/* Row 1: Search Experience */}
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center text-sm font-medium text-zinc-300 bg-zinc-900/20">
            Search Experience
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center bg-orange-600/5 border-x border-orange-500/10">
            <div className="text-center text-sm text-white">
              <span className="block font-medium">AI-Assisted</span>
              <span className="text-xs text-zinc-400">Natural language search</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">None</span>
              <span className="text-xs opacity-70">Just a warehouse address</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Basic Filter</span>
              <span className="text-xs opacity-70">Manual browsing</span>
            </div>
          </div>

          {/* Row 2: Landed Cost Accuracy */}
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center text-sm font-medium text-zinc-300 bg-zinc-900/20">
            Cost Transparency
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center bg-orange-600/5 border-x border-orange-500/10">
            <div className="text-center text-sm text-white">
              <span className="block font-medium">100% Upfront</span>
              <span className="text-xs text-zinc-400">Duties & GCT included</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Mystery</span>
              <span className="text-xs opacity-70">Surprise fees at pickup</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Variable</span>
              <span className="text-xs opacity-70">Import fees deposit</span>
            </div>
          </div>

          {/* Row 3: Product Discovery */}
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center text-sm font-medium text-zinc-300 bg-zinc-900/20">
            Product Discovery
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center bg-orange-600/5 border-x border-orange-500/10">
            <div className="text-center text-sm text-white">
              <span className="block font-medium">Multi-Store</span>
              <span className="text-xs text-zinc-400">eBay, Amazon, etc.</span>
            </div>
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <Minus className="text-zinc-600 w-5 h-5" />
          </div>
          <div className="col-span-1 p-6 border-b border-white/5 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Single Store</span>
              <span className="text-xs opacity-70">Siloed ecosystem</span>
            </div>
          </div>

          {/* Row 4: Shipping Speed */}
          <div className="col-span-1 p-6 flex items-center text-sm font-medium text-zinc-300 bg-zinc-900/20">
            Shipping Speed
          </div>
          <div className="col-span-1 p-6 flex items-center justify-center bg-orange-600/5 border-x border-orange-500/10">
            <div className="text-center text-sm text-white">
              <span className="block font-medium">Express (3-5 Days)</span>
              <span className="text-xs text-zinc-400">Regular flights</span>
            </div>
          </div>
          <div className="col-span-1 p-6 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Standard</span>
              <span className="text-xs opacity-70">Dependent on volume</span>
            </div>
          </div>
          <div className="col-span-1 p-6 flex items-center justify-center">
            <div className="text-center text-sm text-zinc-500">
              <span className="block">Slow (2+ Weeks)</span>
              <span className="text-xs opacity-70">Often stuck in customs</span>
            </div>
          </div>

        </div>

        {/* Mobile scroll hint */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent md:hidden"></div>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500 md:hidden">Scroll horizontally to compare</p>
    </section>
  );
}

