"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignedIn, UserButton } from "@clerk/nextjs";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#050505] text-white">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <main className="flex-1 w-full flex flex-col bg-[#050505] overflow-y-auto h-screen pb-20 md:pb-0">
          <div className="sticky top-0 z-30 px-4 py-3 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10 hidden md:inline-flex" />
              <div className="flex items-center gap-2 ml-auto">
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
          {children}
        </main>

        {isMobile && <AppBottomNav />}
      </div>
    </SidebarProvider>
  );
}
