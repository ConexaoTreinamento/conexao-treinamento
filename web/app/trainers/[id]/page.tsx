"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Phone, Mail, Calendar, Clock, Edit, MapPin } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import Layout from "@/components/layout"
import TrainerModal from "@/components/trainers/trainer-modal"
import { findTrainerByIdOptions, findTrainerByIdQueryKey, updateTrainerAndUserMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { handleHttpError } from "@/lib/error-utils"
import { useToast } from "@/hooks/use-toast"



export default function TrainerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { mutateAsync: updateTrainer } = useMutation(updateTrainerAndUserMutation({ client: apiClient }));

  const queryClient = useQueryClient();

  const invalidateTrainersQueries = () => queryClient.invalidateQueries({
      predicate: (query) => {
        const root = (query.queryKey as unknown[])?.[0] as { _id?: string } | undefined
      if (!root || typeof root !== "object") return false
      const id = root._id
      return id === "findAllTrainers" || id === "getTrainersForLookup"
    }
  })

  const { data: trainerData, isLoading } = useQuery({
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
  const handleModalSubmit = async (formData: Record<string, unknown>) => {
    try {
      if (trainerData) {
        // Update the trainer data with new form data
        const updatedTrainer = { ...trainerData, ...formData }

        await updateTrainer({
          path: { id: String(updatedTrainer?.id) },
          body: updatedTrainer,
          client: apiClient,
        })
        await invalidateTrainersQueries()
        await queryClient.invalidateQueries({
          queryKey: findTrainerByIdQueryKey({ path: { id: params.id as string }, client: apiClient })
        })
      }
      setIsModalOpen(false)
      toast({ title: "Professor atualizado", description: "As alterações foram salvas.", variant: 'success', duration: 3000 })
    } catch (error: unknown) {
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
            <h1 className="text-2xl font-bold">Perfil do Professor</h1>
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
