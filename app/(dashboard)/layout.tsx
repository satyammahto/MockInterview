"use client"

import { Sidebar } from "@/components/Sidebar"
import { useSidebar } from "@/components/SidebarContext"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isOpen } = useSidebar()

    return (
        <div className="flex w-full min-h-[calc(100vh-68px)]">
            <Sidebar />
            <div
                className="flex-1 p-6 md:p-8 overflow-x-hidden transition-all duration-[250ms]"
                style={{ marginLeft: isOpen ? "240px" : "72px" }}
            >
                {children}
            </div>
        </div>
    )
}
