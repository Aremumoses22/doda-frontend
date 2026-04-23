import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Doda Legal Practitioners — Business Law for Nigerian Founders & SMEs",
  description:
    "Legal structure, compliance, and transaction support that enables businesses to launch, operate, and grow — without legal blind spots.",
  keywords: [
    "business lawyer Nigeria",
    "startup legal advisor Lagos",
    "contract drafting Nigeria",
    "CAC registration lawyers",
    "SME legal support Nigeria",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
