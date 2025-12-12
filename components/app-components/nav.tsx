import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShoppingBag } from "lucide-react";
import React from "react";

export function Nav() {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl px-4">
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/90 px-6 py-3 shadow-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-semibold text-white">SendCat</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link href="#how-it-works" className="flex items-center gap-1 hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </div>

        {/* CTA Button */}
        <Button
          asChild
          variant="secondary"
          className="rounded-full bg-white px-6 font-medium text-black hover:bg-zinc-200"
        >
          <Link href="/app">Explore</Link>
        </Button>
      </div>
    </nav>
  );
}
