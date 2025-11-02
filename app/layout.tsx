import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Chatbot from "@/components/Chatbot"

const inter = Inter({ subsets: ["latin"] })

// Simplified Metadata: Only basic title and description remain.
export const metadata: Metadata = {
  title: "ResiGo",
  description: "Taxi service",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/resi_go.jpeg" />
        
        {/* Preconnect links kept as they relate to fonts and performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Chatbot />
      </body>
    </html>
  )
}