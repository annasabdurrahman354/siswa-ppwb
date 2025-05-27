"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { namaPetugas, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <header className="bg-gradient-to-r from-primary-800 to-primary-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Siswa PPWB</h1>
              <div className="flex items-center gap-2 text-primary-100">
                <User className="h-4 w-4" />
                <span className="text-sm">Petugas: {namaPetugas}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-white text-white hover:bg-white hover:text-primary-800 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
