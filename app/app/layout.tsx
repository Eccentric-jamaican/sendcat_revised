import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"

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
    <AppShell>{children}</AppShell>
  )
}

