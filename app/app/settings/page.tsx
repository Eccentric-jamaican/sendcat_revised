import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"

export default function SettingsPage() {
  const tabs = ["Basics", "Account", "Email notifications", "Memberships"]

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-8 max-w-4xl w-full mx-auto text-white">
      {/* Header & Tabs */}
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-h1 font-bold leading-tight">Settings</h1>
        <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
          <div className="flex items-center gap-4 md:gap-8 border-b border-white/10 text-sm-fluid font-medium min-w-max">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                  i === 0
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="pb-3 text-zinc-400 hover:text-white flex items-center gap-1 whitespace-nowrap">
              More <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl bg-zinc-900/50 border border-white/10 text-white p-4 md:p-6 shadow-sm">
        <h2 className="text-h2 font-semibold leading-tight mb-6 md:mb-8">Profile information</h2>

        <div className="space-y-6 md:space-y-8 max-w-xl">
          {/* Profile Photo */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">Profile</label>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                {/* Placeholder Avatar */}
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-semibold">
                  JD
                </div>
              </div>
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none font-medium text-sm-fluid h-10 min-h-[44px] px-4">
                Upload photo
              </Button>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">Display name</label>
            <Input 
              defaultValue="Jane" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 min-h-[44px]" 
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">Email</label>
            <Input 
              defaultValue="jsmith.mobbin2@gmail.com" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 min-h-[44px]" 
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">Country of Residence</label>
            <div className="relative">
              <select className="w-full h-11 min-h-[44px] rounded-md border border-white/10 bg-black/20 px-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                <option value="us" className="bg-zinc-900">🇺🇸 United States</option>
                <option value="jm" className="bg-zinc-900">🇯🇲 Jamaica</option>
                <option value="uk" className="bg-zinc-900">🇬🇧 United Kingdom</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">State of Residence</label>
            <div className="relative">
              <select className="w-full h-11 min-h-[44px] rounded-md border border-white/10 bg-black/20 px-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                <option value="ca" className="bg-zinc-900">California</option>
                <option value="ny" className="bg-zinc-900">New York</option>
                <option value="fl" className="bg-zinc-900">Florida</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Postcode */}
          <div className="space-y-2">
            <label className="text-sm-fluid font-semibold text-white/80">Postcode of Residence</label>
            <Input 
              defaultValue="94025" 
              className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 min-h-[44px]" 
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 md:pt-4">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-medium h-11 min-h-[44px] w-full sm:w-auto">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

