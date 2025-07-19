"use client"

import { LayoutDashboard, Smartphone, MapPin, Radio, Bell, Settings, Shield } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
    {
        id: "overview",
        title: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        id: "registration",
        title: "Device Registration",
        icon: Smartphone,
    },
    {
        id: "history",
        title: "Location History",
        icon: MapPin,
    },
    {
        id: "tracking",
        title: "Real-time Tracking",
        icon: Radio,
    },
    {
        id: "notifications",
        title: "Notifications",
        icon: Bell,
    },
    {
        id: "settings",
        title: "Settings",
        icon: Settings,
    },
]

interface DashboardSidebarProps {
    activeSection: string
    setActiveSection: (section: string) => void
}

export function DashboardSidebar({ activeSection, setActiveSection }: DashboardSidebarProps) {
    return (
        <Sidebar className="border-r border-gray-700 ">
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-pink-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Phone Tracker</h1>
                        <p className="text-sm text-gray-400">Security Dashboard</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                onClick={() => setActiveSection(item.id)}
                                isActive={activeSection === item.id}
                                className={`w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ${activeSection === item.id ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white" : ""
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <div className="text-center text-xs text-gray-500">© 2024 Phone Tracker Pro</div>
            </SidebarFooter>
        </Sidebar>
    )
}
