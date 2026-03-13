"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

export default function Navbar() {
    const pathname = usePathname()

    const links = [
        { name: "Features", href: "/#features" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Practice", href: "/upload" },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background/85 backdrop-blur-xl border-b border-border">
            <Link href="/" className="font-heading text-xl md:text-2xl font-extrabold text-foreground flex items-center gap-2 group">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent-1)] group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                PrepSense
            </Link>

            <div className="hidden md:flex items-center gap-8">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-foreground",
                            pathname === link.href ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <Button variant="outline" className="hidden sm:inline-flex font-heading font-semibold border-border hover:bg-surface">
                    Sign In
                </Button>
                <Button className="font-heading font-bold bg-accent text-black hover:bg-accent/90 hover:-translate-y-0.5 transition-transform hover:shadow-[0_8px_24px_rgba(78,255,163,0.3)]">
                    Get Started
                </Button>
            </div>
        </nav>
    )
}
