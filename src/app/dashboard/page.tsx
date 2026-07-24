"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardOverview } from "@/components/dashboard-overview";
import { RealTimeTracking } from "@/components/realtime-tracking";
import { DashboardSidebar } from "@/components/sidebar";
import { DeviceRegistration } from "@/components/device-registration";
import LocationHistory from "@/components/location-history";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sectionTitles = {
    overview: "Dashboard Overview",
    registration: "Device Registration",
    history: "Location History",
    tracking: "Real-time Tracking",
  };

  const renderContent = () => {
    const components = {
      overview: <DashboardOverview />,
      registration: <DeviceRegistration />,
      history: <LocationHistory />,
      tracking: <RealTimeTracking />,
    };

    return components[activeSection as keyof typeof components] || <DashboardOverview />;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black -z-10" />

      <div className="flex h-screen">
        <DashboardSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="sr-only">
                  {sectionTitles[activeSection as keyof typeof sectionTitles]}
                </h1>
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
