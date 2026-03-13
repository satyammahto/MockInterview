import { cn } from "@/lib/utils"

interface SectionHeaderProps {
    title: string
    description?: string
    children?: React.ReactNode // For actions like buttons
    className?: string
    align?: "left" | "center"
}

export function SectionHeader({
    title,
    description,
    children,
    className,
    align = "left",
}: SectionHeaderProps) {
    return (
        <div className={cn(
            "flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-[var(--component-gap)] pb-2",
            align === "center" && "text-center md:items-center",
            className
        )}>
            <div className={cn(align === "center" && "mx-auto")}>
                <h1 className="font-heading font-extrabold tracking-tight mb-1.5">{title}</h1>
                {description && (
                    <p className="text-muted-foreground text-sm max-w-[600px]">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    )
}
