"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, User, Bell, Shield, LogOut } from "lucide-react"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Security", icon: Shield },
    ]

    const panelStyle: React.CSSProperties = {
        background: 'rgba(10,14,26,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-400 pb-20">
            <div>
                <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-1.5">Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your account preferences and application settings.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Nav */}
                <aside className="w-full md:w-56 shrink-0">
                    <nav className="flex flex-col gap-0.5">
                        {tabs.map((tab, i) => (
                            <button
                                key={tab.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left"
                                style={i === 1
                                    ? { background: 'rgba(78,255,163,0.08)', border: '1px solid rgba(78,255,163,0.18)', color: 'var(--accent-1)' }
                                    : { background: 'transparent', border: '1px solid transparent', color: 'var(--muted-foreground)' }
                                }
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Settings Content */}
                <div className="flex-1 space-y-5">
                    <div className="rounded-2xl p-7" style={panelStyle}>
                        <h2 className="font-heading text-lg font-bold mb-7 tracking-tight">Appearance</h2>

                        <div className="space-y-7">
                            <div>
                                <label className="text-sm font-bold text-foreground mb-4 block">Theme Preference</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-150 hover:-translate-y-px"
                                        style={theme === 'light'
                                            ? { border: '2px solid rgba(78,255,163,0.5)', background: 'rgba(78,255,163,0.05)' }
                                            : { border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)' }
                                        }
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <Sun className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">Light</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-150 hover:-translate-y-px"
                                        style={theme === 'dark'
                                            ? { border: '2px solid rgba(78,255,163,0.5)', background: 'rgba(78,255,163,0.05)' }
                                            : { border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)' }
                                        }
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <Moon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">Dark</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme("system")}
                                        className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-150 hover:-translate-y-px"
                                        style={theme === 'system'
                                            ? { border: '2px solid rgba(78,255,163,0.5)', background: 'rgba(78,255,163,0.05)' }
                                            : { border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)' }
                                        }
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                            <Monitor className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">System</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                <label className="text-sm font-bold text-foreground mb-1 block">Reduce Motion</label>
                                <p className="text-xs text-muted-foreground mb-4">Disable animations and page transitions.</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-10 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl p-7" style={{ background: 'rgba(255,107,107,0.03)', border: '1px solid rgba(255,107,107,0.15)' }}>
                        <h2 className="font-heading text-base font-bold text-destructive mb-2 flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-muted-foreground mb-5">Permanently delete your account and all associated interview data.</p>
                        <button className="px-5 py-2 font-heading font-bold text-sm rounded-lg transition-all duration-150 hover:-translate-y-px" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', color: 'var(--accent-3)' }}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
