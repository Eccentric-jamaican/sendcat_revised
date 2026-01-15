"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Compass,
  TrendingUp,
  Bookmark,
  ShoppingBag,
  Store,
  HelpCircle,
  Settings,
  Tag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Explore",
    url: "/app",
    icon: Compass,
  },
  {
    title: "AI Search",
    url: "/app?agent=1",
    icon: Sparkles,
  },
  {
    title: "Saved Items",
    url: "/app/saved",
    icon: Bookmark,
  },
  {
    title: "My Orders",
    url: "/app/orders",
    icon: ShoppingBag,
  },
  {
    title: "Support",
    url: "/app/support",
    icon: HelpCircle,
  },
  {
    title: "My Coupons",
    url: "/app/coupons",
    icon: Tag,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (url: string) => {
    // Handle AI Search with query parameter
    if (url === "/app?agent=1") {
      return pathname === "/app" && searchParams?.get("agent") === "1";
    }
    // Handle exact match for Explore (only when NOT in agent mode)
    if (url === "/app") {
      return pathname === "/app" && searchParams?.get("agent") !== "1";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <Link
          href="/"
          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-semibold text-xl text-white group-data-[collapsible=icon]:hidden">
            SendCat
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-10"
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {/* Optional footer content */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
