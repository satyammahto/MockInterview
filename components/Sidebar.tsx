import Link from "next/link"
import { Home, Mic, FileText, BarChart2, Settings } from "lucide-react"

export function Sidebar() {
    const navItems = [
        { icon: Home, label: "Dashboard", href: "/dashboard" },
        { icon: Mic, label: "New Interview", href: "/upload" },
        { icon: FileText, label: "Resume Analyzer", href: "/resume-analyzer" },
        { icon: BarChart2, label: "Reports", href: "/report" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ]

    return (
        <aside className="w-64 fixed left-0 top-20 bottom-0 bg-surface2 border-r border-border p-6 flex flex-col gap-2 z-40">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Menu</div>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-all group"
                    >
                        <item.icon className="w-5 h-5 group-hover:text-accent transition-colors" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="font-heading font-bold text-sm mb-1">Pro Plan</div>
                    <p className="text-xs text-muted-foreground mb-3">Unlimited AI Interviews & Custom Resumes</p>
                    <button className="w-full text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-lg transition-colors">
                        Upgrade
                    </button>
                </div>
            </div>
        </aside>
    )
}
