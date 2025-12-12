import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

export default function AppPage() {
  const stores = [
    { name: "amazon", label: "Amazon" },
    { name: "walmart", label: "Walmart" },
    { name: "ebay", label: "eBay" },
    { name: "shein", label: "SHEIN" },
    { name: "depop", label: "Depop" },
  ]

  const products = [
    { id: 1, title: "Black T-Shirt", price: "$25.00" },
    { id: 2, title: "Black Hoodie", price: "$45.00" },
    { id: 3, title: "Tablet", price: "$350.00" },
    { id: 4, title: "Smart Watch", price: "$199.00" },
    { id: 5, title: "Lounge Chair", price: "$120.00" },
    { id: 6, title: "Smartphone", price: "$899.00" },
    { id: 7, title: "Home Decor", price: "$35.00" },
    { id: 8, title: "Casual Shirt", price: "$30.00" },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input 
          placeholder="Search products, brands, or stores" 
          className="pl-10 h-12 text-base rounded-xl border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/50"
        />
      </div>

      {/* Stores */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {stores.map((store) => (
              <CarouselItem key={store.name} className="basis-1/2 pl-3">
                <Card className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border-white/10 shadow-sm">
                  <CardContent className="flex items-center justify-center p-5 h-20">
                    <span className="text-lg font-bold text-white">{store.label}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-4">
        {stores.map((store) => (
          <Card
            key={store.name}
            className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border-white/10 shadow-sm"
          >
            <CardContent className="flex items-center justify-center p-6 h-24">
              <span className="text-xl font-bold text-white">{store.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Trending Products</h2>
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
                {/* <div className="p-3">
                  <h3 className="font-medium text-sm text-white group-hover:text-indigo-400 transition-colors">{product.title}</h3>
                  <p className="text-sm text-zinc-400">{product.price}</p>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
