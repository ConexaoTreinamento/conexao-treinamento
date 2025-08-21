"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Shield, User } from "lucide-react"
import Layout from "@/components/layout"

// Type definitions
interface AdministratorData {
  id: number
  name: string
  surname: string
  email: string
  phone?: string
  address?: string
  joinDate?: string
  permissions?: string[]
}

export default function AdministratorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [userRole, setUserRole] = useState<string>("")
  const [administratorData, setAdministratorData] = useState<AdministratorData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock administrators data - this should eventually be replaced with API calls
  const mockAdministrators: AdministratorData[] = [
    {
      id: 1,
      name: "Admin",
      surname: "Principal",
      email: "admin@gym.com",
      phone: "(11) 99999-0000",
      address: "Rua Principal, 100 - Centro, São Paulo",
      joinDate: "2023-01-01",
      permissions: ["Gerenciar Usuários", "Relatórios", "Configurações do Sistema", "Backup de Dados"]
    },
    {
      id: 2,
      name: "Maria",
      surname: "Administradora",
      email: "maria.admin@gym.com",
      phone: "(11) 88888-0000",
      address: "Av. Secundária, 200 - Vila Nova, São Paulo",
      joinDate: "2023-06-15",
      permissions: ["Gerenciar Usuários", "Relatórios"]
    },
    {
      id: 3,
      name: "João",
      surname: "Supervisor",
      email: "joao.supervisor@gym.com",
      phone: "(11) 77777-0000",
      address: "Rua dos Supervisores, 300 - Jardim das Flores, São Paulo",
      joinDate: "2024-01-10",
      permissions: ["Relatórios", "Configurações do Sistema"]
    }
  ]

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    // Redirect if not admin
    if (role !== "admin") {
      router.push("/schedule")
      return
    }

    // Simulate fetching administrator data based on ID
    const fetchAdministratorData = async () => {
      setLoading(true)
      try {
        // In a real application, this would be an API call
        // const response = await fetch(`/api/administrators/${params.id}`)
        // const data = await response.json()

        // For now, find the administrator from mock data
        const adminId = parseInt(params.id as string)
        const admin = mockAdministrators.find(a => a.id === adminId)

        if (admin) {
          setAdministratorData(admin)
        } else {
          // Handle administrator not found
          console.error('Administrator not found')
          router.push('/administrators')
        }
      } catch (error) {
        console.error('Error fetching administrator data:', error)
        router.push('/administrators')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAdministratorData()
    }
  }, [router, params.id])

  // Don't render if not admin
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
              onClick={() => router.push('/administrators')}
              className="mt-4"
            >
              Voltar para lista de administradores
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const fullName = `${administratorData.name} ${administratorData.surname}`
  const initials = `${administratorData.name.charAt(0)}${administratorData.surname.charAt(0)}`.toUpperCase()

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
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Administrador
                    </Badge>
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
                <p className="text-sm">{fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{administratorData.email}</p>
              </div>
              {administratorData.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{administratorData.phone}</p>
                </div>
              )}
              {administratorData.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="text-sm">{administratorData.address}</p>
                </div>
              )}
              {administratorData.joinDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Ingresso</label>
                  <p className="text-sm">{new Date(administratorData.joinDate).toLocaleDateString("pt-BR")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
