import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CalendarDays } from "lucide-react"

export interface RecentClassEntry {
  id: string
  title: string
  trainerName: string
  dateLabel: string
  status: "Presente" | "Ausente"
}

export interface CommitmentSummary {
  id: string
  seriesName: string
  status: "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE"
}

interface StudentOverviewTabProps {
  planName?: string
  planMaxDays?: number
  commitments: CommitmentSummary[]
  commitmentsLoading: boolean
  recentClasses: RecentClassEntry[]
  recentClassesLoading: boolean
}

const getAttendanceColor = (status: "Presente" | "Ausente") => {
  if (status === "Presente") {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

const getAttendingCommitments = (commitments: CommitmentSummary[]) => (
  commitments.filter((commitment) => commitment.status === "ATTENDING")
)

export function StudentOverviewTab({
  planName,
  planMaxDays,
  commitments,
  commitmentsLoading,
  recentClasses,
  recentClassesLoading,
}: StudentOverviewTabProps) {
  const attendingCommitments = getAttendingCommitments(commitments)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="w-4 h-4" />
            Cronograma de Aulas
          </CardTitle>
          <CardDescription>
            {planName ? `${planMaxDays ?? 0} dias máx / semana` : "Atribua um plano para selecionar aulas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">{planName ?? "Sem Plano"}</span>
              <Badge variant="outline">
                {attendingCommitments.length}/{planMaxDays ?? 0} dias
              </Badge>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {commitmentsLoading && <p className="text-xs text-muted-foreground">Carregando compromissos...</p>}
              {!commitmentsLoading && attendingCommitments.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma série selecionada.</p>
              )}
              {attendingCommitments.map((commitment) => (
                  <div key={commitment.id} className="flex items-center justify-between p-2 rounded border bg-muted/50 text-xs">
                    <span className="font-medium truncate" title={commitment.seriesName}>
                      {commitment.seriesName}
                  </span>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aulas Recentes</CardTitle>
          <CardDescription>Histórico de participação em aulas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentClassesLoading && (
              <p className="text-xs text-muted-foreground">Carregando aulas recentes...</p>
            )}
            {!recentClassesLoading && recentClasses.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma aula recente</p>
              </div>
            )}
            {!recentClassesLoading && recentClasses.map((recentClass) => (
              <div key={recentClass.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{recentClass.title}</p>
                  <p className="text-xs text-muted-foreground">{recentClass.dateLabel} • {recentClass.trainerName}</p>
                </div>
                <Badge className={getAttendanceColor(recentClass.status)}>{recentClass.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
