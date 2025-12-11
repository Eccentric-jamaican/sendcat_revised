import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  company: string;
  quote: string;
  author: string;
  role: string;
}

const testimonialsRow1: Testimonial[] = [
  {
    company: "Mailpac User",
    quote: "Finally, I can order from eBay without the headache of figuring out customs fees myself. SendCat made it incredibly easy.",
    author: "Sarah J.",
    role: "Small Business Owner",
  },
  {
    company: "Amazon Shopper",
    quote: "The total landed cost estimate was spot on. I knew exactly what I was paying before I even clicked buy.",
    author: "Michael T.",
    role: "Tech Enthusiast",
  },
  {
    company: "Fashion Weekly",
    quote: "I used to juggle three different tabs to calculate shipping. Now I just ask the AI. It's like having a personal shopper.",
    author: "Priya D.",
    role: "Fashion Blogger",
  },
];

const testimonialsRow2: Testimonial[] = [
  {
    company: "Global Logistics",
    quote: "Best freight forwarding experience I've had in Jamaica. The tracking is real-time and the customer service is actual AI that works.",
    author: "David R.",
    role: "Architect",
  },
  {
    company: "Student Life",
    quote: "Bought a laptop for school. SendCat found me a better deal than I could find myself, and handled the shipping perfectly.",
    author: "Jessica M.",
    role: "Student",
  },
  {
    company: "Retail Inc.",
    quote: "The ability to search multiple US stores at once is a game changer. My business supplies arrive faster and cheaper now.",
    author: "Robert C.",
    role: "Retail Manager",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full w-[300px] flex-col justify-between rounded-xl border border-white/5 bg-zinc-900/80 p-6 transition-all hover:bg-zinc-900/90">
      <div className="space-y-4">
        {/* Company/Brand Placeholder - stylized text for now */}
        <div className="flex items-center gap-2 font-bold text-white text-base tracking-tight">
             {/* Simple icon based on first letter for visual variety */}
             <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-black text-[10px]">
                 {testimonial.company.charAt(0)}
             </div>
             {testimonial.company}
        </div>

        <blockquote className="text-sm leading-relaxed text-zinc-300 font-light">
          {testimonial.quote}
        </blockquote>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {/* Author Avatar Placeholder */}
        <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-800 border border-white/10">
           {/* In a real app, use next/image here */}
           <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-500">
               {testimonial.author.charAt(0)}
           </div>
        </div>
        <div>
          <div className="font-medium text-white text-sm">{testimonial.author}</div>
          <div className="text-xs text-zinc-500">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 overflow-hidden" id="reviews">
      <div className="mb-20 text-center">
        <div className="inline-flex items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-6">
          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
          Testimonials
        </div>
        <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tight">
          The proof is in the people
        </h2>
      </div>

      <div className="relative flex flex-col gap-6">
        {/* Row 1 - Scroll Left */}
        <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-scroll-left gap-4 px-4 hover:[animation-play-state:paused]">
            {[0, 1, 2].flatMap((copyIndex) =>
              testimonialsRow1.map((testimonial, itemIndex) => (
                <TestimonialCard key={`row1-copy${copyIndex}-item${itemIndex}`} testimonial={testimonial} />
              ))
            )}
          </div>
        </div>

        {/* Row 2 - Scroll Right */}
        <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex animate-scroll-right gap-4 px-4 hover:[animation-play-state:paused]">
            {[0, 1, 2].flatMap((copyIndex) =>
              testimonialsRow2.map((testimonial, itemIndex) => (
                <TestimonialCard key={`row2-copy${copyIndex}-item${itemIndex}`} testimonial={testimonial} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
