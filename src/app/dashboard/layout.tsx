"use client"
import ProtectedRoute from '@/components/protected-route'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}