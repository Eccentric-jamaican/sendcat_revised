"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        <Button variant="ghost" className="hidden sm:inline-flex rounded-full text-white hover:bg-white/10">
          Sign in
        </Button>
        <Button variant="ghost" className="hidden md:inline-flex rounded-full text-white hover:bg-white/10">
          Sign up
        </Button>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button variant="ghost" className="hidden sm:inline-flex rounded-full text-white hover:bg-white/10">
            Sign in
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button variant="ghost" className="hidden md:inline-flex rounded-full text-white hover:bg-white/10">
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
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
        {/* Wordmark */}
        <Link href="/" className="flex items-center">
          <span className="font-bold text-white text-h3 tracking-tight">SendCat</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm-fluid font-medium text-zinc-400">
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
        <div className="flex items-center gap-2">
          <AuthButtons />
          <Button
            asChild
            variant="secondary"
            className="rounded-full bg-white px-4 sm:px-6 font-medium text-black hover:bg-zinc-200 text-sm"
          >
            <Link href="/app">Start Shopping</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
