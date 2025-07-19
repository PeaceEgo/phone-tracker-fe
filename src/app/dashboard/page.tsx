"use client"

import { useState } from "react"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DeviceRegistration } from "@/components/device-registration"
import { LocationHistory } from "@/components/location-history"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RealTimeTracking } from "@/components/realtime-tracking"
import { NotificationSettings } from "@/components/notification-settings"
import { SettingsPanel } from "@/components/setting-pannel"
import { DashboardSidebar } from "@/components/sidebar"

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState("overview")

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return <DashboardOverview />
            case "registration":
                return <DeviceRegistration />
            case "history":
                return <LocationHistory />
            case "tracking":
                return <RealTimeTracking />
            case "notifications":
                return <NotificationSettings />
            case "settings":
                return <SettingsPanel />
            default:
                return <DashboardOverview />
        }
    }

    return (
        <div className="min-h-screen text-white">
            <SidebarProvider defaultOpen={true}>
                <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
                <SidebarInset className="bg-gray-900">
                    <main className="flex-1 p-6 bg-gray-900 min-h-screen">
                        <div className="max-w-7xl mx-auto">{renderContent()}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
