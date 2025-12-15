import React from "react"
import { Tag, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CouponsPage() {
  const coupons = [
    { code: "WELCOME10", discount: "10% OFF", desc: "First order discount", expiry: "Valid until Dec 31" },
    { code: "FREESHIP", discount: "Free Shipping", desc: "Orders over $100", expiry: "Valid until Nov 30" },
    { code: "BLACKFRIDAY", discount: "25% OFF", desc: "Site-wide sale", expiry: "Valid Nov 24-27" },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">My Coupons</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 flex flex-col gap-4">
            <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
            
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Tag className="h-5 w-5" />
              </div>
              <div className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                {coupon.expiry}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{coupon.discount}</h3>
              <p className="text-sm text-zinc-400">{coupon.desc}</p>
            </div>

            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-dashed border-white/20">
              <code className="flex-1 font-mono text-indigo-300 text-center tracking-wider">{coupon.code}</code>
              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 text-zinc-400 hover:text-white">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Empty placeholder if needed */}
        {/* <div className="col-span-full py-12 text-center text-zinc-500">
           No more coupons available right now.
        </div> */}
      </div>
    </div>
  )
}





