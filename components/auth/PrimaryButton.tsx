import React from "react"
import { Loader2 } from "lucide-react"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    children: React.ReactNode
}

export function PrimaryButton({ loading, children, ...props }: PrimaryButtonProps) {
    return (
        <button
            disabled={loading || props.disabled}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-[15px] text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px]"
            style={{
                background: '#4EFFA3',
                boxShadow: '0 4px 14px rgba(78, 255, 163, 0.25)'
            }}
            {...props}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
        </button>
    )
}
