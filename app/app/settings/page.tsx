"use client";

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function SettingsPage() {
  const tabs = ["Basics", "Account", "Email notifications", "Memberships"]

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full text-white">
      {/* Sign-in prompt for unauthenticated users */}
      <SignedOut>
        <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to manage settings</h2>
          <p className="text-zinc-400 mb-6">
            Access your profile, preferences, and account settings by signing in.
          </p>
          <SignInButton>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Existing settings content - only visible when signed in */}
      <SignedIn>
        {/* Header & Tabs */}
        <div className="space-y-6">
        <h1 className="text-4xl font-bold">Settings</h1>
        <div className="flex items-center gap-8 border-b border-white/10 text-sm font-medium">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`pb-3 border-b-2 transition-colors ${
                i === 0
                  ? "border-white text-white"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
          <button className="pb-3 text-zinc-400 hover:text-white flex items-center gap-1">
            More <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl bg-zinc-900/50 border border-white/10 text-white p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-8">Profile information</h2>

        <div className="space-y-8 max-w-2xl">
          {/* Profile Photo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Profile</label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                {/* Placeholder Avatar */}
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-semibold">
                  JD
                </div>
              </div>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none font-medium text-sm h-9">
                Upload photo
              </Button>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Display name</label>
            <Input 
              defaultValue="Jane" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 h-11" 
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <Input 
              defaultValue="jsmith.mobbin2@gmail.com" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 h-11" 
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Country of Residence</label>
            <div className="relative">
              <select className="w-full h-11 rounded-md border border-white/10 bg-black/20 px-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                <option value="us" className="bg-zinc-900">🇺🇸 United States</option>
                <option value="jm" className="bg-zinc-900">🇯🇲 Jamaica</option>
                <option value="uk" className="bg-zinc-900">🇬🇧 United Kingdom</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">State of Residence</label>
            <div className="relative">
              <select className="w-full h-11 rounded-md border border-white/10 bg-black/20 px-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                <option value="ca" className="bg-zinc-900">California</option>
                <option value="ny" className="bg-zinc-900">New York</option>
                <option value="fl" className="bg-zinc-900">Florida</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Postcode */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Postcode of Residence</label>
            <Input 
              defaultValue="94025" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 h-11" 
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-medium h-10">
              Save
            </Button>
          </div>
        </div>
      </div>
      </SignedIn>
    </div>
  )
}

