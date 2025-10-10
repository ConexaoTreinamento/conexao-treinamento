"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Calendar, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { getReportsOptions, getTrainersForLookupOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import type { AgeDistributionDto, TrainerLookupDto, TrainerReportDto } from "@/lib/api-client/types.gen"

type PeriodKey = "week" | "month" | "quarter" | "year"

const computePeriodRange = (period: PeriodKey) => {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (period) {
    case "week": {
      start.setDate(now.getDate() - 6)
      break
    }
    case "month": {
      start.setMonth(now.getMonth(), 1)
      break
    }
    case "quarter": {
      const quarterIndex = Math.floor(now.getMonth() / 3)
      const quarterStartMonth = quarterIndex * 3
      start.setMonth(quarterStartMonth, 1)
      end.setMonth(quarterStartMonth + 3, 0)
      break
    }
    case "year": {
      start.setMonth(0, 1)
      end.setMonth(12, 0)
      break
    }
    default:
      break
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

const formatCompensation = (value?: "HOURLY" | "MONTHLY") => {
  if (value === "MONTHLY") return "Mensalista"
  if (value === "HOURLY") return "Horista"
  return "—"
}

const formatNumber = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value)

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("month")
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all")
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

  const periodRange = useMemo(() => computePeriodRange(selectedPeriod), [selectedPeriod])

  const reportsQuery = useQuery({
    ...getReportsOptions({
      client: apiClient,
      query: {
        startDate: periodRange.start,
        endDate: periodRange.end,
        ...(selectedTrainer !== "all" ? { trainerId: selectedTrainer } : {}),
      },
    }),
    enabled: userRole === "admin" && Boolean(periodRange.start && periodRange.end),
    staleTime: 60_000,
  })

  const trainersQuery = useQuery({
    ...getTrainersForLookupOptions({ client: apiClient }),
    enabled: userRole === "admin",
    staleTime: 5 * 60_000,
  })

  const trainerOptions = useMemo(
    () =>
      (trainersQuery.data ?? []).filter(
        (trainer): trainer is TrainerLookupDto & { id: string } => Boolean(trainer?.id)
      ),
    [trainersQuery.data]
  )

  useEffect(() => {
    if (
      selectedTrainer !== "all" &&
      trainerOptions.length > 0 &&
      !trainerOptions.some((trainer) => trainer.id === selectedTrainer)
    ) {
      setSelectedTrainer("all")
    }
  }, [trainerOptions, selectedTrainer])

  const trainerReports = useMemo<TrainerReportDto[]>(
    () => (reportsQuery.data?.trainerReports ?? []) as TrainerReportDto[],
    [reportsQuery.data]
  )

  const filteredReports = useMemo<TrainerReportDto[]>(() => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return trainerReports
    return trainerReports.filter((trainer) =>
      (trainer?.name ?? "").toLowerCase().includes(search)
    )
  }, [trainerReports, searchTerm])

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, trainer) => {
        acc.hours += trainer.hoursWorked ?? 0
        acc.classes += trainer.classesGiven ?? 0
        acc.students += trainer.studentsManaged ?? 0
        return acc
      },
      { hours: 0, classes: 0, students: 0 }
    )
  }, [filteredReports])

  const ageDistribution = useMemo(
    () => reportsQuery.data?.ageDistribution ?? [],
    [reportsQuery.data]
  )

  const isLoading = reportsQuery.isLoading || trainersQuery.isLoading
  const isError = reportsQuery.isError

  if (userRole !== "admin") {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Análise de horas trabalhadas e aulas ministradas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos os professores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os professores</SelectItem>
              {trainerOptions.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.name ?? "Nome não informado"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isError && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-sm text-destructive">
              Não foi possível carregar os relatórios. Tente novamente mais tarde.
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Horas</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${formatNumber(totals.hours, 1)}h`}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aulas Ministradas</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatNumber(totals.classes)}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Atendidos</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatNumber(totals.students)}
                  </p>
                </div>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Performance dos Professores
            </CardTitle>
            <CardDescription>Detalhamento de horas trabalhadas e aulas ministradas por professor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Professor</th>
                    <th className="text-left p-3">Horas Trabalhadas</th>
                    <th className="text-left p-3">Aulas Ministradas</th>
                    <th className="text-left p-3">Alunos</th>
                    <th className="text-left p-3">Regime</th>
                    <th className="text-left p-3">Especialidades</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-muted-foreground">
                        Nenhum dado disponível para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((trainer) => {
                      const name = trainer?.name ?? "Professor"
                      const initials = name
                        .replace("Prof.", "")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()

                      return (
                        <tr key={trainer?.id ?? name} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                                  {initials || "?"}
                                </span>
                              </div>
                              <span className="font-medium">{name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium">{formatNumber(trainer?.hoursWorked ?? 0, 1)}h</td>
                          <td className="p-3 font-medium">{formatNumber(trainer?.classesGiven ?? 0)}</td>
                          <td className="p-3 font-medium">{formatNumber(trainer?.studentsManaged ?? 0)}</td>
                          <td className="p-3">
                            <Badge className="bg-muted text-xs font-medium">
                              {formatCompensation(trainer?.compensation)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(trainer?.specialties ?? []).map((specialty, idx) => (
                                <Badge key={`${trainer?.id ?? name}-${idx}`} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {(trainer?.specialties?.length ?? 0) === 0 && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Perfil Etário dos Alunos
            </CardTitle>
            <CardDescription>Distribuição dos alunos por faixa etária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : ageDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum dado disponível para o período selecionado.</p>
              ) : (
                ageDistribution.map((profile: AgeDistributionDto, index) => {
                  const percentage = profile?.percentage ?? 0
                  const count = profile?.count ?? 0
                  const percentageLabel = Number.isFinite(percentage)
                    ? percentage.toFixed(1).replace(/\.0$/, "")
                    : "0"
                  return (
                    <div key={`${profile?.ageRange ?? index}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-600 rounded" />
                        <span className="font-medium">{profile?.ageRange ?? "Faixa etária"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{formatNumber(count)}</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">({percentageLabel}%)</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
