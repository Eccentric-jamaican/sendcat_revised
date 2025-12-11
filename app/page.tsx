import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Benefits } from "@/components/marketing/benefits";
import { Comparison } from "@/components/marketing/comparison";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <Nav />
      <main className="relative">
        <Hero />
        <DashboardPreview />
        <HowItWorks />
        <Benefits />
        <Comparison />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
