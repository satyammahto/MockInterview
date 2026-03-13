import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/Navbar'

// Load fonts from Google Fonts directly in the layout
export const metadata: Metadata = {
  title: 'PrepSense — AI Mock Interview Platform',
  description: 'AI-powered mock interviews, resume analysis, and real-time feedback designed for modern careers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased selection:bg-accent/30 selection:text-accent-foreground min-h-screen flex flex-col pt-20">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 block h-full w-full">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
