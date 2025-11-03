import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { EntityProfile, type EntityProfileMetadataItem } from "@/components/base/entity-profile"
import { PlanAssignmentStatusBadge, getAssignmentDaysRemaining, getAssignmentEndDate } from "@/components/plans/expiring-plans"
import type { StudentPlanAssignmentResponseDto, StudentResponseDto } from "@/lib/api-client/types.gen"
import { Activity, Calendar, CalendarDays, Edit, MapPin, Phone, PlusCircle, Trash2, User } from "lucide-react"
import { Mail } from "lucide-react"
import { RotateCcw } from "lucide-react"
import type { ReactNode } from "react"

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

  const actions: ReactNode[] = [
    <Button key="edit" size="sm" className="h-9 bg-green-600 hover:bg-green-700" onClick={onEdit}>
      <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
      Editar
    </Button>,
    <Button key="evaluate" size="sm" variant="outline" className="h-9" onClick={onCreateEvaluation}>
      <Activity className="mr-2 h-4 w-4" aria-hidden="true" />
      Avaliar
    </Button>,
    <Button
      key="schedule"
      size="sm"
      variant="outline"
      className="h-9"
      onClick={onOpenSchedule}
      disabled={!canAccessSchedule}
    >
      <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />
      {canAccessSchedule ? "Cronograma" : "Cronograma indisponível"}
    </Button>,
    <Button
      key="assign-plan"
      size="sm"
      variant="outline"
      className="h-9"
      onClick={onOpenAssignPlan}
    >
      <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
      {planActionLabel}
    </Button>,
    isInactive ? (
      <Button
        key="restore"
        size="sm"
        variant="outline"
        className="h-9"
        onClick={onRestore}
        disabled={isRestoring}
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
        Reativar
      </Button>
    ) : (
      <ConfirmDeleteButton
        key="delete"
        onConfirm={onDelete}
        disabled={isDeleting}
        title="Excluir aluno"
        description="Tem certeza que deseja excluir este aluno? Ele será marcado como inativo e poderá ser restaurado."
        size="sm"
        variant="outline"
        className="h-9"
      >
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Excluir
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
