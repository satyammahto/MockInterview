export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full min-h-[calc(100vh-68px)]">
            {children}
        </div>
    )
}
