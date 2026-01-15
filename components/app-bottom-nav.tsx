"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Compass, Bookmark, ShoppingBag, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation items for mobile bottom nav (4 most important)
const items = [
  {
    title: "Explore",
    url: "/app",
    icon: Compass,
  },
  {
    title: "Saved Items",
    url: "/app/saved",
    icon: Bookmark,
  },
  {
    title: "Orders",
    url: "/app/orders",
    icon: ShoppingBag,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Hide on desktop
  if (!isMobile) {
    return null;
  }

  // Active state logic (matches AppSidebar pattern)
  const isActive = (url: string) => {
    if (url === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(url);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505] border-t border-white/10"
      role="navigation"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);

          return (
            <Link
              key={item.url}
              href={item.url}
              className={`flex items-center justify-center w-full h-full transition-colors duration-200 ${
                active ? "text-white" : "text-zinc-500"
              }`}
              aria-label={item.title}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className="h-6 w-6 transition-all duration-200"
                strokeWidth={active ? 2.5 : 2}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
