import { Nav } from "@/components/app-components/nav";
import { Hero } from "@/components/app-components/hero";
import { DashboardPreview } from "@/components/app-components/dashboard-preview";
import { Benefits } from "@/components/app-components/benefits";
import { Comparison } from "@/components/app-components/comparison";
import { HowItWorks } from "@/components/app-components/how-it-works";
import { Testimonials } from "@/components/app-components/testimonials";
import { FAQ } from "@/components/app-components/faq";
import { Footer } from "@/components/app-components/footer";

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
