export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-20">
      {/* Background glow effect - contained within bounds */}
      <div 
        className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10 rounded-[3rem] opacity-50" 
        aria-hidden="true"
      />
      
      <div className="relative rounded-2xl border border-white/10 bg-black/80 p-2 shadow-2xl">
        <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50 aspect-[16/10] relative group">
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-zinc-900">
             {/* Placeholder for the dashboard image */}
             <div className="text-center space-y-4">
               <div className="w-16 h-16 mx-auto border-2 border-zinc-700 border-dashed rounded-lg flex items-center justify-center">
                 <svg 
                   className="w-8 h-8 text-zinc-700" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   stroke="currentColor"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </div>
               <p className="text-sm font-medium">SendCat AI Shopping Assistant</p>
               <p className="text-xs text-zinc-600">Dashboard Interface Preview</p>
             </div>
          </div>
          
          {/* Overlay gradient to blend bottom with background if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
