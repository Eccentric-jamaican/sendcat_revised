import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function TrendingPage() {
  const products = [
    { id: 1, title: "Black T-Shirt", price: "$25.00" },
    { id: 2, title: "Black Hoodie", price: "$45.00" },
    { id: 3, title: "Tablet", price: "$350.00" },
    { id: 4, title: "Smart Watch", price: "$199.00" },
    { id: 5, title: "Lounge Chair", price: "$120.00" },
    { id: 6, title: "Smartphone", price: "$899.00" },
    { id: 7, title: "Home Decor", price: "$35.00" },
    { id: 8, title: "Casual Shirt", price: "$30.00" },
    { id: 9, title: "Running Shoes", price: "$120.00" },
    { id: 10, title: "Backpack", price: "$55.00" },
    { id: 11, title: "Gaming Mouse", price: "$60.00" },
    { id: 12, title: "Mechanical Keyboard", price: "$140.00" },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">Trending Now</h1>
      <p className="text-zinc-400 -mt-6">See what everyone else is buying this week.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-white/10 bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <CardContent className="p-0">
              <div className="aspect-square bg-zinc-800 relative">
                {/* Placeholder for product image */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                  Image
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm text-white group-hover:text-indigo-400 transition-colors truncate">{product.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{product.price}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

