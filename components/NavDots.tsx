"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const pages = [
    { name: "Home", href: "/" },
    { name: "Setup", href: "/upload" },
    { name: "Interview", href: "/interview" },
    { name: "Report", href: "/report" },
    { name: "Architecture", href: "/architecture" },
]

export default function NavDots() {
    const pathname = usePathname()

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-4 py-2.5 rounded-full"
            style={{
                background: 'rgba(14,18,32,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid #1E2535',
            }}
        >
            {pages.map((page) => {
                const isActive = pathname === page.href
                return (
                    <Link
                        key={page.href}
                        href={page.href}
                        title={page.name}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            isActive ? "w-6 h-2" : "w-2 h-2"
                        )}
                        style={{
                            background: isActive ? '#4EFFA3' : '#1E2535',
                        }}
                    />
                )
            })}
        </div>
    )
}
