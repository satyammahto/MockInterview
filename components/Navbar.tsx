"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LogOut } from "lucide-react"
import { useSidebar } from "@/components/SidebarContext"

export default function Navbar() {
    const { toggle } = useSidebar()
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith("/auth")

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl h-[68px]">
            <div className="h-full px-[var(--container-padding)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {!isAuthPage && (
                        <button
                            onClick={toggle}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all lg:transition-none"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-heading font-black text-primary-foreground text-lg group-hover:scale-110 transition-transform">
                            P
                        </div>
                        <span className="font-heading font-extrabold text-[20px] tracking-tight">PrepSense</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {pathname === "/" ? (
                        <Link
                            href="/auth/login"
                            className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-heading font-bold text-sm hover:bg-muted transition-all"
                        >
                            Sign In
                        </Link>
                    ) : !isAuthPage ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    localStorage.clear()
                                    sessionStorage.clear()
                                    window.location.href = "/auth/login"
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    )
}
