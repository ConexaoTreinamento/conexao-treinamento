import { Filter, Mail, Phone, Calendar, Clock, Edit, Trash2, Users, TriangleAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/base/search-input"
import { EmptyState } from "@/components/base/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TrainerCardData {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  joinDate?: string | null
  hoursWorked?: number | null
  active: boolean
  compensationType?: "MONTHLY" | "HOURLY" | null
  specialties: string[]
}

export interface TrainerFilters {
  status: "Ativo" | "Inativo" | "all"
  compensation: "all" | "Horista" | "Mensalista"
  specialty: string
}

interface TrainersToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onToggleFilters: () => void
  filtersOpen: boolean
  hasActiveFilters: boolean
}

export function TrainersToolbar({ searchValue, onSearchChange, onToggleFilters, filtersOpen, hasActiveFilters }: TrainersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nome, email ou telefone"
        label="Buscar professores"
      />
      <Button
        type="button"
        variant={hasActiveFilters ? "default" : "outline"}
        onClick={onToggleFilters}
        className="sm:w-auto"
      >
        <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
        {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
      </Button>
    </div>
  )
}

interface TrainersFiltersPanelProps {
  filters: TrainerFilters
  onChange: (nextFilters: TrainerFilters) => void
}

export function TrainersFiltersPanel({ filters, onChange }: TrainersFiltersPanelProps) {
  const handleStatusChange = (value: "Ativo" | "Inativo" | "all") => {
    onChange({ ...filters, status: value })
  }

  const handleCompensationChange = (value: "all" | "Horista" | "Mensalista") => {
    onChange({ ...filters, compensation: value })
  }

  const handleSpecialtyChange = (value: string) => {
    onChange({ ...filters, specialty: value })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="trainer-status-filter">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleStatusChange(value as TrainerFilters["status"])}>
            <SelectTrigger id="trainer-status-filter">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trainer-compensation-filter">Compensação</Label>
          <Select
            value={filters.compensation}
            onValueChange={(value) => handleCompensationChange(value as TrainerFilters["compensation"])}
          >
            <SelectTrigger id="trainer-compensation-filter">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Horista">Horista</SelectItem>
              <SelectItem value="Mensalista">Mensalista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trainer-specialty-filter">Especialidade</Label>
          <Input
            id="trainer-specialty-filter"
            placeholder="Filtrar por especialidade"
            value={filters.specialty}
            onChange={(event) => handleSpecialtyChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface TrainersGridProps {
  trainers: TrainerCardData[]
  onOpen: (trainerId: string) => void
  onEdit: (trainerId: string) => void
  onDelete: (trainerId: string) => void
  canManage: boolean
}

export function TrainersGrid({ trainers, onOpen, onEdit, onDelete, canManage }: TrainersGridProps) {
  if (!trainers.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {trainers.map((trainer) => (
        <TrainerCard
          key={trainer.id}
          trainer={trainer}
          canManage={canManage}
          onOpen={() => onOpen(trainer.id)}
          onEdit={() => onEdit(trainer.id)}
          onDelete={() => onDelete(trainer.id)}
        />
      ))}
    </div>
  )
}

interface TrainerCardProps {
  trainer: TrainerCardData
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  canManage: boolean
}

function TrainerCard({ trainer, onOpen, onEdit, onDelete, canManage }: TrainerCardProps) {
  const initials = (trainer.name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)

  const joinDateLabel = trainer.joinDate ? new Date(trainer.joinDate).toLocaleDateString("pt-BR") : undefined
  const hoursWorkedLabel = typeof trainer.hoursWorked === "number" ? `${trainer.hoursWorked}h este mês` : undefined
  const compensationLabel = trainer.compensationType === "MONTHLY" ? "Mensalista" : "Horista"

  const statusBadgeClass = trainer.active
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"

  const compensationBadgeClass = trainer.compensationType === "MONTHLY"
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base leading-tight">{trainer.name}</CardTitle>
              <div className="flex flex-wrap gap-1">
                <Badge className={statusBadgeClass}>{trainer.active ? "Ativo" : "Inativo"}</Badge>
                {trainer.compensationType ? <Badge className={compensationBadgeClass}>{compensationLabel}</Badge> : null}
              </div>
            </div>
          </div>

          {canManage && trainer.active ? (
            <div className="flex shrink-0 gap-1" onClick={(event) => event.stopPropagation()}>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} aria-label="Editar professor">
                <Edit className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={onDelete}
                aria-label="Excluir professor"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-2 text-sm">
          {trainer.email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="truncate" title={trainer.email}>
                {trainer.email}
              </span>
            </div>
          ) : null}
          {trainer.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{trainer.phone}</span>
            </div>
          ) : null}
          {joinDateLabel ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Desde {joinDateLabel}</span>
            </div>
          ) : null}
          {hoursWorkedLabel ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>{hoursWorkedLabel}</span>
            </div>
          ) : null}
        </div>

        {trainer.specialties.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Especialidades</p>
            <div className="flex flex-wrap gap-1">
              {trainer.specialties.slice(0, 2).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {trainer.specialties.length > 2 ? (
                <Badge variant="outline" className="text-xs">
                  +{trainer.specialties.length - 2}
                </Badge>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function TrainersSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-dashed">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface TrainersEmptyStateProps {
  hasSearch: boolean
  hasActiveFilters: boolean
  onCreate: () => void
  onClearSearch?: () => void
  onClearFilters?: () => void
}

export function TrainersEmptyState({ hasSearch, hasActiveFilters, onCreate, onClearSearch, onClearFilters }: TrainersEmptyStateProps) {
  const hasFiltersApplied = hasSearch || hasActiveFilters

  return (
    <EmptyState
      icon={<Users className="h-12 w-12" aria-hidden="true" />}
      title={hasFiltersApplied ? "Nenhum professor encontrado" : "Nenhum professor cadastrado"}
      description={
        hasFiltersApplied
          ? "Tente ajustar os filtros ou termo de busca."
          : "Cadastre o primeiro professor para acompanhar aulas e avaliações."
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          {hasSearch && onClearSearch ? (
            <Button variant="outline" onClick={onClearSearch}>
              Limpar busca
            </Button>
          ) : null}
          {hasActiveFilters && onClearFilters ? (
            <Button variant="outline" onClick={onClearFilters}>
              Limpar filtros
            </Button>
          ) : null}
          <Button className="bg-green-600 hover:bg-green-700" onClick={onCreate}>
            Novo professor
          </Button>
        </div>
      }
    />
  )
}

interface TrainersErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function TrainersErrorState({ message, onRetry }: TrainersErrorStateProps) {
  return (
    <EmptyState
      icon={<TriangleAlert className="h-12 w-12 text-red-500" aria-hidden="true" />}
      title="Erro ao carregar professores"
      description={message ?? "Tente novamente em instantes."}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null
      }
    />
  )
}