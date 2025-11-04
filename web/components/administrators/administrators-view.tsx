"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/base/page-header"
import { FilterToolbar } from "@/components/base/filter-toolbar"
import { AdministratorList } from "@/components/administrators/administrator-list"
import { AdministratorCreateDialog } from "@/components/administrators/administrator-create-dialog"
import { apiClient } from "@/lib/client"
import type { ListAdministratorsDto } from "@/lib/api-client"
import { findAllAdministratorsOptions } from "@/lib/api-client/@tanstack/react-query.gen"

export function AdministratorsView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  const administratorsQuery = useQuery({
    ...findAllAdministratorsOptions({ client: apiClient }),
    enabled: userRole === "admin",
  })
  const administrators = (administratorsQuery.data as ListAdministratorsDto[] | undefined) ?? []
  const { isLoading, error } = administratorsQuery

  const handleAdministratorOpen = (administrator: ListAdministratorsDto) => {
    if (administrator.id) {
      router.push(`/administrators/${administrator.id}`)
    }
  }

  if (userRole !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Administradores" description="Gerencie todos os administradores do sistema" />
        <AdministratorCreateDialog onCreated={() => { void administratorsQuery.refetch() }} />
      </div>

      <FilterToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome ou email..."
        searchLabel="Buscar administradores"
      />

      <AdministratorList
        administrators={administrators}
        searchTerm={searchTerm}
        isLoading={isLoading}
        error={error}
        onAdministratorOpen={handleAdministratorOpen}
      />
    </div>
  )
}
