"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useSidebar } from "@/components/SidebarContext"

export default function Navbar() {
    const pathname = usePathname()
    const { toggle } = useSidebar()

    const isAuthPage = pathname?.startsWith("/auth")
    const isDashboard = !isAuthPage && pathname !== "/"

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-[68px] bg-background/80 backdrop-blur-xl border-b border-border">
            {/* Left: Hamburger (dashboard pages only) + Logo */}
            <div className="flex items-center gap-3">
                {isDashboard && (
                    <button
                        onClick={toggle}
                        aria-label="Toggle sidebar"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <Link href="/" className="flex items-center gap-2.5 select-none">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse-dot bg-primary shadow-[0_0_12px_var(--primary)]" />
                    <span className="font-heading text-xl font-extrabold text-foreground tracking-tight">
                        PrepSense
                    </span>
                </Link>
            </div>

            {/* Right: CTA — only on public/auth pages */}
            {!isDashboard && (
                <Link
                    href={isAuthPage ? "/auth/login" : "/auth/signup"}
                    className="font-heading font-bold text-sm px-6 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px bg-primary text-primary-foreground hover:opacity-90"
                >
                    {isAuthPage ? "Sign in" : "Try PrepSense →"}
                </Link>
            )}
        </nav>
    )
}
