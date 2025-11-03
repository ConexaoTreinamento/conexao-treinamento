"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Layout from "@/components/layout"
import TrainerModal from "@/components/trainers/trainer-modal"
import { TrainerProfileSummaryCard } from "@/components/trainers/profile/profile-summary-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"
import { apiClient } from "@/lib/client"
import { findTrainerByIdOptions, findTrainerByIdQueryKey, updateTrainerAndUserMutation } from "@/lib/api-client/@tanstack/react-query.gen"

export default function TrainerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const trainerId = params.id as string
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryClient = useQueryClient()
  const { mutateAsync: updateTrainer } = useMutation(updateTrainerAndUserMutation({ client: apiClient }))

  const invalidateTrainersQueries = () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const root = (query.queryKey as unknown[])?.[0] as { _id?: string } | undefined
        if (!root || typeof root !== "object") return false
        const id = root._id
        return id === "findAllTrainers" || id === "getTrainersForLookup"
      },
    })

  const { data: trainerData, isLoading } = useQuery({
    ...findTrainerByIdOptions({
      path: { id: trainerId },
      client: apiClient,
    }),
  })

  const handleEditTrainer = () => {
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (formData: Record<string, unknown>) => {
    try {
      if (trainerData) {
        const updatedTrainer = { ...trainerData, ...formData }

        await updateTrainer({
          path: { id: String(updatedTrainer?.id) },
          body: updatedTrainer,
          client: apiClient,
        })
        await invalidateTrainersQueries()
        await queryClient.invalidateQueries({
          queryKey: findTrainerByIdQueryKey({ path: { id: trainerId }, client: apiClient }),
        })
      }

      setIsModalOpen(false)
      toast({
        title: "Professor atualizado",
        description: "As alterações foram salvas.",
        variant: "success",
        duration: 3000,
      })
    } catch (error: unknown) {
      handleHttpError(error, "atualizar treinador", "Não foi possível atualizar o treinador. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do professor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!trainerData) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">Professor não encontrado</p>
            <Button variant="outline" onClick={() => router.push("/trainers")} className="mt-4">
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
        <TrainerProfileSummaryCard
          heading="Perfil do Professor"
          description="Informações completas e desempenho"
          onBack={() => router.back()}
          trainer={trainerData}
          onEdit={handleEditTrainer}
          onOpenSchedule={() => router.push(`/trainers/${trainerId}/trainer-schedule`)}
        />
      </div>

      <TrainerModal
        open={isModalOpen}
        mode="edit"
        initialData={trainerData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </Layout>
  )
}
