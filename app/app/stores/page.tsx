import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function StoresPage() {
  const stores = [
    { name: "amazon", label: "Amazon" },
    { name: "walmart", label: "Walmart" },
    { name: "ebay", label: "eBay" },
    { name: "shein", label: "SHEIN" },
    { name: "depop", label: "Depop" },
    { name: "bestbuy", label: "Best Buy" },
    { name: "target", label: "Target" },
    { name: "nike", label: "Nike" },
    { name: "apple", label: "Apple" },
    { name: "sephora", label: "Sephora" },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">Browse Stores</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {stores.map((store) => (
          <Card key={store.name} className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border-white/10 shadow-sm aspect-square flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                 {/* Placeholder Icon */}
                 <span className="text-lg font-bold text-zinc-500">{store.label[0]}</span>
              </div>
              <span className="text-lg font-bold text-white">{store.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}






