"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Smartphone, Menu, X } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"

interface HeaderProps {
  variant?: "landing" | "auth"
  showNavLinks?: boolean
}

export default function Header({ variant = "landing", showNavLinks = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore() 

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#pricing", label: "Pricing" },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

 
  const hasAccount = !!user?.id

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Link href="/" className="flex items-center space-x-2">
              <Smartphone className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                TrackGuard
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {showNavLinks && variant === "landing" && (
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-blue-400 transition-colors duration-200">
                  {link.label}
                </a>
              ))}
              
              {/* Conditionally render based on whether user has an account */}
              {isAuthenticated ? (
               
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent transition-all duration-200"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Logout
                  </Button>
                </>
              ) : hasAccount ? (
                // User has an account but is not logged in - show Login
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent transition-all duration-200"
                  >
                    Login
                  </Button>
                </Link>
              ) : (
                // User doesn't have an account - show Sign Up
                <Link href="/auth/signup">
                  <Button className="bg-blue-500 hover:bg-blue-600 transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Auth variant - minimal header */}
          {variant === "auth" && (
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                // User is logged in - show Dashboard and Logout
                <>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                  >
                    Logout
                  </Button>
                </>
              ) : hasAccount ? (
                // User has an account but is not logged in - show Login
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              ) : (
                // User doesn't have an account - show Sign Up
                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                  >
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4 border-t border-white/10">
            {showNavLinks && variant === "landing" && (
              <>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-2 hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-white/10">
                  {isAuthenticated ? (
                    // User is logged in - show Dashboard and Logout
                    <>
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full mb-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full text-gray-400 hover:text-white"
                      >
                        Logout
                      </Button>
                    </>
                  ) : hasAccount ? (
                    // User has an account but is not logged in - show Login
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                  ) : (
                    // User doesn't have an account - show Sign Up
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600">
                        Sign Up
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}

            {variant === "auth" && (
              <div className="space-y-3">
                {isAuthenticated ? (
                  // User is logged in - show Dashboard and Logout
                  <>
                    <Link
                      href="/dashboard"
                      className="block py-2 text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                    >
                      Logout
                    </Button>
                  </>
                ) : hasAccount ? (
                  // User has an account but is not logged in - show Login
                  <Link
                    href="/auth/login"
                    className="block py-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                ) : (
                  // User doesn't have an account - show Sign Up
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black bg-transparent"
                    >
                      Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}