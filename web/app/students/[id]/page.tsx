"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, Edit, CalendarDays, Trash2, RotateCcw } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { usePlans, useAssignPlanToStudent, useCurrentStudentPlan } from "@/lib/hooks/plan-queries"
import { UnifiedStatusBadge } from "@/lib/expiring-plans"
import {hasInsomniaTypes, impairmentTypes, STUDENT_PROFILES} from "@/lib/students-data"
import { useDeleteStudent, useRestoreStudent } from "@/lib/hooks/student-mutations";
import {apiClient} from "@/lib/client";
import ConfirmDeleteButton from "@/components/confirm-delete-button";
import { useToast } from "@/hooks/use-toast";
import type { StudentResponseDto } from "@/lib/api-client/types.gen"
import {useStudent} from "@/lib/hooks/student-queries";

// Type definitions
interface Evaluation {
  id: string
  date: string
  weight: number
  height: number
  bmi: number
  circumferences: {
    rightArmRelaxed: number
    leftArmRelaxed: number
    rightArmFlexed: number
    leftArmFlexed: number
    waist: number
    abdomen: number
    hip: number
    rightThigh: number
    leftThigh: number
    rightCalf: number
    leftCalf: number
  }
  subcutaneousFolds: {
    triceps: number
    thorax: number
    subaxillary: number
    subscapular: number
    abdominal: number
    suprailiac: number
    thigh: number
  }
  diameters: {
    umerus: number
    femur: number
  }
}

interface ScheduleClass {
  day: string
  time: string
  class: string
  instructor: string
}
interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  duration?: string
  notes?: string
}
export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const studentMockData = STUDENT_PROFILES[0] //used for fields that don't exist on studentResponseDTO

  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } = useRestoreStudent()

  const handleDelete = async () => {
    await deleteStudent({ path: { id: String(params.id) }, client: apiClient })
    toast({ title: "Aluno excluído", description: "O aluno foi marcado como inativo.", duration: 3000 })
    router.back()
  }

  const handleRestore = async () => {
    await restoreStudent({ path: { id: String(params.id) }, client: apiClient })
    toast({ title: "Aluno reativado", description: "O aluno foi reativado com sucesso.", duration: 3000 })
  }

  // Plans data & assign mutation
  const { data: plansData } = usePlans()
  const { data: currentPlan } = useCurrentStudentPlan(params?.id ? String(params.id) : undefined)
  const assignPlan = useAssignPlanToStudent()
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().slice(0,10))

  const handleAssignPlan = async () => {
    if (!params.id || !selectedPlanId) return
    try {
      // Send full ISO instant to backend (frontend date input returns YYYY-MM-DD)
      await assignPlan.mutateAsync(String(params.id), { planId: selectedPlanId, effectiveFromTimestamp: new Date(effectiveFrom).toISOString() })
      toast({ title: "Plano atribuído", description: "O plano foi atribuído ao aluno.", duration: 3000 })
      setAssignOpen(false)
      router.refresh()
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível atribuir o plano.", duration: 4000 })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  const { data: studentData, isLoading, error } = useStudent({path: {id: String(params.id)}}, {enabled: Boolean(params.id)})

  const getFullName = (student: StudentResponseDto | undefined) => {
    if (!student) return ""
    return `${student.name || ""} ${student.surname || ""}`.trim()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatAddress = (student: StudentResponseDto | undefined) => {
    if (!student) return "N/A"
    const parts = [
      student.street,
      student.number,
      student.complement,
      student.neighborhood,
      student.cep
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando dados do aluno...</p>
            </div>
          </div>
        </Layout>
    )
  }

  if (error) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600">Erro ao carregar dados do aluno</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || "Ocorreu um erro inesperado"}
              </p>
              <Button
                  variant="outline"
                  onClick={() => router.push('/students')}
                  className="mt-4"
              >
                Voltar para lista de alunos
              </Button>
            </div>
          </div>
        </Layout>
    )
  }

  if (!studentData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Aluno não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push('/students')}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }
    const getAttendanceColor = (status: string) => {
    return status === "Presente"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Perfil do Aluno</h1>
            <p className="text-sm text-muted-foreground">Informações completas e histórico</p>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-4">
          {/* Profile Card - Full Width on Mobile */}
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="text-xl select-none">
                  {getFullName(studentData)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{getFullName(studentData)}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  <UnifiedStatusBadge 
                    expirationDate={currentPlan?.effectiveToTimestamp ? formatDate(currentPlan.effectiveToTimestamp) : "N/A"} 
                  />
                  {currentPlan ? (
                    <Badge variant="outline">Plano {currentPlan.planName}</Badge>
                  ) : (
                    <Badge variant="secondary">Sem plano ativo</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span className="truncate">{studentData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{studentData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{calculateAge(studentData.birthDate)} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{studentData.profession ?? "Sem profissão"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"/>
                <span className="text-xs leading-relaxed">{formatAddress(studentData)}</span>
              </div>

              <div className="pt-4 border-t">
              {/* Mobile-first: 1 col; sm: 2 cols; md+: 4 cols, full-width buttons */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() => router.push(`/students/${params.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2"/>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="w-full"
                          onClick={() => router.push(`/students/${params.id}/evaluation/new`)}>
                    <Activity className="w-4 h-4 mr-2"/>
                    Avaliação
                  </Button>
                  <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/students/${params.id}/class-schedule`)}
                  >
                    <CalendarDays className="w-4 h-4 mr-2"/>
                    Cronograma
                  </Button>

                  {/* Assign Plan Dialog */}
                  <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="w-full">
                        <CalendarDays className="w-4 h-4 mr-2"/> Atribuir Plano
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Atribuir Plano ao Aluno</DialogTitle>
                        <DialogDescription>Selecione o plano e a data de vigência</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Plano</label>
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={selectedPlanId ?? ""}
                            onChange={(e) => setSelectedPlanId(e.target.value || null)}
                          >
                            <option value="">Selecione um plano</option>
                            {(plansData || []).map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name} - {p.durationDays} dias</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Data de Início</label>
                          <input
                            type="date"
                            className="w-full border rounded px-2 py-1"
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
                          <Button disabled={!selectedPlanId} onClick={handleAssignPlan}>Confirmar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/*TODO (Santiago Firpo): replace with deletedAt != null check*/}
                  {studentMockData?.status === 'Inativo' ? (
                      <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleRestore}
                          disabled={isRestoring}
                      >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reativar
                      </Button>
                  ) : (
                      <ConfirmDeleteButton
                          onConfirm={handleDelete}
                          disabled={isDeleting}
                          title="Excluir Aluno"
                          description="Tem certeza que deseja excluir este aluno? Ele será marcado como inativo e poderá ser restaurado."
                          size="sm"
                          variant="outline"
                          className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2"/> Excluir
                      </ConfirmDeleteButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">
                Geral
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs px-2 py-2">
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="exercises" className="text-xs px-2 py-2">
                Exercícios
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs px-2 py-2">
                Detalhes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="w-4 h-4" />
                    Cronograma de Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between ">
                      <span className="font-medium">
                        {currentPlan ? `Plano ${currentPlan.planName}` : "Sem plano ativo"}
                      </span>
                      {currentPlan && (
                        <Badge variant="outline">
                          {currentPlan.daysRemaining ? `${currentPlan.daysRemaining} dias restantes` : 'Período indefinido'}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {studentMockData.classSchedule.selectedClasses.map((classItem: ScheduleClass, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{classItem.class}</p>
                            <p className="text-xs text-muted-foreground">
                              {classItem.day} - {classItem.time} • {classItem.instructor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => router.push(`/students/${params.id}/class-schedule`)}
                    >
                      Gerenciar Cronograma
                    </Button>
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
                    {studentMockData.recentClasses.map((classItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{classItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(classItem.date).toLocaleDateString("pt-BR")} • {classItem.instructor}
                          </p>
                        </div>
                        <Badge className={getAttendanceColor(classItem.status)}>{classItem.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Avaliações</CardTitle>
                  <CardDescription>Acompanhe a evolução das medidas corporais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentMockData.evaluations.map((evaluation: Evaluation) => (
                      <div
                        key={evaluation.id}
                        className="p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => router.push(`/students/${params.id}/evaluation/${evaluation.id}`)}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">{new Date(evaluation.date).toLocaleDateString("pt-BR")}</span>
                          <Badge variant="outline">Avaliação {evaluation.id}</Badge>
                        </div>

                        {/* Most relevant fields in a clean grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Peso:</span>
                            <p className="font-medium">{evaluation.weight}kg</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IMC:</span>
                            <p className="font-medium">{evaluation.bmi}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cintura:</span>
                            <p className="font-medium">{evaluation.circumferences.waist}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quadril:</span>
                            <p className="font-medium">{evaluation.circumferences.hip}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Braço Dir.:</span>
                            <p className="font-medium">{evaluation.circumferences.rightArmFlexed}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Coxa Dir.:</span>
                            <p className="font-medium">{evaluation.circumferences.rightThigh}cm</p>
                          </div>
                        </div>

                        {/* Summary of key measurements */}
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <p>
                            Dobras: Tríceps {evaluation.subcutaneousFolds.triceps}mm •
                            Abdominal {evaluation.subcutaneousFolds.abdominal}mm •
                            Coxa {evaluation.subcutaneousFolds.thigh}mm
                          </p>
                        </div>

                        {/* Click indicator */}
                        <div className="flex justify-end mt-2">
                          <span className="text-xs text-primary">Clique para ver detalhes →</span>
                        </div>
                      </div>
                    ))}

                    {studentMockData.evaluations.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/students/${params.id}/evaluation/new`)}
                        >
                          Criar primeira avaliação
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exercícios Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentMockData.exercises.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                      </div>
                    )}

                    {studentMockData.exercises.map((exerciseItem, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-muted/50">
                        <div className="mb-3">
                          <h3 className="font-medium">{exerciseItem.className} - {exerciseItem.instructor}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(exerciseItem.classDate).toLocaleDateString("pt-BR")}</p>
                        </div>

                        <div className="space-y-2">
                          {exerciseItem.exercises.map((exercise: Exercise) => (
                            <div key={exercise.id} className="text-sm">
                              <div>
                                <span className="text-muted-foreground">{exercise.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.sets}x{exercise.reps} {exercise.weight ? `• ${exercise.weight}` : ""} {exercise.duration ? `• ${exercise.duration}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Data de Nascimento:</span>
                      <p>{formatDate(studentData.birthDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Profissão:</span>
                      <p>{studentData.profession}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Data de Ingresso:</span>
                      <p className="text-sm">{formatDate(studentData.registrationDate)}</p>
                    </div>
                    <div>
                    <span className="text-sm text-muted-foreground">Última Renovação:</span>
                      <p>{new Date(studentMockData.lastRenewal).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Objetivos:</span>
                      <p className="text-sm">{studentData.objectives || "Não informado"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contato de Emergência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Nome:</span>
                      <p>{studentData.emergencyContactName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Telefone:</span>
                      <p>{studentData.emergencyContactPhone}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ficha de Anamnese</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Medicações em uso:</span>
                      <p className="text-sm">{studentData.anamnesis?.medication || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Médico ciente da prática de atividade física?</span>
                      <p className="text-sm">{studentData.anamnesis?.isDoctorAwareOfPhysicalActivity ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Atividade física favorita:</span>
                      <p className="text-sm">{studentData.anamnesis?.favoritePhysicalActivity || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Insônia:</span>
                      <p className="text-sm">{studentData.anamnesis?.hasInsomnia ? hasInsomniaTypes[studentData.anamnesis?.hasInsomnia] : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dieta orientada por:</span>
                      <p className="text-sm">{studentData.anamnesis?.dietOrientedBy || "Não faz dieta orientada"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas cardíacos:</span>
                      <p className="text-sm">{studentData.anamnesis?.cardiacProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Hipertensão:</span>
                      <p className="text-sm">{studentData.anamnesis?.hasHypertension ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Doenças crônicas:</span>
                      <p className="text-sm">{studentData.anamnesis?.chronicDiseases || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dificuldades para realização de exercícios físicos?</span>
                      <p className="text-sm">{studentData.anamnesis?.difficultiesInPhysicalActivities || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orientação médica impeditiva de alguma atividade física?</span>
                      <p className="text-sm">{studentData.anamnesis?.medicalOrientationsToAvoidPhysicalActivity || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cirurgias nos últimos 12 meses:</span>
                      <p className="text-sm">{studentData.anamnesis?.surgeriesInTheLast12Months || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas respiratórios:</span>
                      <p className="text-sm">{studentData.anamnesis?.respiratoryProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dor muscular/articular/dorsal:</span>
                      <p className="text-sm">{studentData.anamnesis?.jointMuscularBackPain || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas de disco espinhal:</span>
                      <p className="text-sm">{studentData.anamnesis?.spinalDiscProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Diabetes:</span>
                      <p className="text-sm">{studentData.anamnesis?.diabetes || "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Fumante:</span>
                      <p className="text-sm">{studentData.anamnesis?.smokingDuration || "Não fumante"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Colesterol alterado:</span>
                      <p className="text-sm">{studentData.anamnesis?.alteredCholesterol ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Osteoporose (localização):</span>
                      <p className="text-sm">{studentData.anamnesis?.osteoporosisLocation || "Não"}</p>
                    </div>
                  </CardContent>
                </Card>

                {studentData.physicalImpairments && studentData.physicalImpairments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Impedimentos Físicos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {studentData.physicalImpairments.map((impairment, index) => (
                            <div key={impairment.id || index} className="p-3 border rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-sm text-muted-foreground">Tipo:</span>
                                  <p className="text-sm font-medium">{impairment.type ? impairmentTypes[impairment.type] : "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Nome:</span>
                                  <p className="text-sm font-medium">{impairment.name || "N/A"}</p>
                                </div>
                              </div>
                              {impairment.observations && (
                                  <div className="mt-2">
                                    <span className="text-sm text-muted-foreground">Observações:</span>
                                    <p className="text-sm">{impairment.observations}</p>
                                  </div>
                              )}
                            </div>
                        ))}
                      </CardContent>
                    </Card>
                )}</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
)
}
