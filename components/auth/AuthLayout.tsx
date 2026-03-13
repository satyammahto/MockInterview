import React from "react"
import Link from "next/link"
import { BrainCircuit } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full min-h-screen bg-bg text-foreground flex flex-col md:flex-row font-sans">
            {/* Left Box (Branding) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-surface flex-col justify-between p-12 border-r border-border relative overflow-hidden">
                {/* Subtle gradient blob behind branding */}
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at top left, #4EFFA3 0%, transparent 45%), radial-gradient(circle at bottom right, #7B61FF 0%, transparent 50%)',
                        filter: 'blur(80px)'
                    }}
                />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-accent" />
                    </div>
                    <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                        PrepSense
                    </span>
                </div>

                <div className="relative z-10 mb-20 space-y-6">
                    <h1 className="font-heading text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                        Master your next <br /> tech interview <br /> <span className="text-accent">with AI.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
                        Upload your resume, practice real AI interviews, and get instant feedback.
                    </p>
                </div>
            </div>

            {/* Right Box (Form Content) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile header (hidden on desktop) */}
                <div className="md:hidden flex items-center gap-3 absolute top-8 left-8">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-heading font-bold text-xl text-white">
                        PrepSense
                    </span>
                </div>
                {children}
            </div>
        </div>
    )
}
