"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Sparkles } from "lucide-react";
import { appNavItems } from "./app-sidebar";
import { cn } from "@/lib/utils";

export function AppBottomNav() {
  const pathname = usePathname();
  const bottomNavItems = [
    ...appNavItems.filter((item) => item.title === "Explore" || item.title === "Saved Items"),
    { title: "AI", url: "/app?mode=agent", icon: Sparkles },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ];

  const isActive = (url: string) => {
    if (url === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(url);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item.url);
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition",
                active ? "text-white" : "text-zinc-400 hover:text-white"
              )}
              aria-label={item.title}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-white/10",
                  active ? "bg-white text-black" : "bg-white/5 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] leading-none">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
