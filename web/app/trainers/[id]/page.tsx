"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, Edit, MapPin } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import TrainerModal from "@/components/trainer-modal"
import { findTrainerByIdOptions, updateTrainerAndUserMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"

export default function TrainerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { mutateAsync: updateTrainer, isPending: isUpdating } = useMutation(updateTrainerAndUserMutation())
  const { toast } = useToast()

  const queryClient = useQueryClient();

  const { data: trainerData, isLoading, error } = useQuery({
    ...findTrainerByIdOptions({
      path: { id: params.id as string },
      client: apiClient,
    })
  })

  const getStatusColor = (status: boolean) => {
    if (status) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const getCompensationColor = (compensationType: "MONTHLY" | "HOURLY") => {
    return compensationType === "MONTHLY"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Handle opening modal for editing
  const handleEditTrainer = () => {
    setIsModalOpen(true)
  }

  // Handle modal submission
  const handleModalSubmit = async (formData: any) => {
    try {
      if (trainerData) {
        // Update the trainer data with new form data
        const updatedTrainer = { ...trainerData, ...formData }

        await updateTrainer({
          path: { id: String(updatedTrainer?.id) },
          body: updatedTrainer,
          client: apiClient,
        })
        await queryClient.invalidateQueries({
          predicate: function (q) {
            console.log(q)
            return false
          }
        })
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findTrainerById'
        })
      }
      setIsModalOpen(false)
    } catch (error: any) {
      handleHttpError(error, "atualizar treinador", "Não foi possível atualizar o treinador. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do professor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!trainerData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Professor não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push('/trainers')}
              className="mt-4"
            >
              Voltar para lista de professores
            </Button>
          </div>
        </div>
      </Layout>
    )
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
            <h1 className="text-xl font-bold">Perfil do Professor</h1>
            <p className="text-sm text-muted-foreground">Informações completas e desempenho</p>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="text-xl select-none">
                  {trainerData.name!
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{trainerData.name}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className={getStatusColor(trainerData.active!)}>
                    {trainerData.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge className={getCompensationColor(trainerData.compensationType!)}>{trainerData.compensationType === "MONTHLY" ? "Mensalist" : "Horista"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{trainerData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{trainerData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{calculateAge(trainerData.birthDate!)} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{trainerData.hoursWorked}h este mês</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{trainerData.address}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {trainerData.specialties?.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="w-full flex flex-row justify-center pt-4 border-t">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/trainers/${params.id}/trainer-schedule`)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Horários
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 w-full"
                    onClick={handleEditTrainer}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          {/* <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">
                Geral
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs px-2 py-2">
                Horários
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs px-2 py-2">
                Desempenho
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Horas/Mês</p>
                        <p className="text-xl font-bold">{trainerData.performance.monthlyHours}h</p>
                      </div>
                      <Clock className="w-5 h-5 text-blue-600" />`
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Aulas/Mês</p>
                        <p className="text-xl font-bold">{trainerData.performance.monthlyClasses}</p>
                      </div>
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Alunos</p>
                        <p className="text-xl font-bold">{trainerData.performance.studentsManaged}</p>
                      </div>
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aulas Recentes</CardTitle>
                  <CardDescription>Últimas aulas ministradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainerData.recentClasses.map((classItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{classItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(classItem.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {classItem.attendance}/{classItem.students}
                          </p>
                          <p className="text-xs text-muted-foreground">presentes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Horários da Semana</CardTitle>
                  <CardDescription>Agenda semanal de aulas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainerData.schedule.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{schedule.class}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.day} • {schedule.time}
                          </p>
                        </div>
                        <Badge variant="outline">{schedule.students} alunos</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Desempenho Mensal</CardTitle>
                  <CardDescription>Métricas de performance do professor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                      <p className="text-2xl font-bold">{trainerData.performance.monthlyHours}h</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Aulas Ministradas</p>
                      <p className="text-2xl font-bold">{trainerData.performance.monthlyClasses}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-sm text-muted-foreground">Alunos Atendidos</p>
                      <p className="text-2xl font-bold">{trainerData.performance.studentsManaged}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent> 
          </Tabs> */}
        </div>

        {/* Trainer Edit Modal */}
        <TrainerModal
          open={isModalOpen}
          mode="edit"
          initialData={trainerData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      </div>
    </Layout>
  )
}
