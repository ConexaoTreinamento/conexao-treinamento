"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { AdministratorProfileSummaryCard } from "@/components/administrators/profile/profile-summary-card"
import { useQuery } from "@tanstack/react-query"
import { findAdministratorByIdOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export default function AdministratorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  // Usando React Query
  const { data: administratorData, isLoading, error } = useQuery({
    ...findAdministratorByIdOptions({
      client: apiClient,
      path: { id: params.id as string }
    }),
    enabled: !!params.id && userRole === "admin"
  })

  if (userRole !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do administrador...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !administratorData) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">Administrador não encontrado</p>
            <Button variant="outline" onClick={() => router.push("/administrators")} className="mt-4">
              Voltar para lista de administradores
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <AdministratorProfileSummaryCard
          heading="Perfil do Administrador"
          description="Informações detalhadas do administrador"
          onBack={() => router.back()}
          administrator={administratorData}
        />
      </div>
    </Layout>
  )
}
