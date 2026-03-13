import { cn } from "@/lib/utils"

interface PageContainerProps {
    children: React.ReactNode
    className?: string
    maxWidth?: "standard" | "narrow" | "wide"
}

export function PageContainer({
    children,
    className,
    maxWidth = "standard",
}: PageContainerProps) {
    const maxWidthClasses = {
        standard: "max-w-[1280px]",
        narrow: "max-w-[800px]",
        wide: "max-w-[1440px]",
    }

    return (
        <div className={cn(
            "w-full mx-auto px-[var(--container-padding)] pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500",
            maxWidthClasses[maxWidth],
            className
        )}>
            {children}
        </div>
    )
}
