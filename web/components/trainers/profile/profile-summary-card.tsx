import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { EditButton } from "@/components/base/edit-button"
import { EntityProfile, type EntityProfileMetadataItem } from "@/components/base/entity-profile"
import { StatusBadge } from "@/components/base/status-badge"
import type { TrainerResponseDto } from "@/lib/api-client/types.gen"
import { Calendar, CalendarDays, Clock, Mail, MapPin, Phone, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TrainerProfileSummaryCardProps {
  heading: string
  description?: string
  onBack: () => void
  trainer: TrainerResponseDto & { active?: boolean }
  onEdit: () => void
  onOpenSchedule: () => void
  onDelete?: () => void | Promise<void>
  isDeleting?: boolean
}

const getInitials = (name?: string | null) => {
  if (!name) {
    return "?"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) {
    return "Data não informada"
  }

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return `${age} anos`
}

const formatAddress = (address?: string | null) => {
  if (!address) {
    return "Endereço não informado"
  }

  return address
}

const formatJoinDate = (joinDate?: string | null) => {
  if (!joinDate) {
    return null
  }

  try {
    return new Date(joinDate).toLocaleDateString("pt-BR")
  } catch {
    return null
  }
}

const getCompensationLabel = (compensationType?: TrainerResponseDto["compensationType"]) => {
  if (compensationType === "MONTHLY") {
    return "Mensalista"
  }

  if (compensationType === "HOURLY") {
    return "Horista"
  }

  return "Compensação não informada"
}

const getHoursWorkedLabel = (hoursWorked?: number | null) => {
  if (typeof hoursWorked === "number") {
    return `${hoursWorked}h este mês`
  }

  return "Sem horas registradas"
}

const getSpecialtiesSection = (specialties?: string[] | null): ReactNode => {
  if (!specialties?.length) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Especialidades</p>
      <div className="flex flex-wrap gap-1">
        {specialties.map((specialty) => (
          <Badge key={specialty} variant="outline" className="text-xs">
            {specialty}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function TrainerProfileSummaryCard({
  heading,
  description,
  onBack,
  trainer,
  onEdit,
  onOpenSchedule,
  onDelete,
  isDeleting,
}: TrainerProfileSummaryCardProps) {
  const initials = getInitials(trainer.name)
  const isActive = trainer.active ?? true
  const hasDeleteAction = Boolean(onDelete)

  const metadata: EntityProfileMetadataItem[] = [
    {
      icon: <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: trainer.email ?? "Sem e-mail",
    },
    {
      icon: <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: trainer.phone ?? "Sem telefone",
    },
    {
      icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: calculateAge(trainer.birthDate),
    },
    {
      icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: getHoursWorkedLabel(trainer.hoursWorked),
    },
  ]

  const infoRows: ReactNode[] = [
    <span key="address" className="flex items-start gap-2 text-sm text-muted-foreground">
      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="text-xs leading-relaxed">{formatAddress(trainer.address)}</span>
    </span>,
  ]

  const joinDateLabel = formatJoinDate(trainer.joinDate)
  if (joinDateLabel) {
    infoRows.push(
      <span key="join-date" className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs">Ingressou em {joinDateLabel}</span>
      </span>,
    )
  }

  const badges: ReactNode[] = [
    <StatusBadge key="status" active={isActive} className="h-6" />,
    <Badge key="compensation" variant="outline" className="text-xs">
      {getCompensationLabel(trainer.compensationType)}
    </Badge>,
  ]

  const responsiveButtonClass = "w-full sm:w-auto"
  const actions: ReactNode[] = [
    <Button
      key="schedule"
      variant="outline"
      onClick={onOpenSchedule}
      className={cn(responsiveButtonClass, "gap-2")}
    >
      <CalendarDays className="h-4 w-4" aria-hidden="true" />
      <span>Horários</span>
    </Button>,
    <EditButton key="edit" onClick={onEdit} className={responsiveButtonClass} />,
    hasDeleteAction ? (
      <ConfirmDeleteButton
        key="delete"
        onConfirm={onDelete!}
        disabled={isDeleting}
        title="Excluir professor"
        description="Tem certeza que deseja excluir este professor? Ele será marcado como inativo."
        className={cn(responsiveButtonClass, "gap-2")}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span>Excluir</span>
      </ConfirmDeleteButton>
    ) : null,
  ].filter(Boolean) as ReactNode[]

  const specialtiesSection = getSpecialtiesSection(trainer.specialties)

  return (
    <EntityProfile
      heading={heading}
      description={description}
      onBack={onBack}
      title={trainer.name ?? "Professor"}
      subtitle={trainer.email ?? undefined}
      avatar={{ label: initials }}
      badges={badges}
      metadata={metadata}
      infoRows={infoRows}
      actions={actions}
      footer={specialtiesSection}
      muted={!isActive}
    />
  )
}