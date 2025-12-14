import React from "react"
import { Bookmark } from "lucide-react"

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full text-white">
      <h1 className="text-3xl font-bold">Saved Items</h1>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-16 border border-dashed border-white/10 rounded-xl bg-zinc-900/20 text-center">
        <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Bookmark className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
        <p className="text-zinc-400 max-w-sm">
          Items you save while browsing will appear here for quick access later.
        </p>
      </div>
    </div>
  )
}




