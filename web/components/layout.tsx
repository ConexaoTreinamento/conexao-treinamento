"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, BarChart3, Users, Calendar, UserCheck, Dumbbell, User, Sun, Moon, LogOut, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Image from "next/image"

const navigation = [
  { name: "Agenda", href: "/schedule", icon: Calendar },
  { name: "Alunos", href: "/students", icon: Users },
  { name: "Professores", href: "/teachers", icon: UserCheck, adminOnly: true },
  { name: "Administradores", href: "/administrators", icon: Shield, adminOnly: true },
  { name: "Exercícios", href: "/exercises", icon: Dumbbell },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Relatórios", href: "/reports", icon: BarChart3, adminOnly: true },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem("userRole") || "professor"
    const name = localStorage.getItem("userName") || "Professor"
    setUserRole(role)
    setUserName(name)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && userRole !== "admin") {
      return false
    }
    return true
  })

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky bg-background top-0 z-50">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <h1 className="text-lg font-semibold">Conexão Treinamento</h1>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <VisuallyHidden>
                <SheetTitle>Menu de Navegação</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <Image src="/logo.png" alt="Conexão Treinamento" width={32} height={32} className="rounded-lg" />
                    <h2 className="text-lg font-semibold">Conexão Treinamento</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname.startsWith(item.href)
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-4 border-t space-y-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start gap-3 px-3"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <div className="w-64 bg-card border-r min-h-screen">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/logo.png" alt="Conexão Treinamento" width={40} height={40} className="rounded-lg" />
              <h2 className="text-xl font-bold">Conexão Treinamento</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t space-y-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <User className="w-5 h-5" />
              Perfil
            </Link>
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full justify-start gap-3 px-3"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <main className="p-6">{children}</main>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
