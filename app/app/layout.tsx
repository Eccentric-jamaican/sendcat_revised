import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppBottomNav } from "@/components/app-bottom-nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "App",
    template: "%s | SendCat",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#050505] text-white dark">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <main className="flex-1 w-full flex flex-col bg-[#050505]">
          <div className="p-4 border-b border-white/10">
            <div className="hidden md:block">
              <SidebarTrigger className="text-white hover:bg-white/10" />
            </div>
          </div>
          <div className="pb-16 md:pb-0">
            {children}
          </div>
        </main>
        <AppBottomNav />
      </div>
    </SidebarProvider>
  )
}

