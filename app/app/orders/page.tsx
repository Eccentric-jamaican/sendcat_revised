import React from "react"
import { Package } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    { id: "ORD-1001", date: "Oct 24, 2023", items: "Nike Air Max 90", status: "Delivered", total: "$120.00" },
    { id: "ORD-1002", date: "Nov 02, 2023", items: "Sony WH-1000XM5", status: "In Transit", total: "$348.00" },
    { id: "ORD-1003", date: "Nov 15, 2023", items: "Kindle Paperwhite", status: "Processing", total: "$139.00" },
  ]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">My Orders</h1>

      <div className="border border-white/10 rounded-xl bg-zinc-900/50 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-sm font-medium text-zinc-400">
          <div>Order ID</div>
          <div className="col-span-2">Items</div>
          <div>Date</div>
          <div className="text-right">Total</div>
        </div>
        
        {orders.length > 0 ? (
          <div className="divide-y divide-white/5">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 gap-4 p-4 text-sm items-center hover:bg-white/5 transition-colors">
                <div className="font-mono text-indigo-400">{order.id}</div>
                <div className="col-span-2 font-medium">{order.items}</div>
                <div className="text-zinc-400">{order.date}</div>
                <div className="text-right font-medium">{order.total}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
             <Package className="h-12 w-12 text-zinc-600 mb-4" />
             <p className="text-zinc-400">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  )
}



