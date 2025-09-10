"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

import { Search, Plus, Activity, Edit, Trash2, X, Eye, RotateCcw, MoreVertical } from "lucide-react"
import Layout from "@/components/layout"
import { DeleteExerciseDialog } from "@/components/exercises/delete-exercise-dialog"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"


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
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    description: "",
  })

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadExercises = async () => {
    try {
      setIsLoading(true)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/exercises?search=${searchTerm}&page=${currentPage}&includeInactive=${showInactive}`)
      
      if (!response.ok) {
        toast({
          title: "Erro",
          description: "Erro ao carregar exercícios. Tente novamente.",
          variant: "destructive",
        })
        setExercises([])
        setTotalPages(1)
        return
      }
      
      const data = await response.json()
      
      // Validação dos dados recebidos
      if (data && typeof data === 'object') { 
        setExercises(Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : [])
        setTotalPages(data.page?.totalPages || 1)
      } else {
        setExercises([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Erro ao carregar exercícios:', err)
      toast({
        title: "Erro",
        description: "Erro ao carregar exercícios. Tente novamente.",
        variant: "destructive",
      })
      setExercises([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [currentPage, searchTerm, showInactive])

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


  const handleCreateExercise = () => {
    try {
      if (newExerciseForm.name.trim()) {
        const newExercise = {
          id: Date.now(),
          name: newExerciseForm.name.trim(),
          description: newExerciseForm.description.trim() || "",
        }
        setExercises((prev) => [...prev, newExercise])
        setNewExerciseForm({
          name: "",
          description: "",
        })
        setIsNewExerciseOpen(false)
        toast({
          title: "Sucesso",
          description: "Exercício criado com sucesso!",
        })
      }
    } catch (err) {
      console.error('Erro ao criar exercício:', err)
      toast({
        title: "Erro",
        description: "Erro ao criar exercício. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEditExercise = () => {
    try {
      if (editingExercise && editingExercise.name.trim()) {
        setExercises((prev) =>
          prev.map((ex) =>
            ex.id === editingExercise.id
              ? {
                  ...ex,
                  name: editingExercise.name.trim(),
                  description: (editingExercise.description || "").trim(),
                }
              : ex,
          ),
        )
        setEditingExercise(null)
        setIsEditExerciseOpen(false)
        toast({
          title: "Sucesso",
          description: "Exercício editado com sucesso!",
        })
      }
    } catch (err) {
      console.error('Erro ao editar exercício:', err)
      toast({
        title: "Erro",
        description: "Erro ao editar exercício. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const openDeleteDialog = (exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise({ ...exercise })
    setIsEditExerciseOpen(true)
  }

  const openDetailsDialog = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsDetailsDialogOpen(true)
  }

  const handleRestoreExercise = async (exercise: Exercise) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/exercises/${exercise.id}/restore`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        toast({
          title: "Erro",
          description: "Erro ao restaurar exercício. Tente novamente.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Sucesso",
        description: "Exercício restaurado com sucesso!",
      })
      
      loadExercises()
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
          <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Exercício
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle className="sr-only">Novo Exercício</DialogTitle>
              <h2 className="text-lg font-semibold mb-4">Novo Exercício</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exerciseName">Nome do Exercício *</Label>
                  <Input
                    id="exerciseName"
                    value={newExerciseForm.name}
                    onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Supino Inclinado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newExerciseForm.description}
                    onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva como executar o exercício..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewExerciseOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateExercise} className="bg-green-600 hover:bg-green-700">
                  Criar Exercício
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Exercise Dialog */}
        <Dialog open={isEditExerciseOpen} onOpenChange={setIsEditExerciseOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle className="sr-only">Editar Exercício</DialogTitle>
            <h2 className="text-lg font-semibold mb-4">Editar Exercício</h2>
            {editingExercise && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editExerciseName">Nome do Exercício *</Label>
                  <Input
                    id="editExerciseName"
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Supino Inclinado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Descrição</Label>
                  <Textarea
                    id="editDescription"
                    value={editingExercise.description}
                    onChange={(e) => setEditingExercise((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva como executar o exercício..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditExerciseOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditExercise} className="bg-green-600 hover:bg-green-700">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          Página {currentPage + 1} de {totalPages} ({exercises.length} exercícios nesta página)
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
            {exercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className={`hover:shadow-md transition-shadow h-36 flex flex-col cursor-pointer ${
                exercise.deletedAt ? 'opacity-60 border-red-200 bg-red-50/30' : ''
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

        {!isLoading && exercises.length === 0 && (
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
          onDelete={loadExercises}
        />
      </div>
    </Layout>
  )
}
