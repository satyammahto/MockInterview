"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, User, Bell, Shield, LogOut } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { SectionHeader } from "@/components/layout/SectionHeader"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()

    const tabs = [
        { id: "appearance", label: "Appearance", icon: Sun, active: true },
        { id: "account", label: "Account", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Security", icon: Shield },
    ]

    return (
        <PageContainer maxWidth="narrow">
            <SectionHeader 
                title="Settings" 
                description="Manage your account preferences and application settings."
            />

            <div className="flex flex-col md:flex-row gap-[var(--section-gap)]">
                {/* Settings Nav */}
                <aside className="w-full md:w-48 shrink-0">
                    <nav className="flex flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 text-left ${
                                    tab.active 
                                    ? "bg-primary/10 text-primary border border-primary/20" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Settings Content */}
                <div className="flex-1 space-y-6">
                    <div className="rounded-[24px] p-8 bg-card border border-border shadow-sm">
                        <header className="mb-8">
                            <h2 className="font-heading text-lg font-black tracking-tight mb-1">Appearance</h2>
                            <p className="text-xs text-muted-foreground">Customize how PrepSense looks on your device.</p>
                        </header>

                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-4 block">Theme Preference</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-150 hover:-translate-y-px border-2 text-center group ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/40'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-primary/20' : 'bg-card group-hover:bg-muted'}`}>
                                            <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : ''}`} />
                                        </div>
                                        <span className="text-sm font-bold">Light</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-150 hover:-translate-y-px border-2 text-center group ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/40'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-primary/20' : 'bg-card group-hover:bg-muted'}`}>
                                            <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : ''}`} />
                                        </div>
                                        <span className="text-sm font-bold">Dark</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("system")}
                                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-150 hover:-translate-y-px border-2 text-center group ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/40'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${theme === 'system' ? 'bg-primary/20' : 'bg-card group-hover:bg-muted'}`}>
                                            <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-primary' : ''}`} />
                                        </div>
                                        <span className="text-sm font-bold">System</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border flex items-center justify-between">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-foreground block">Reduce Motion</label>
                                    <p className="text-xs text-muted-foreground">Simplify animations and transitions.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-[24px] p-8 bg-destructive/5 border border-destructive/10">
                        <h2 className="font-heading text-lg font-black text-destructive mb-2 flex items-center gap-2">
                            Danger Zone
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">Permanently delete your account and all associated interview data. This action cannot be undone.</p>
                        <button className="px-6 py-3 bg-card border border-destructive/20 text-destructive font-heading font-black text-sm rounded-xl transition-all duration-150 hover:bg-destructive hover:text-white shadow-sm active:scale-95">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
