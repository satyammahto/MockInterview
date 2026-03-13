"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, User, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Security", icon: Shield },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Nav */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-col gap-1">
                        {tabs.map((tab, i) => (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${i === 1
                                        ? "bg-accent/10 text-accent border border-accent/20"
                                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Settings Content */}
                <div className="flex-1 space-y-8">
                    <div className="bg-surface border border-border rounded-3xl p-8">
                        <h2 className="font-heading text-xl font-bold mb-6">Appearance</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-foreground mb-3 block">Theme Preference</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 bg-background'}`}
                                    >
                                        <Sun className="w-6 h-6" />
                                        <span className="text-sm font-medium">Light</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 bg-background'}`}
                                    >
                                        <Moon className="w-6 h-6" />
                                        <span className="text-sm font-medium">Dark</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("system")}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 bg-background'}`}
                                    >
                                        <Monitor className="w-6 h-6" />
                                        <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <label className="text-sm font-bold text-foreground mb-1 block">Reduce Motion</label>
                                <p className="text-xs text-muted-foreground mb-4">Disable animations and page transitions.</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8">
                        <h2 className="font-heading text-xl font-bold text-destructive mb-2 flex items-center gap-2">
                            Danger Zone
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Permanently delete your account and all associated interview data.</p>
                        <button className="px-6 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 font-bold text-sm rounded-lg hover:bg-destructive hover:text-white transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
