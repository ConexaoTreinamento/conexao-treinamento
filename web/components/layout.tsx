"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Users, Calendar, Activity, BarChart3, Settings, Menu, Sun, Moon, LogOut, Dumbbell, UserPlus, CalendarPlus, Trophy } from 'lucide-react'
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
    setUserName(name || "")
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard"
    },
    {
      name: "Alunos",
      href: "/students",
      icon: Users,
      current: pathname.startsWith("/students")
    },
    {
      name: "Agenda",
      href: "/schedule",
      icon: Calendar,
      current: pathname.startsWith("/schedule")
    },
    {
      name: "Exercícios",
      href: "/exercises",
      icon: Activity,
      current: pathname.startsWith("/exercises")
    },
    {
      name: "Eventos",
      href: "/events",
      icon: Trophy,
      current: pathname.startsWith("/events")
    },
    {
      name: "Relatórios",
      href: "/reports",
      icon: BarChart3,
      current: pathname.startsWith("/reports")
    }
  ]

  // Add admin-only navigation items
  if (userRole === "admin") {
    navigation.splice(2, 0, {
      name: "Professores",
      href: "/teachers",
      icon: UserPlus,
      current: pathname.startsWith("/teachers")
    })
  }

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            item.current
              ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </>
  )

  if (!userRole) return null

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-card border-r">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FitManager</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItems />
          </nav>

          {/* Settings */}
          <div className="px-4 py-4 border-t">
            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Bar */}
        <header className="bg-card border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 sm:w-80">
                <div className="flex flex-col h-full">
                  {/* Logo */}
                  <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">FitManager</span>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItems />
                  </nav>

                  {/* Settings */}
                  <div className="px-4 py-4 border-t">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative border border-border/40 hover:border-border"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        {userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
