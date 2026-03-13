import React from "react"
import { cn } from "@/lib/utils"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export function InputField({ label, error, className, ...props }: InputFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">
                {label}
            </label>
            <input
                className={cn(
                    "w-full rounded-xl px-4 py-3.5 text-sm bg-surface transition-all duration-200 outline-none",
                    error
                        ? "border-destructive/50 border bg-destructive/5 focus:border-destructive focus:ring-4 focus:ring-destructive/10"
                        : "border-border/50 border focus:border-accent focus:ring-4 focus:ring-accent/10 placeholder:text-muted-foreground",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-xs text-destructive font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    )
}
