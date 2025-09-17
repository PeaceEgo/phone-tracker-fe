"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardOverview } from "@/components/dashboard-overview";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RealTimeTracking } from "@/components/realtime-tracking";
import { DashboardSidebar } from "@/components/sidebar";
import { DeviceRegistration } from "@/components/device-registration";
import LocationHistory from "@/components/location-history";
;




interface Position {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const newPositions = Array.from({ length: 15 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setPositions(newPositions);
  }, []);

  const sectionTitles = {
    overview: "Dashboard Overview",
    registration: "Device Registration",
    history: "Location History",
    tracking: "Real-time Tracking",
    notifications: "Notification Settings",
    settings: "Settings Panel",
  };

  const renderContent = () => {
    const components = {
      overview: <DashboardOverview />,
      registration: <DeviceRegistration />,
      history: <LocationHistory />,
      tracking: <RealTimeTracking />,
      // notifications: <NotificationSettings />,
      // settings: <SettingsPanel />,
    };

    return components[activeSection as keyof typeof components] || <DashboardOverview />;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black -z-10" />

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {positions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: pos.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: pos.delay,
            }}
          />
        ))}
      </div>

      <SidebarProvider defaultOpen={true}>
        <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        <SidebarInset className="relative bg-black">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10"
          >
            <div className="flex items-center justify-between p-6">
              <div>
                <motion.h1
                  className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent"
                  key={activeSection}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {sectionTitles[activeSection as keyof typeof sectionTitles]}
                </motion.h1>
                <motion.p
                  className="text-gray-400 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Manage your tracking dashboard
                </motion.p>
              </div>

              {/* Quick Actions */}
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="text-sm text-gray-400">System Online</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content */}
          <main className="relative min-h-screen bg-black">
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="relative z-10"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}