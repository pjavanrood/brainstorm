import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/Nav"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Brainstorm — Startup Ideas",
  description: "Share and evaluate early-stage startup ideas.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-base text-ink min-h-screen">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
