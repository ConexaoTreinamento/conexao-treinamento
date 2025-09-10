"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useMutation } from "@tanstack/react-query"
import { loginMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { customApiClient } from "@/lib/custom-api-client"

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { mutateAsync: login, isPending: isLoading } = useMutation(loginMutation());

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (userRole) {
      router.push("/schedule")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login logic
    const result = await login({
      body: { email, password }, client: customApiClient, security: [
        {
          type: "http",
          scheme: "bearer",
          in: "header",
        }
      ]
    });
    const payload = getJWTTokenPayload(result.token!)
    if (payload.role && result.token) {
      localStorage.setItem("userRole", getRoleName(payload.role))
      localStorage.setItem("token", result.token)
      router.push("/schedule")
    }
  }

  function getJWTTokenPayload(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(escape(window.atob(base64)));
    return JSON.parse(jsonPayload);
  }

  function getRoleName(role: string) {
    switch (role) {
      case "ROLE_ADMIN":
        return "admin"
      case "ROLE_TRAINER":
        return "professor"
    }
    throw new Error("Invalid role")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <Image src="/logo.svg" alt="Conexão Treinamento" width={64} height={64} className="rounded-lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Conexão Treinamento</CardTitle>
            <CardDescription>Sistema de Gerenciamento da Academia</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
