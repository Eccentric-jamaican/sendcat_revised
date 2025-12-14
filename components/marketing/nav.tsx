"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

function AuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show placeholder buttons during SSR/hydration to prevent layout shift
  if (!mounted) {
    return (
      <>
        <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
          Sign in
        </Button>
        <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
          Sign up
        </Button>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button variant="ghost" className="rounded-full text-white hover:bg-white/10">
            Sign up
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}

export function Nav() {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-black/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:gap-4 sm:px-6 md:flex-nowrap">
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

        {/* Auth + CTA */}
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3 md:w-auto">
          <AuthButtons />
          <Button
            asChild
            variant="secondary"
            className="w-full rounded-full bg-white px-5 font-medium text-black hover:bg-zinc-200 sm:w-auto sm:px-6"
          >
            <Link href="/app">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
