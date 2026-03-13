"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Start Mock", href: "/upload" },
    { name: "Interview", href: "/interview" },
    { name: "Report", href: "/report" },
]

export default function Navbar() {
    const pathname = usePathname()

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[68px]"
            style={{
                background: 'rgba(8, 11, 20, 0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid #1E2535',
            }}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 select-none">
                <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
                    style={{ background: '#4EFFA3', boxShadow: '0 0 12px #4EFFA3' }}
                />
                <span className="font-heading text-xl font-extrabold text-foreground tracking-tight">
                    PrepSense
                </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            pathname === link.href
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <Link
                href="/upload"
                className="font-heading font-bold text-sm text-black px-6 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px"
                style={{
                    background: '#4EFFA3',
                    boxShadow: '0 0 0 0 transparent',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(78,255,163,0.3)'
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 transparent'
                }}
            >
                Start Free Mock →
            </Link>
        </nav>
    )
}
