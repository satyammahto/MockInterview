import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/Navbar'
import { Toaster } from "@/components/ui/toaster"
import NavDots from '@/components/NavDots'

export const metadata: Metadata = {
  title: 'PrepSense — AI Mock Interview Platform',
  description: 'Upload your resume, practice with a real voice interview, and get detailed feedback that actually helps you improve.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col pt-[68px] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Toaster />
          <NavDots />
        </ThemeProvider>
      </body>
    </html>
  )
}
