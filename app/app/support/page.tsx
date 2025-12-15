import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Mail, Phone } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">How can we help?</h1>
        <p className="text-zinc-400 text-lg">Search our help center or contact us directly.</p>
        
        <div className="relative max-w-lg mx-auto mt-6">
          <Input 
             placeholder="Search for answers..." 
             className="h-12 pl-4 rounded-full bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 flex flex-col items-center text-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">Live Chat</h3>
          <p className="text-sm text-zinc-400">Chat with our support team in real-time.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 flex flex-col items-center text-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">Email Us</h3>
          <p className="text-sm text-zinc-400">Get a response within 24 hours.</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 flex flex-col items-center text-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Phone className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg">Call Support</h3>
          <p className="text-sm text-zinc-400">Available Mon-Fri, 9am - 5pm EST.</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
           {["How do I track my package?", "What are the shipping rates?", "Can I return an item?", "How do duties work?"].map((q, i) => (
             <div key={i} className="p-4 rounded-xl border border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer flex justify-between items-center">
               <span className="font-medium">{q}</span>
               <span className="text-zinc-500">+</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}





