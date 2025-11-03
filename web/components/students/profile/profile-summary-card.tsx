import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { EditButton } from "@/components/base/edit-button"
import { EntityProfile, type EntityProfileMetadataItem } from "@/components/base/entity-profile"
import { PlanAssignmentStatusBadge, getAssignmentDaysRemaining, getAssignmentEndDate } from "@/components/plans/expiring-plans"
import type { StudentPlanAssignmentResponseDto, StudentResponseDto } from "@/lib/api-client/types.gen"
import { Activity, Calendar, CalendarDays, MapPin, Phone, PlusCircle, Trash2, User } from "lucide-react"
import { Mail } from "lucide-react"
import { RotateCcw } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StudentProfileSummaryCardProps {
  heading: string
  description?: string
  onBack: () => void
  student: StudentResponseDto
  currentAssignment: StudentPlanAssignmentResponseDto | null
  onEdit: () => void
  onCreateEvaluation: () => void
  onOpenSchedule: () => void
  onOpenAssignPlan: () => void
  onDelete: () => void | Promise<void>
  onRestore: () => void | Promise<void>
  isDeleting: boolean
  isRestoring: boolean
  canAccessSchedule: boolean
  isInactive: boolean
}

const getFullName = (student: StudentResponseDto) => {
  const name = student.name ?? ""
  const surname = student.surname ?? ""
  return `${name} ${surname}`.trim()
}

const formatAddress = (student: StudentResponseDto) => {
  const parts = [
    student.street,
    student.number,
    student.complement,
    student.neighborhood,
    student.cep
  ].filter(Boolean)

  if (parts.length === 0) {
    return "N/A"
  }

  return parts.join(", ")
}

const calculateAge = (birthDate: string | undefined) => {
  if (!birthDate) {
    return "N/A"
  }

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}

export function StudentProfileSummaryCard({
  heading,
  description,
  onBack,
  student,
  currentAssignment,
  onEdit,
  onCreateEvaluation,
  onOpenSchedule,
  onOpenAssignPlan,
  onDelete,
  onRestore,
  isDeleting,
  isRestoring,
  canAccessSchedule,
  isInactive,
}: StudentProfileSummaryCardProps) {
  const fullName = getFullName(student)
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const currentPlanEndDate = currentAssignment ? getAssignmentEndDate(currentAssignment) : undefined
  const currentPlanDaysRemaining = currentAssignment ? getAssignmentDaysRemaining(currentAssignment) : undefined

  const planBadges: ReactNode[] = currentAssignment
    ? [
        <PlanAssignmentStatusBadge key="status" assignment={currentAssignment} />,
        currentAssignment.planName ? (
          <Badge key="plan-name" variant="outline">{currentAssignment.planName}</Badge>
        ) : null,
        currentPlanEndDate ? (
          <Badge key="plan-end" variant="secondary">
            Fim: {new Date(currentPlanEndDate).toLocaleDateString("pt-BR")}
          </Badge>
        ) : null,
        typeof currentPlanDaysRemaining === "number" && currentPlanDaysRemaining >= 0 ? (
          <Badge key="plan-remaining" variant="outline">{currentPlanDaysRemaining} dias restantes</Badge>
        ) : null,
      ].filter(Boolean) as ReactNode[]
    : [<Badge key="no-plan" variant="secondary">Sem plano</Badge>]

  const metadata: EntityProfileMetadataItem[] = [
    {
      icon: <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: student.email || "Sem e-mail",
    },
    {
      icon: <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: student.phone || "Sem telefone",
    },
    {
      icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: `${calculateAge(student.birthDate)} anos`,
    },
    {
      icon: <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
      content: student.profession ?? "Sem profissão",
    },
  ]

  const infoRows: ReactNode[] = [
    <span key="address" className="flex items-start gap-2 text-sm text-muted-foreground">
      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span className="text-xs leading-relaxed">{formatAddress(student)}</span>
    </span>,
  ]

  const planActionLabel = currentAssignment ? "Renovar plano" : "Atribuir plano"

  const responsiveButtonClass = "w-full sm:w-auto"
  const actions: ReactNode[] = [
    <EditButton key="edit" onClick={onEdit} className={responsiveButtonClass} />,
    <Button
      key="evaluate"
      variant="secondary"
      onClick={onCreateEvaluation}
      className={cn(responsiveButtonClass, "gap-2")}
    >
      <Activity className="h-4 w-4" aria-hidden="true" />
      <span>Avaliar</span>
    </Button>,
    <Button
      key="schedule"
      variant="outline"
      onClick={onOpenSchedule}
      disabled={!canAccessSchedule}
      className={cn(responsiveButtonClass, "gap-2")}
    >
      <CalendarDays className="h-4 w-4" aria-hidden="true" />
      <span>{canAccessSchedule ? "Cronograma" : "Cronograma indisponível"}</span>
    </Button>,
    <Button
      key="assign-plan"
      variant="outline"
      onClick={onOpenAssignPlan}
      className={cn(responsiveButtonClass, "gap-2")}
    >
      <PlusCircle className="h-4 w-4" aria-hidden="true" />
      <span>{planActionLabel}</span>
    </Button>,
    isInactive ? (
      <Button
        key="restore"
        variant="secondary"
        onClick={onRestore}
        disabled={isRestoring}
        className={cn(responsiveButtonClass, "gap-2")}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>Reativar</span>
      </Button>
    ) : (
      <ConfirmDeleteButton
        key="delete"
        onConfirm={onDelete}
        disabled={isDeleting}
        title="Excluir aluno"
        description="Tem certeza que deseja excluir este aluno? Ele será marcado como inativo e poderá ser restaurado."
        className={cn(responsiveButtonClass, "gap-2")}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span>Excluir</span>
      </ConfirmDeleteButton>
    ),
  ]

  return (
    <EntityProfile
      heading={heading}
      description={description}
      title={fullName || "Aluno"}
      subtitle={student.email || undefined}
      avatar={{ label: initials || "?" }}
      badges={planBadges}
      metadata={metadata}
      infoRows={infoRows}
      actions={actions}
      onBack={onBack}
      muted={isInactive}
    />
  )
}
