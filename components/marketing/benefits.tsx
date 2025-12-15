import { LucideIcon, Search, Package, Calculator, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitProps {
  title: string;
  description: string;
  label: string;
  icon: LucideIcon;
  imagePosition: "left" | "right";
  children?: React.ReactNode;
}

function BenefitSection({ title, description, label, icon: Icon, imagePosition, children }: BenefitProps) {
  return (
    <div className="py-24 md:py-32">
      <div className={cn(
        "flex flex-col gap-12 md:items-center",
        imagePosition === "left" ? "md:flex-row-reverse" : "md:flex-row"
      )}>
        {/* Text Content */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-orange-400">{label}</p>
            <h2 className="text-3xl font-medium tracking-tight text-white md:text-4xl">
              {title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>

        {/* Visual Content */}
          <div className="flex-1">
          <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-50" />
            
            {/* Abstract UI representation */}
            <div className="relative h-full w-full rounded-xl border border-white/5 bg-black/60 p-6">
                {children ? children : (
                    <div className="flex h-full items-center justify-center">
                        <Icon className="h-16 w-16 text-zinc-700" strokeWidth={1} />
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-4" id="features">
      {/* Section Header */}
      <div className="py-20 text-center">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">THE SENDCAT WAY</h2>
        <h3 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
          Everything you need to <br/> shop internationally.
        </h3>
      </div>

      <BenefitSection
        label="AI Shopping Assistant"
        title="Find exactly what you want."
        description="Just ask for 'men's blazers under $200' and get tailored results from eBay and Amazon instantly. Our AI understands your style, budget, and needs."
        icon={Search}
        imagePosition="right"
      >
        {/* Mock Chat Interface */}
        <div className="flex flex-col gap-4">
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300">AI</div>
                <div className="rounded-2xl rounded-tl-none bg-zinc-800 p-3 text-sm text-zinc-300 max-w-[80%]">
                    I found 3 blazers under $200 that match your style.
                </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
                 <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">You</div>
                <div className="rounded-2xl rounded-tr-none bg-orange-600 p-3 text-sm text-white max-w-[80%]">
                    Show me the blue one.
                </div>
            </div>
             <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300">AI</div>
                <div className="rounded-2xl rounded-tl-none bg-zinc-800 p-3 text-sm text-zinc-300 max-w-[80%]">
                    Here are the details for the Navy Blue Slim Fit Blazer...
                </div>
            </div>
        </div>
      </BenefitSection>

      <BenefitSection
        label="Total Landed Cost"
        title="No more surprise fees."
        description="We calculate shipping, duties, and GCT upfront. Know exactly what you'll pay before you click buy. No hidden costs at customs."
        icon={Calculator}
        imagePosition="left"
      >
          {/* Mock Cost Breakdown */}
           <div className="space-y-3 p-2">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Product Price</span>
                    <span className="text-white">$150.00</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Est. Shipping</span>
                    <span className="text-white">$25.00</span>
                </div>
                 <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Duties & Taxes</span>
                    <span className="text-white">$45.00</span>
                </div>
                <div className="flex justify-between items-center font-medium pt-2">
                    <span className="text-orange-400">Total to Jamaica</span>
                    <span className="text-orange-400">$220.00</span>
                </div>
           </div>
      </BenefitSection>

      <BenefitSection
        label="One-Click Forwarding"
        title="Buy & Ship to Jamaica."
        description="We provide a dedicated US shipping hub. Track your packages from purchase to delivery at your door in Jamaica."
        icon={Package}
        imagePosition="right"
      >
           {/* Mock Tracking UI */}
           <div className="relative h-full flex items-center justify-center">
               <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-zinc-800"></div>
               <div className="space-y-6 relative z-10 w-full pl-4">
                   <div className="flex items-center gap-4">
                       <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                           <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                       </div>
                       <div>
                           <div className="text-sm font-medium text-white">Delivered</div>
                           <div className="text-xs text-zinc-500">Kingston, Jamaica</div>
                       </div>
                   </div>
                   <div className="flex items-center gap-4 opacity-50">
                       <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                           <div className="h-2.5 w-2.5 rounded-full bg-zinc-600"></div>
                       </div>
                        <div>
                           <div className="text-sm font-medium text-white">In Transit</div>
                           <div className="text-xs text-zinc-500">Miami Hub</div>
                       </div>
                   </div>
               </div>
           </div>
      </BenefitSection>

       <BenefitSection
        label="Smart Recommendations"
        title="Discover new favorites."
        description="Personalized feeds based on your style and shopping history. The more you use SendCat, the better it gets at finding what you love."
        icon={Zap}
        imagePosition="left"
      />
    </section>
  );
}

