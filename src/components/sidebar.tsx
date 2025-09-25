"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Smartphone, MapPin, Radio, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import Link from "next/link"

interface DashboardSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function DashboardSidebar({ activeSection, setActiveSection }: DashboardSidebarProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const menuItems = [
    { id: "overview", title: "Overview", icon: LayoutDashboard },
    { id: "registration", title: "Device Registration", icon: Smartphone },
    { id: "tracking", title: "Real-time Tracking", icon: Radio },
    { id: "history", title: "Location History", icon: MapPin },
  ]

  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("auth-storage") 
    logout()
    router.push("/auth/login")
  }

  const handleMenuItemClick = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMobileSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Header Bar - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 h-16">
        <div className="flex items-center justify-between p-4 h-full">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                TrackGuard
              </h2>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30 }}
              className="md:hidden fixed left-0 top-0 h-full w-80 bg-black/95 border-r border-white/10 backdrop-blur-xl z-50"
            >
              <div className="p-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileSidebarOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                        TrackGuard
                      </h2>
                      <p className="text-xs text-gray-400">Dashboard</p>
                    </div>
                  </Link>
                </div>

                {/* Navigation */}
                <div className="space-y-2 flex-1">
                  <p className="text-gray-400 text-xs uppercase tracking-wider px-2 mb-4">Navigation</p>
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white"
                          : "hover:bg-white/5 text-gray-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  ))}
                </div>

                {/* User & Logout */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name || "Guest"}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      handleLogout()
                      setIsMobileSidebarOpen(false)
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-black/20 border-r border-white/10 h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                TrackGuard
              </h2>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider px-2 mb-4">Navigation</p>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white"
                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Guest"}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}