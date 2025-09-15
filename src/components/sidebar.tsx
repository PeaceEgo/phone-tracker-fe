"use client"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Smartphone, MapPin, Radio, Bell, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"

interface DashboardSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function DashboardSidebar({ activeSection, setActiveSection }: DashboardSidebarProps) {
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

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader className="border-b border-white/10">
        <motion.div
          className="flex items-center space-x-2 p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              TrackGuard
            </h2>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="bg-black/20">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuButton
                      onClick={() => setActiveSection(item.id)}
                      isActive={activeSection === item.id}
                      className={`
                        w-full justify-start p-3 rounded-lg transition-all duration-200 group
                        ${
                          activeSection === item.id
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white"
                            : "hover:bg-white/5 text-gray-300 hover:text-white"
                        }
                      `}
                    >
                      <item.icon
                        className={`w-5 h-5 mr-3 transition-colors ${
                          activeSection === item.id
                            ? "text-blue-400"
                            : "text-gray-400 group-hover:text-blue-400"
                        }`}
                      />
                      <span className="font-medium">{item.title}</span>
                      {activeSection === item.id && (
                        <motion.div
                          className="w-2 h-2 bg-blue-400 rounded-full ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={user?.id || "guest"}
                  className="text-sm font-medium text-white truncate"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {user?.name || "Guest"}
                </motion.p>
              </AnimatePresence>
              {/* <p className="text-xs text-gray-400">
                {user ? "Premium Plan" : "Not signed in"}
              </p> */}
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
        </motion.div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
