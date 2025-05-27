"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  namaPetugas: string | null
  login: (nama: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function toProperCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [namaPetugas, setNamaPetugas] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const storedName = localStorage.getItem("namaPetugas")
    if (storedName) {
      setNamaPetugas(storedName)
      setIsAuthenticated(true)
    }
  }, [])

  const login = (nama: string, password: string): boolean => {
    if (password === "db-ppwb") {
      const properCaseName = toProperCase(nama.trim())
      setNamaPetugas(properCaseName)
      setIsAuthenticated(true)
      localStorage.setItem("namaPetugas", properCaseName)
      return true
    }
    return false
  }

  const logout = () => {
    setNamaPetugas(null)
    setIsAuthenticated(false)
    localStorage.removeItem("namaPetugas")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ namaPetugas, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
}
