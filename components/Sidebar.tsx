import Link from "next/link"
import { Home, FileText, BarChart2, Settings } from "lucide-react"

export function Sidebar() {
    const navItems = [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: FileText, label: "New Interview", href: "/upload" },
        { icon: BarChart2, label: "Reports", href: "/report" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ]

    return (
        <aside className="w-64 fixed left-0 top-[68px] bottom-0 border-r border-white/[0.05] p-5 flex flex-col gap-1 z-40" style={{ background: 'rgba(6, 8, 16, 0.95)', backdropFilter: 'blur(24px)' }}>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-3 py-2 mb-1">Navigation</div>
            <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-all duration-150 group"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-white/[0.06] transition-colors duration-150">
                            <item.icon className="w-4 h-4 group-hover:text-accent transition-colors duration-150" />
                        </div>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="rounded-xl p-4 relative overflow-hidden group cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, rgba(78,255,163,0.06) 0%, rgba(123,97,255,0.06) 100%)', border: '1px solid rgba(78,255,163,0.12)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(78,255,163,0.8)]" />
                            <div className="font-heading font-bold text-sm text-foreground">Pro Plan</div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Unlimited AI Interviews & Custom Resumes</p>
                        <button className="w-full text-xs font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 py-2 rounded-lg transition-all duration-150 hover:border-accent/40">
                            Upgrade →
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
