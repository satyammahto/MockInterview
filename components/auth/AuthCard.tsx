import React from "react"

export function AuthCard({ children, title, description }: { children: React.ReactNode, title: string, description?: string }) {
    return (
        <div 
            className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10"
            style={{
                background: 'rgba(14, 18, 32, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 24px 80px -12px rgba(0,0,0,0.5)'
            }}
        >
            <h2 className="font-heading text-2xl sm:text-[28px] font-extrabold tracking-tight text-white mb-2">
                {title}
            </h2>
            {description && (
                <p className="text-sm text-muted-foreground mb-8">
                    {description}
                </p>
            )}
            {!description && <div className="mb-8" />}
            {children}
        </div>
    )
}
