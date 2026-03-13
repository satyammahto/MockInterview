import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100vh-80px)]">
            <div className="hidden md:block w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 w-full bg-background md:pl-8 py-8 px-4 md:px-8">
                {children}
            </main>
        </div>
    )
}
