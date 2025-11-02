import {useMemo, type MouseEvent} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Activity, Calendar, Mail, Phone, RotateCcw, Trash2} from "lucide-react"
import {Button} from "@/components/ui/button"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import {PlanAssignmentStatusBadge} from "@/lib/expiring-plans"
import type {StudentResponseDto} from "@/lib/api-client/types.gen"
import type {StudentPlanAssignmentResponseDto} from "@/lib/api-client/types.gen"

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

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${student.deletedAt ? "bg-muted/60 border-dashed" : ""}`}
      onClick={handleDetails}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight">{fullName}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {badge}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateEvaluation}
                className="bg-transparent text-xs px-2 py-1 h-8 flex-shrink-0"
              >
                <Activity className="w-3 h-3 mr-1" />
                Avaliação
              </Button>
              {student.deletedAt ? (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleRestore}
                  className="h-8 w-8"
                  disabled={isRestoring}
                  aria-label="Reativar aluno"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              ) : (
                <ConfirmDeleteButton
                  onConfirm={handleDelete}
                  disabled={isDeleting}
                  title="Excluir Aluno"
                  description={`Tem certeza que deseja excluir ${fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </ConfirmDeleteButton>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{student.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{planLabel}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              {age} anos • {student.profession || "Profissão não informada"} • {genderLabel}
            </div>
            <div>
              Ingresso: {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 dark:text-green-300 font-semibold select-none">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg flex-1 min-w-0 truncate">{fullName}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  {badge}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{planLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
              <span>{age} anos • {student.profession || "Profissão não informada"} • {genderLabel}</span>
              <span>Ingresso: {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateEvaluation}
                className="bg-transparent text-xs px-2 py-1 h-8"
              >
                <Activity className="w-3 h-3 mr-1" />
                Avaliação
              </Button>
              {student.deletedAt ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRestore}
                  disabled={isRestoring}
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reativar
                </Button>
              ) : (
                <ConfirmDeleteButton
                  onConfirm={handleDelete}
                  disabled={isDeleting}
                  title="Excluir Aluno"
                  description={`Tem certeza que deseja excluir ${fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Excluir
                </ConfirmDeleteButton>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
