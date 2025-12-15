"use client";

import { Search, Plane, Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-24 md:py-32" id="how-it-works">
      {/* Header */}
      <div className="mb-20 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          From search to doorstep, <br />
          completely handled for you.
        </h2>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Step 1 */}
        <div className="space-y-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
            
            {/* Abstract UI: Search Bar */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
               <div className="w-full space-y-3">
                   <div className="flex gap-2 items-center text-xs text-zinc-500 mb-2">
                       <Search className="w-3 h-3" />
                       <span>Search query</span>
                   </div>
                   <div className="h-10 w-full rounded-lg border border-white/10 bg-black/50 flex items-center px-3 text-sm text-zinc-300">
                       &ldquo;Men&rsquo;s running shoes...&rdquo;
                   </div>
                   <div className="h-2 w-1/2 bg-zinc-800 rounded-full"></div>
                   <div className="h-2 w-3/4 bg-zinc-800 rounded-full"></div>
               </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Step 1: Ask SendCat</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Tell our AI what you&apos;re looking for. It searches eBay and major US stores to find the best deals for you.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
             
             {/* Abstract UI: Cost Card */}
             <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-full rounded-lg border border-white/10 bg-black/50 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                         <div className="h-2 w-12 bg-zinc-700 rounded-full"></div>
                         <div className="h-2 w-8 bg-zinc-700 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center">
                         <div className="h-2 w-16 bg-zinc-700 rounded-full"></div>
                         <div className="h-2 w-8 bg-zinc-700 rounded-full"></div>
                    </div>
                    <div className="h-px w-full bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center">
                         <div className="h-3 w-20 bg-orange-500/50 rounded-full"></div>
                         <div className="h-3 w-12 bg-orange-500/50 rounded-full"></div>
                    </div>
                </div>
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Step 2: See Total Cost</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We calculate shipping, duties, and taxes instantly. The price you see is the final price to land it in Jamaica.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
             
             {/* Abstract UI: Plane/Shipping - only animate when visible */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                     <div 
                       className={`absolute inset-0 border-2 border-dashed border-zinc-700 rounded-full ${isVisible ? "animate-[spin_10s_linear_infinite]" : ""}`}
                     />
                     <Plane className="w-8 h-8 text-zinc-500" />
                     <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                 </div>
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Step 3: We Ship It</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Use your free US address or let us buy it for you. We handle the air freight and customs clearance.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />

             {/* Abstract UI: Delivery */}
             <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full h-full flex items-end justify-center relative">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-zinc-700"></div>
                    <Home className="w-10 h-10 text-zinc-500 mb-2" strokeWidth={1.5} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded border border-green-500/20">
                        Arrived
                    </div>
                </div>
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Step 4: Delivery</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Track your package in real-time. Pick it up or get it delivered straight to your door in any parish.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

