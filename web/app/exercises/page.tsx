"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import CreateExerciseModal from "@/components/ui/create-exercise-modal"
import EditExerciseModal from "@/components/ui/edit-exercise-modal"

import { Search, Plus, Activity, Edit, Trash2, X, Eye, RotateCcw, MoreVertical } from "lucide-react"
import Layout from "@/components/layout"
import { DeleteExerciseDialog } from "@/components/exercises/delete-exercise-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { findAllExercisesOptions, restoreExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { ExerciseResponseDto } from "@/lib/api-client"

const getAuthHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` })

interface Exercise {
  id: number
  name: string
  description?: string
  createdAt?: string
  deletedAt?: string
}

export default function ExercisesPage() {
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseResponseDto | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<ExerciseResponseDto | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseResponseDto | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const { toast } = useToast()
  const queryClient = useQueryClient();

  const { data: exercises, isLoading, error } = useQuery({
    ...findAllExercisesOptions({
      client: apiClient,
      query: { pageable: { page: currentPage }, search: searchTerm, includeInactive: showInactive }
    })
  })

  const { mutateAsync: restoreExercise, isPending: isRestoring } = useMutation(restoreExerciseMutation());

  useEffect(() => {
    setTotalPages(exercises?.totalPages!)
  }, [exercises])

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
  }

  const handleSearch = () => {
    try {
      setSearchTerm(searchInput)
      setCurrentPage(0)
    } catch (err) {
      console.error('Erro ao realizar busca:', err)
      toast({
        title: "Erro",
        description: "Erro ao realizar busca. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setSearchTerm("")
    setCurrentPage(0)
  }

  const handlePageChange = (newPage: number) => {
    try {
      setCurrentPage(newPage)
    } catch (err) {
      console.error('Erro ao mudar página:', err)
      toast({
        title: "Erro",
        description: "Erro ao mudar página. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const openDeleteDialog = (exercise: ExerciseResponseDto) => {
    setExerciseToDelete(exercise)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (exercise: ExerciseResponseDto) => {
    setEditingExercise(exercise);
    setIsEditExerciseOpen(true);
  }

  const openDetailsDialog = (exercise: ExerciseResponseDto) => {
    setSelectedExercise(exercise)
    setIsDetailsDialogOpen(true)
  }

  const handleRestoreExercise = async (exercise: ExerciseResponseDto) => {
    try {
      restoreExercise({ path: { id: String(exercise?.id) }, client: apiClient })

      toast({
        title: "Sucesso",
        description: "Exercício restaurado com sucesso!",
      })

      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAllExercises'
      })
    } catch (err) {
      console.error('Erro ao restaurar exercício:', err)
      toast({
        title: "Erro",
        description: "Erro ao restaurar exercício. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Exercícios</h1>
            <p className="text-muted-foreground">Biblioteca de exercícios para fichas de treino</p>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsNewExerciseOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>

          <CreateExerciseModal
            isOpen={isNewExerciseOpen}
            onClose={() => setIsNewExerciseOpen(false)}
          />

          <EditExerciseModal
            isOpen={isEditExerciseOpen}
            onClose={() => setIsEditExerciseOpen(false)}
            exercise={editingExercise}
          />

        </div>


        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar exercícios por nome ou descrição..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-10"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">
              Mostrar excluídos
            </Label>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Página {currentPage + 1} de {totalPages} ({exercises?.totalElements} exercícios nesta página)
        </div>


        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="h-36">
                <CardHeader className="pb-3 pt-3 px-3 min-h-16">
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="px-3 pb-3 min-h-16">
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Exercises Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3">
            {exercises?.content!.map((exercise) => (
              <Card
                key={exercise.id}
                className={`hover:shadow-md transition-shadow h-36 flex flex-col cursor-pointer ${exercise.deletedAt ? 'opacity-60 border-red-200 bg-red-50/30' : ''
                  }`}
                onClick={() => openDetailsDialog(exercise)}
              >
                <CardHeader className="pb-3 pt-3 px-3 flex-shrink-0 min-h-16">
                  <div className="flex items-start justify-between h-full">
                    <div className="flex-1 min-w-0 pr-2 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm font-medium leading-tight break-words min-h-8 flex-1"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'break-word'
                          }}
                        >
                          {exercise.name}
                        </CardTitle>
                        {exercise.deletedAt && (
                          <Badge variant="destructive" className="text-xs px-1 py-0 flex-shrink-0">
                            Excluído
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 hover:bg-black hover:text-white"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              openDetailsDialog(exercise)
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {!exercise.deletedAt ? (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditDialog(exercise)
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openDeleteDialog(exercise)
                                }}
                                className="cursor-pointer text-red-600 focus:text-white focus:bg-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestoreExercise(exercise)
                              }}
                              className="cursor-pointer text-green-600 focus:text-white focus:bg-green-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restaurar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 flex-1 min-h-16">
                  <div className="h-full overflow-hidden">
                    {exercise.description ? (
                      <CardDescription
                        className="text-sm leading-relaxed break-words"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {exercise.description}
                      </CardDescription>
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        Sem descrição
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && exercises?.content!.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente ajustar o termo de busca." : "Comece adicionando o primeiro exercício."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsNewExerciseOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Exercício
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  Anterior
                </PaginationPrevious>
              </PaginationItem>

              {/* Generate page numbers - show only 3 pages at a time */}
              {(() => {
                const pages = []
                const startPage = Math.max(0, currentPage - 1)
                const endPage = Math.min(totalPages - 1, currentPage + 1)

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                return pages
              })()}


              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  Próxima
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Exercise Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4">Detalhes do Exercício</DialogTitle>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Nome</h3>
                <p className="text-sm break-words">{selectedExercise?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedExercise?.description || "Sem descrição"}
                </p>
              </div>
              {selectedExercise?.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Criação</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExercise.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {selectedExercise?.deletedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Exclusão</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExercise.deletedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="w-full mt-6">
              Fechar
            </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Exercise Dialog */}
        <DeleteExerciseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          exercise={exerciseToDelete}
        />
      </div>
    </Layout>
  )
}
