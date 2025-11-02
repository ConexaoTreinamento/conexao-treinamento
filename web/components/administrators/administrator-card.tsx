import { Calendar, Mail } from "lucide-react"
import { EntityCard, type EntityCardMetadataItem } from "@/components/base/entity-card"
import { StatusBadge } from "@/components/base/status-badge"
import { Badge } from "@/components/ui/badge"

export interface AdministratorCardData {
  id?: string
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  joinDate?: string | null
  active?: boolean | null
}

interface AdministratorCardProps {
  administrator: AdministratorCardData
  onOpen: () => void
}

const formatJoinDate = (joinDate?: string | null) => {
  if (!joinDate) {
    return "Cadastro não informado"
  }

  const parsed = new Date(joinDate)
  if (Number.isNaN(parsed.getTime())) {
    return "Cadastro não informado"
  }

  return `Cadastro em ${parsed.toLocaleDateString("pt-BR")}`
}

const getInitials = (administrator: AdministratorCardData) => {
  const source = administrator.fullName?.trim()
    || `${administrator.firstName ?? ""} ${administrator.lastName ?? ""}`.trim()
    || administrator.email
    || ""

  return source
    .split(" ")
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AD"
}

export function AdministratorCard({ administrator, onOpen }: AdministratorCardProps) {
  const fullName = administrator.fullName?.trim()
    || `${administrator.firstName ?? ""} ${administrator.lastName ?? ""}`.trim()
    || administrator.email
    || "Administrador"

  const metadata: EntityCardMetadataItem[] = [
    {
      icon: <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />,
      content: administrator.email ?? "Email não informado",
    },
  ]

  const infoRows = [
    <span key="join-date" className="text-muted-foreground">
      {formatJoinDate(administrator.joinDate)}
    </span>,
  ]

  const badges = [
    <StatusBadge key="status" active={Boolean(administrator.active)} />,
    <Badge key="role" variant="secondary" className="text-xs">
      Administrador
    </Badge>,
  ]

  return (
    <EntityCard
      title={fullName}
      avatar={{ label: getInitials(administrator) }}
      badges={badges}
      metadata={metadata}
      metadataColumns={1}
      infoRows={infoRows}
      onClick={onOpen}
      muted={!administrator.active}
    />
  )
}
