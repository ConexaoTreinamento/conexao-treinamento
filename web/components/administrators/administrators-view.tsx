"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/base/page-header"
import { FilterToolbar } from "@/components/base/filter-toolbar"
import { AdministratorCard } from "@/components/administrators/administrator-card"
import { AdministratorCreateDialog } from "@/components/administrators/administrator-create-dialog"
import { EmptyState } from "@/components/base/empty-state"
import { Section } from "@/components/base/section"
import { EntityList } from "@/components/base/entity-list"
import { Skeleton } from "@/components/ui/skeleton"
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

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = admin.fullName || `${admin.firstName} ${admin.lastName}`
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalAdministrators = administrators.length

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando administradores..."
    }

    if (error) {
      return "Não foi possível carregar os administradores."
    }

    if (!totalAdministrators) {
      return "Nenhum administrador cadastrado ainda."
    }

    if (!filteredAdministrators.length) {
      return "Ajuste a busca para encontrar administradores."
    }

    if (filteredAdministrators.length === totalAdministrators && !searchTerm) {
      return `${filteredAdministrators.length} administradores cadastrados`
    }

    return `${filteredAdministrators.length} de ${totalAdministrators} administradores exibidos`
  }, [error, filteredAdministrators.length, isLoading, searchTerm, totalAdministrators])

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

      <Section title="Resultados" description={resultsSummary}>
        {isLoading ? (
          <EntityList>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </EntityList>
        ) : null}

        {!isLoading && error ? (
          <EmptyState
            title="Erro ao carregar administradores"
            description="Não foi possível carregar os administradores. Tente novamente mais tarde."
          />
        ) : null}

        {!isLoading && !error && !filteredAdministrators.length ? (
          <EmptyState
            title="Nenhum administrador encontrado"
            description="Ajuste os filtros ou utilize outro termo de busca."
          />
        ) : null}

        {!isLoading && !error && filteredAdministrators.length ? (
          <EntityList>
            {filteredAdministrators.map((administrator, index) => {
              const key = administrator.id || administrator.email || administrator.fullName || `administrator-${index}`
              return (
                <AdministratorCard
                  key={key}
                  administrator={administrator}
                  onOpen={() => {
                    if (administrator.id) {
                      router.push(`/administrators/${administrator.id}`)
                    }
                  }}
                />
              )
            })}
          </EntityList>
        ) : null}
      </Section>
    </div>
  )
}
