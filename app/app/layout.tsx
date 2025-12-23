import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { Metadata } from "next"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

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
        <AppSidebar />
        <main className="flex-1 w-full flex flex-col bg-[#050505] overflow-y-auto h-screen">
          <div className="sticky top-0 z-30 p-4 border-b border-white/10 bg-[#050505]">
            <div className="flex items-center justify-between gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton>
                    <Button variant="secondary" className="bg-white text-black hover:bg-zinc-200">
                      Sign in
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

