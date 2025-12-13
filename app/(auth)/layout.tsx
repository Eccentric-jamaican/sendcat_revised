import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Package } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel: Auth Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white dark:bg-black">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <span>SendCat</span>
        </Link>
        
        <div className="w-full max-w-sm">
          {children}
        </div>

        <div className="absolute bottom-6 text-xs text-muted-foreground text-center w-full px-6">
          <p>© {new Date().getFullYear()} SendCat. Bringing US Shopping to Jamaica.</p>
        </div>
      </div>

      {/* Right Panel: Marketing preview (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#050505] via-[#07070d] to-[#0d1220] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute -top-32 -right-20 w-[28rem] h-[28rem] bg-indigo-600/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-36 -left-24 w-[30rem] h-[30rem] bg-cyan-500/30 rounded-full blur-[140px]" />

        <div className="w-full max-w-3xl px-8">
          <DashboardPreview />
        </div>
      </div>
    </div>
  );
}
