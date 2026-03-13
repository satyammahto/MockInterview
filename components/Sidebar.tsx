"use client"

import { useRef, useCallback, useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, BarChart2, Settings, Mic, LogOut, X, ChevronRight } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { useSidebar } from "@/components/SidebarContext"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Mic, label: "New Interview", href: "/upload" },
    { icon: FileText, label: "Resume Analyzer", href: "/resume-analyzer" },
    { icon: BarChart2, label: "Reports", href: "/report" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const { isOpen, toggle, close } = useSidebar()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleLogout = async () => {
        localStorage.clear()
        sessionStorage.clear()
        await logoutAction()
    }

    const handleMouseLeave = useCallback(() => {
        collapseTimer.current = setTimeout(() => {
            close()
        }, 2500)
    }, [close])

    const handleMouseEnter = useCallback(() => {
        if (collapseTimer.current) {
            clearTimeout(collapseTimer.current)
            collapseTimer.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            if (collapseTimer.current) clearTimeout(collapseTimer.current)
        }
    }, [])

    // Collapse on route change
    useEffect(() => {
        close()
    }, [pathname, close])

    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-[68px] bottom-0 z-40 flex flex-col",
                    "border-r border-border bg-card/95 backdrop-blur-2xl",
                    "transition-all duration-[200ms] ease-in-out overflow-hidden",
                    isOpen ? "w-60" : "w-[72px]"
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex-1 py-6 px-3 flex flex-col gap-0.5 overflow-hidden">
                    <div className={cn(
                        "text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-3 pb-3 mb-1 whitespace-nowrap",
                        "transition-opacity duration-200",
                        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}>
                        Navigation
                    </div>

                    <nav className="flex flex-col gap-1.5 focus-within:ring-0">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={!isOpen ? item.label : undefined}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl text-[14px] font-semibold transition-all duration-150 group relative",
                                        "h-11 px-2.5",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    )}
                                >
                                    {/* Active border indicator */}
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                    )}
                                    
                                    <div className={cn(
                                        "w-8 h-8 flex-shrink-0 flex items-center justify-center transition-colors",
                                        isActive ? "text-primary" : "group-hover:text-foreground text-muted-foreground/80"
                                    )}>
                                        <item.icon className="w-[18px] h-[18px]" />
                                    </div>

                                    <span className={cn(
                                        "whitespace-nowrap overflow-hidden transition-all duration-200",
                                        isOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="px-3 py-6 border-t border-border mt-auto">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        title={!isOpen ? "Log out" : undefined}
                        className="flex w-full items-center gap-3 h-11 px-2.5 rounded-xl text-[14px] font-semibold transition-all group hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center transition-colors">
                            <LogOut className="w-[18px] h-[18px]" />
                        </div>
                        <span className={cn(
                            "whitespace-nowrap overflow-hidden transition-all duration-200",
                            isOpen ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
                        )}>
                            Log out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-heading text-lg font-bold">Sign out?</h3>
                            <button onClick={() => setShowLogoutConfirm(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                            Are you sure you want to log out of PrepSense? You&apos;ll need to sign in again to access your interviews.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all">
                                Cancel
                            </button>
                            <button onClick={handleLogout} className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20">
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
