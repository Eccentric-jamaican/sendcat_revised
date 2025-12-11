import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 text-center px-4">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white leading-[1.1]">
          Shop US Stores.
          <br />
          <span className="text-zinc-200">Delivered to Jamaica.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed">
          Shop from your favourite US and UK brands in one place—let us handle shipping, duties, and delivery to your door.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            variant="outline"
            className="h-12 rounded-full border-white/10 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
          >
            See How It Works
          </Button>
          <Button 
            className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-zinc-200"
          >
            Start Shopping Now
          </Button>
        </div>
      </div>
    </section>
  );
}
