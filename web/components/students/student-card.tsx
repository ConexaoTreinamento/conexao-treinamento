import {useMemo, type MouseEvent} from "react"
import {Activity, Calendar, Mail, Phone, Plus, RotateCcw, Trash2} from "lucide-react"
import {Button} from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import {PlanAssignmentStatusBadge} from "@/components/plans/expiring-plans"
import type {StudentResponseDto} from "@/lib/api-client/types.gen"
import type {StudentPlanAssignmentResponseDto} from "@/lib/api-client/types.gen"
import { EntityCard, type EntityCardMetadataItem } from "@/components/base/entity-card"

export interface StudentCardProps {
  student: StudentResponseDto
  assignment: StudentPlanAssignmentResponseDto | null
  onOpenDetails: () => void
  onCreateEvaluation: () => void
  onRestore: () => Promise<void>
  onDelete: () => Promise<void>
  isRestoring: boolean
  isDeleting: boolean
}

const getPlanLabel = (assignment: StudentPlanAssignmentResponseDto | null): string => {
  if (!assignment?.planName?.trim()) {
    return "Plano: não atribuído"
  }

  const normalized = assignment.planName.trim()
  if (normalized.toLowerCase().startsWith("plano")) {
    return normalized
  }

  return `Plano: ${normalized}`
}

const getInitials = (fullName: string): string => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0] ?? "")
    .join("")
    .toUpperCase()
}

function CreateEvaluationButton(props: { onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return <Button
      size="sm"
      variant="outline"
      onClick={props.onClick}
      className="h-8 px-2 text-xs"
  >
    <Plus className="mr-1 h-3 w-3" aria-hidden="true"/>
    Avaliação
  </Button>;
}

export const StudentCard = ({
  student,
  assignment,
  onOpenDetails,
  onCreateEvaluation,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: StudentCardProps) => {
  const fullName = `${student.name ?? ""} ${student.surname ?? ""}`.trim()
  const initials = useMemo(() => getInitials(fullName || student.email || ""), [fullName, student.email])
  const age = useMemo(() => {
    if (!student.birthDate) {
      return 0
    }

    const today = new Date()
    const birth = new Date(student.birthDate)
    let calculatedAge = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge -= 1
    }

    return calculatedAge
  }, [student.birthDate])

  const planLabel = getPlanLabel(assignment)
  const badge = <PlanAssignmentStatusBadge assignment={assignment} />
  const genderLabel =
    student.gender === "M" ? "Masculino" : student.gender === "F" ? "Feminino" : "Outro"

  const handleDetails = () => {
    onOpenDetails()
  }

  const handleCreateEvaluation = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onCreateEvaluation()
  }

  const handleRestore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    void onRestore()
  }

  const handleDelete = async () => {
    await onDelete()
  }

  const metadata: EntityCardMetadataItem[] = [
    {
      icon: <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />,
      content: student.email ?? "Email não informado",
    },
    {
      icon: <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />,
      content: student.phone ?? "Telefone não informado",
    },
    {
      icon: <Calendar className="h-3 w-3 text-muted-foreground" aria-hidden="true" />,
      content: planLabel,
    },
  ]

  const infoRows = [
    (
      <span key="profile">
        {age} anos • {student.profession || "Profissão não informada"} • {genderLabel}
      </span>
    ),
    (
      <span key="registration">
        Ingresso: {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}
      </span>
    ),
  ]

  const mobileActions = (
    <>
      <CreateEvaluationButton onClick={handleCreateEvaluation}/>
      {student.deletedAt ? (
          <Button
              size="icon"
              variant="outline"
              onClick={handleRestore}
              className="h-8 w-8"
              disabled={isRestoring}
              aria-label="Reativar aluno"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true"/>
          </Button>
      ) : (
          <ConfirmDeleteButton
              onConfirm={handleDelete}
              disabled={isDeleting}
              title="Excluir Aluno"
              description={`Tem certeza que deseja excluir ${fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
              size="icon"
              className="h-8 w-8"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true"/>
          </ConfirmDeleteButton>
      )}
    </>
  )

  const desktopActions = (
    <>
      <CreateEvaluationButton onClick={handleCreateEvaluation}/>
      {student.deletedAt ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleRestore}
          disabled={isRestoring}
          className="h-8 px-3 text-sm"
        >
          <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" /> Reativar
        </Button>
      ) : (
        <ConfirmDeleteButton
          onConfirm={handleDelete}
          disabled={isDeleting}
          title="Excluir Aluno"
          description={`Tem certeza que deseja excluir ${fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
          size="sm"
          className="h-8"
        >
          <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" /> Excluir
        </ConfirmDeleteButton>
      )}
    </>
  )

  return (
    <EntityCard
      title={fullName || student.email || "Aluno"}
      avatar={{ label: initials }}
      badges={[badge]}
      metadata={metadata}
      infoRows={infoRows}
      mobileActions={mobileActions}
      desktopActions={desktopActions}
      onClick={handleDetails}
      muted={Boolean(student.deletedAt)}
    />
  )
}
