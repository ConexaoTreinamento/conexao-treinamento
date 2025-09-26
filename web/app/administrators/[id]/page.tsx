"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield } from "lucide-react"
import Layout from "@/components/layout"
import { getAuthHeaders } from "../page"

interface AdministratorData {
  id: string
  firstName: string
  lastName: string
  email: string
  fullName: string
  joinDate: string
  active: boolean
}

export default function AdministratorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [userRole, setUserRole] = useState<string>("")
  const [administratorData, setAdministratorData] = useState<AdministratorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    if (role !== "admin") {
      router.push("/schedule")
      return
    }

    const fetchAdministratorData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:8080/administrators/${params.id}`, {headers: getAuthHeaders()})
        if (!response.ok) {
          throw new Error("Erro ao buscar administrador")
        }
        const data: AdministratorData = await response.json()
        setAdministratorData(data)
      } catch (error) {
        console.error("Erro ao buscar administrador:", error)
        router.push("/administrators")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAdministratorData()
    }
  }, [router, params.id])

  if (userRole !== "admin") {
    return null
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do administrador...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!administratorData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Administrador não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push("/administrators")}
              className="mt-4"
            >
              Voltar para lista de administradores
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const initials = `${administratorData.firstName.charAt(0)}${administratorData.lastName.charAt(0)}`.toUpperCase()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Perfil do Administrador</h1>
            <p className="text-muted-foreground">Informações detalhadas do administrador</p>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-2xl select-none">{initials}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold">{administratorData.fullName}</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Administrador
                    </Badge>
                    {!administratorData.active && (
                      <Badge variant="destructive">Inativo</Badge> //mudei, mas será que precisa aqui tambem?
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="text-sm">{administratorData.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{administratorData.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <p className="text-sm">{new Date(administratorData.joinDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
