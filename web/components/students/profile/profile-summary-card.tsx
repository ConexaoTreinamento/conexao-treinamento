import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConfirmDeleteButton from "@/components/base/confirm-delete-button"
import { PlanAssignmentStatusBadge, getAssignmentDaysRemaining, getAssignmentEndDate } from "@/lib/expiring-plans"
import type { StudentPlanAssignmentResponseDto, StudentResponseDto } from "@/lib/api-client/types.gen"
import { Activity, Calendar, CalendarDays, Edit, MapPin, Phone, PlusCircle, Trash2, User } from "lucide-react"
import { Mail } from "lucide-react"
import { RotateCcw } from "lucide-react"

interface StudentProfileSummaryCardProps {
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

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <Avatar className="w-20 h-20 mx-auto">
          <AvatarFallback className="text-xl select-none">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <CardTitle className="text-lg">{fullName || "Aluno"}</CardTitle>
          <div className="flex flex-wrap justify-center gap-2">
            {currentAssignment && (
              <>
                <PlanAssignmentStatusBadge assignment={currentAssignment} />
                {currentAssignment.planName && (
                  <Badge variant="outline">{currentAssignment.planName}</Badge>
                )}
                {currentPlanEndDate && (
                  <Badge variant="secondary">
                    Fim: {new Date(currentPlanEndDate).toLocaleDateString("pt-BR")}
                  </Badge>
                )}
                {typeof currentPlanDaysRemaining === "number" && currentPlanDaysRemaining >= 0 && (
                  <Badge variant="outline">{currentPlanDaysRemaining} dias restantes</Badge>
                )}
              </>
            )}
            {!currentAssignment && <Badge variant="secondary">Sem Plano</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{student.email || "sem e-mail"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{student.phone || "sem telefone"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{calculateAge(student.birthDate)} anos</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{student.profession ?? "Sem profissão"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-xs leading-relaxed">{formatAddress(student)}</span>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={onCreateEvaluation}>
              <Activity className="w-4 h-4 mr-2" />
              Avaliação
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onOpenSchedule}
              disabled={!canAccessSchedule}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              {canAccessSchedule ? "Cronograma" : "Cronograma (Precisa de plano ativo)"}
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={onOpenAssignPlan}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {canAccessSchedule ? "Renovar/Atribuir Plano" : "Atribuir Plano"}
            </Button>

            {isInactive ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={onRestore}
                disabled={isRestoring}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reativar
              </Button>
            ) : (
              <ConfirmDeleteButton
                onConfirm={onDelete}
                disabled={isDeleting}
                title="Excluir Aluno"
                description="Tem certeza que deseja excluir este aluno? Ele será marcado como inativo e poderá ser restaurado."
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </ConfirmDeleteButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
