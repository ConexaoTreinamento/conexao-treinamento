"use client"

import type React from "react"

import { useState, useEffect, Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Phone, Mail, Calendar, Clock, Edit, Trash2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import TrainerModal from "@/components/trainer-modal"
import { createTrainerAndUserMutation, findAllTrainersOptions, softDeleteTrainerUserMutation, updateTrainerAndUserMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TrainerResponseDto } from "@/lib/api-client"
import { apiClient } from "@/lib/client"
import { useToast } from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"

// Interface for trainer data to match the modal

export default function TrainersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("admin")
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingTrainer, setEditingTrainer] = useState<TrainerResponseDto | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "Ativo",
    compensation: "all",
    specialty: "",
  })
  const router = useRouter()
  const { mutateAsync: deleteTrainer, isPending: isDeleting } = useMutation(softDeleteTrainerUserMutation({ client: apiClient }))
  const { mutateAsync: createTrainer, isPending: isCreating } = useMutation(createTrainerAndUserMutation({ client: apiClient }))
  const { mutateAsync: updateTrainer, isPending: isUpdating } = useMutation(updateTrainerAndUserMutation({ client: apiClient }))

  const queryClient = useQueryClient();
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin"
    setUserRole(role)
  }, [])


  const { data: trainers, isLoading, error } = useQuery({
    ...findAllTrainersOptions({
      client: apiClient,
    })
  })

  // Handle opening modal for creating a new trainer
  const handleCreateTrainer = () => {
    setModalMode("create")
    setEditingTrainer(null)
    setIsModalOpen(true)
  }

  // Handle opening modal for editing an existing trainer
  const handleEditTrainer = (trainer: TrainerResponseDto) => {
    setModalMode("edit")
    setEditingTrainer(trainer)
    setIsModalOpen(true)
  }

  // Handle modal submission
  const handleModalSubmit = async (formData: any) => {
    try {
      if (modalMode === "create") {
        // Create new trainer
        await createTrainer({
          body: formData,
          client: apiClient,
        })
      } else {
        // Update existing trainer
        await updateTrainer({
          path: { id: String(editingTrainer?.id) },
          body: formData,
          client: apiClient,
        })
      }
      await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAllTrainers'
      })
      setIsModalOpen(false)
      setEditingTrainer(null)
    } catch (error: any) {
      const action = modalMode === "create" ? "criar treinador" : "atualizar treinador"
      handleHttpError(error, action, `Não foi possível ${action}. Tente novamente.`)
    }
  }

  // Handle trainer deletion
  const handleDeleteTrainer = async (trainerId: string) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      try {
        await deleteTrainer({
          path: { id: String(trainerId) }, client: apiClient
        });
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAllTrainers'
        })
      } catch (error: any) {
        handleHttpError(error, "excluir treinador", "Não foi possível excluir o treinador. Tente novamente.")
      }
    }
  }

  // Filter trainers based on search and filters
  const filteredTrainers = trainers?.filter(trainer => {
    const matchesSearch = trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filters.status === "all" || (trainer.active ? filters.status === "Ativo" : filters.status === "Inativo")
    const matchesCompensation = filters.compensation === "all" || trainer.compensationType === (filters.compensation === "Mensalista" ? "MONTHLY" : "HOURLY")
    const matchesSpecialty = !filters.specialty ||
      trainer.specialties?.some(spec =>
        spec.toLowerCase().includes(filters.specialty.toLowerCase())
      )

    return matchesSearch && matchesStatus && matchesCompensation && matchesSpecialty
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "Licença":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCompensationColor = (compensation: 'HOURLY' | 'MONTHLY') => {
    return compensation === "MONTHLY"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  // Only show this page to admins
  if (userRole !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Professores</h1>
            <p className="text-sm text-muted-foreground">Gerencie professores e instrutores</p>
          </div>
          {userRole === "admin" && (
            <Button onClick={handleCreateTrainer} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters Panel */}
        {isFiltersOpen && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compensação</label>
                <select
                  value={filters.compensation}
                  onChange={(e) => setFilters({ ...filters, compensation: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="Horista">Horista</option>
                  <option value="Mensalista">Mensalista</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidade</label>
                <Input
                  placeholder="Filtrar por especialidade..."
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers?.map((trainer) => (
            <Card
              key={trainer.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/trainers/${trainer.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {trainer.name?.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{trainer.name}</CardTitle>
                      <div className="flex gap-1 mt-1">
                        <Badge className={getStatusColor(trainer.active ? "Ativo" : "Inativo")}>
                          {trainer.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge className={getCompensationColor(trainer.compensationType!)}>
                          {trainer.compensationType === "MONTHLY" ? "Mensalista" : "Horista"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {userRole === "admin" && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {
                        trainer.active &&
                        <Fragment>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTrainer(trainer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTrainer(trainer.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Fragment>
                      }
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Desde {new Date(trainer.joinDate!).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{trainer.hoursWorked}h este mês</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties!.slice(0, 2).map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {trainer.specialties!.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{trainer.specialties!.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrainers?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum professor encontrado.</p>
          </div>
        )}
      </div>

      {/* Trainer Modal */}
      <TrainerModal
        open={isModalOpen}
        mode={modalMode}
        initialData={editingTrainer || undefined}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTrainer(null)
        }}
        onSubmit={handleModalSubmit}
      />
    </Layout>
  )
}
