import { EntityProfile, type EntityProfileMetadataItem } from "@/components/base/entity-profile"
import { StatusBadge } from "@/components/base/status-badge"
import type { AdministratorResponseDto } from "@/lib/api-client/types.gen"
import { Calendar, Mail } from "lucide-react"
import type { ReactNode } from "react"

interface AdministratorProfileSummaryCardProps {
  heading: string
  description?: string
  onBack: () => void
  administrator: AdministratorResponseDto
}

const getInitials = (administrator: AdministratorResponseDto) => {
  const first = administrator.firstName?.[0] ?? administrator.fullName?.[0]
  const last = administrator.lastName?.[0]

  return `${first ?? "?"}${last ?? ""}`.trim().toUpperCase() || "?"
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return null
  }

  try {
    return new Date(value).toLocaleDateString("pt-BR")
  } catch (error) {
    return null
  }
}

export function AdministratorProfileSummaryCard({
  heading,
  description,
  onBack,
  administrator,
}: AdministratorProfileSummaryCardProps) {
  const isActive = administrator.active ?? true
  const initials = getInitials(administrator)

  const fallbackName = `${administrator.firstName ?? ""} ${administrator.lastName ?? ""}`.trim()
  const displayName = administrator.fullName ?? (fallbackName || "Administrador")

  const metadata: EntityProfileMetadataItem[] = [
    {
      icon: <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: administrator.email ?? "Sem e-mail",
    },
  ]

  const createdAt = administrator.createdAt ?? (administrator as { joinDate?: string }).joinDate ?? null
  const infoRows: ReactNode[] = []

  const createdAtLabel = formatDate(createdAt)
  if (createdAtLabel) {
    infoRows.push(
      <span key="created-at" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs">Criado em {createdAtLabel}</span>
      </span>,
    )
  }

  const badges: ReactNode[] = [
    <StatusBadge key="status" active={isActive} />,
  ]

  return (
    <EntityProfile
      heading={heading}
      description={description}
      onBack={onBack}
      title={displayName}
      subtitle={administrator.email ?? undefined}
      avatar={{ label: initials || "?", backgroundClassName: "bg-blue-100 dark:bg-blue-900", textClassName: "text-blue-700 dark:text-blue-300" }}
      badges={badges}
      metadata={metadata}
      infoRows={infoRows}
      muted={!isActive}
    />
  )
}
