import { ShoppingBag, ArrowRight } from "lucide-react";

export function AuthShowcase() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative z-10 px-12">
      {/* Main Glass Card */}
      <div className="w-full max-w-[500px] bg-white/20 backdrop-blur-xl rounded-[32px] p-8 border border-white/30 shadow-2xl">
        {/* Header Tabs */}
        <div className="flex gap-8 mb-8 border-b border-white/20 pb-4">
          <button className="text-white/40 font-bold text-sm tracking-wide uppercase hover:text-white transition-colors">
            Trending
          </button>
          <button className="text-white font-bold text-sm tracking-wide uppercase border-b-2 border-white pb-4 -mb-4.5">
            US Brands
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-white text-xl font-medium mb-3">
            Shop Amazon, eBay & More
          </h3>
          
          <p className="text-white/60 text-sm max-w-[280px] leading-relaxed mb-8">
            Access millions of products from US marketplaces. We handle the shipping, duties, and delivery to your door in Jamaica.
          </p>

          <div className="flex gap-3 w-full justify-center">
            <button className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
              Start Searching
            </button>
            <button className="bg-white/10 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors backdrop-blur-md">
              View Rates
            </button>
          </div>
        </div>
      </div>

      {/* Pro Tip Floating Element */}
      <div className="absolute bottom-12 left-12 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Pro Tip
          </span>
        </div>
        <p className="text-white/90 text-lg font-medium leading-snug mb-1">
          Paste any Amazon or eBay link to get an instant landed cost estimate.
        </p>
        <p className="text-white/50 text-sm">
          Includes GCT & customs duties.
        </p>
      </div>

      {/* Navigation Arrows (Decorative) */}
      <div className="absolute bottom-12 right-12 flex gap-3">
        <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
