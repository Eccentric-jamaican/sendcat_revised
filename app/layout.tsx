import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "../components/providers/convex-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sendcat.com"),
  title: {
    default: "SendCat",
    template: "%s | SendCat",
  },
  description:
    "AI-powered shopping concierge and freight forwarding to Jamaica. Search US marketplaces, estimate total landed cost (shipping + duties), and ship with confidence.",
  applicationName: "SendCat",
  keywords: [
    "Jamaica shipping",
    "freight forwarding Jamaica",
    "ship to Jamaica",
    "total landed cost",
    "duties and GCT estimate",
    "AI shopping assistant",
    "US to Jamaica shipping",
    "online shopping Jamaica",
  ],
  openGraph: {
    type: "website",
    siteName: "SendCat",
    title: "SendCat",
    description:
      "AI-powered shopping concierge and freight forwarding to Jamaica. Search US marketplaces, estimate total landed cost (shipping + duties), and ship with confidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SendCat",
    description:
      "AI-powered shopping concierge and freight forwarding to Jamaica. Search US marketplaces, estimate total landed cost (shipping + duties), and ship with confidence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
