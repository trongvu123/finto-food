import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider } from "@/contexts/cart-context"
import { ChatBot } from "@/components/chat-bot"
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import AppProvider from "@/components/app-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finto - Thức ăn thú cưng chất lượng cao",
  description: "Cửa hàng thức ăn thú cưng chất lượng cao dành cho chó và mèo",
  icons: {
    icon: '/favicon-v1.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <Header />
              <AppProvider>
                <main className="flex-1">{children}</main>
              </AppProvider>
              <Toaster />
              <Footer />
            </div>
          </ThemeProvider>
        </CartProvider>
        <ChatBot />
      </body>
    </html>
  )
}
