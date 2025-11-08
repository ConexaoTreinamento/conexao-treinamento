import type { ChangeEvent, ReactNode } from "react";
import {
  Calendar,
  Mail,
  Phone,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/base/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EntityCard,
  type EntityCardMetadataItem,
} from "@/components/base/entity-card";
import { StatusBadge } from "@/components/base/status-badge";
import { EntityList } from "@/components/base/entity-list";
import { EditButton } from "@/components/base/edit-button";
import ConfirmDeleteButton from "@/components/base/confirm-delete-button";
import { TrainerCompensationBadge } from "@/components/trainers/trainer-compensation-badge";
import { EntityStatusFilter } from "@/components/base/entity-status-filter";
import type { EntityStatusFilterValue } from "@/lib/entity-status";

export interface TrainerCardData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  joinDate?: string | null;
  hoursWorked?: number | null;
  active: boolean;
  compensationType?: "MONTHLY" | "HOURLY" | null;
  specialties: string[];
}

export interface TrainerFilters {
  status: EntityStatusFilterValue;
  compensation: "all" | "Horista" | "Mensalista";
  specialty: string;
}

export const DEFAULT_TRAINER_FILTERS: TrainerFilters = {
  status: "active",
  compensation: "all",
  specialty: "",
};

export const countActiveTrainerFilters = (filters: TrainerFilters): number => {
  let count = 0;
  if (filters.status !== DEFAULT_TRAINER_FILTERS.status) {
    count += 1;
  }
  if (filters.compensation !== DEFAULT_TRAINER_FILTERS.compensation) {
    count += 1;
  }
  if (filters.specialty.trim() !== DEFAULT_TRAINER_FILTERS.specialty) {
    count += 1;
  }
  return count;
};

interface TrainerFiltersContentProps {
  filters: TrainerFilters;
  onChange: (nextFilters: TrainerFilters) => void;
  onReset?: () => void;
  onClose?: () => void;
}

export function TrainerFiltersContent({
  filters,
  onChange,
  onReset,
  onClose,
}: TrainerFiltersContentProps) {
  const handleStatusChange = (value: EntityStatusFilterValue) => {
    onChange({ ...filters, status: value });
  };

  const handleCompensationChange = (
    value: "all" | "Horista" | "Mensalista",
  ) => {
    onChange({ ...filters, compensation: value });
  };

  const handleSpecialtyChange = (value: string) => {
    onChange({ ...filters, specialty: value });
  };

  const handleReset = () => {
    onReset?.();
    onClose?.();
  };

  const hasActiveFilters = countActiveTrainerFilters(filters) > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <EntityStatusFilter
          id="trainer-status-filter"
          value={filters.status}
          onChange={handleStatusChange}
        />

        <div className="space-y-2">
          <Label htmlFor="trainer-compensation-filter">Compensação</Label>
          <Select
            value={filters.compensation}
            onValueChange={(value: string) =>
              handleCompensationChange(value as TrainerFilters["compensation"])
            }
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="trainer-specialty-filter">Especialidade</Label>
          <Input
            id="trainer-specialty-filter"
            placeholder="Filtrar por especialidade"
            value={filters.specialty}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSpecialtyChange(event.target.value)
            }
          />
        </div>
      </div>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-auto"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar filtros
        </Button>
      ) : null}
    </div>
  );
}

interface TrainersGridProps {
  trainers: TrainerCardData[];
  onOpen: (trainerId: string) => void;
  onEdit: (trainerId: string) => void;
  onDelete: (trainerId: string) => void;
  canManage: boolean;
}

export function TrainersGrid({
  trainers,
  onOpen,
  onEdit,
  onDelete,
  canManage,
}: TrainersGridProps) {
  if (!trainers.length) {
    return null;
  }

  return (
    <EntityList>
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
    </EntityList>
  );
}

interface TrainerCardProps {
  trainer: TrainerCardData;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}

function TrainerCard({
  trainer,
  onOpen,
  onEdit,
  onDelete,
  canManage,
}: TrainerCardProps) {
  const nameSource = trainer.name?.trim() || trainer.email || "";
  const displayName = trainer.name?.trim() || trainer.email || "Professor";

  const initials = nameSource
    .split(" ")
    .filter(Boolean)
    .map((token: string) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const joinDateLabel = trainer.joinDate
    ? new Date(trainer.joinDate).toLocaleDateString("pt-BR")
    : null;

  const statusBadge: ReactNode = <StatusBadge active={trainer.active} />;

  const badges: ReactNode[] = [
    statusBadge,
    <TrainerCompensationBadge
      key="compensation"
      compensationType={trainer.compensationType}
    />,
  ].filter(
    Boolean,
  );

  const metadata: EntityCardMetadataItem[] = [
    {
      icon: (
        <Mail className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      ),
      content: trainer.email ?? "Email não informado",
    },
    {
      icon: (
        <Phone className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
      ),
      content: trainer.phone ?? "Telefone não informado",
    },
    {
      icon: (
        <Calendar
          className="h-3 w-3 text-muted-foreground"
          aria-hidden="true"
        />
      ),
      content: joinDateLabel
        ? `Desde ${joinDateLabel}`
        : "Data de ingresso não informada",
    }
  ];

  const infoRows: ReactNode[] = [];

  if (trainer.specialties.length) {
    const total = trainer.specialties.length;
    infoRows.push(
      <span key="specialties-count">
        {total} especialidade{total === 1 ? "" : "s"} cadastrada
        {total === 1 ? "" : "s"}
      </span>,
    );
  }

  const specialtiesBody: ReactNode | undefined = trainer.specialties.length ? (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Especialidades</p>
      <div className="flex flex-wrap gap-1">
        {trainer.specialties.slice(0, 4).map((specialty) => (
          <Badge key={specialty} variant="outline" className="text-xs">
            {specialty}
          </Badge>
        ))}
        {trainer.specialties.length > 4 ? (
          <Badge variant="outline" className="text-xs">
            +{trainer.specialties.length - 4}
          </Badge>
        ) : null}
      </div>
    </div>
  ) : undefined;

  const mobileActions =
    canManage && trainer.active ? (
      <>
        <EditButton
          size="icon"
          variant="outline"
          className="h-8 w-8"
          aria-label="Editar professor"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          fullWidthOnDesktop={false}
        />
        <ConfirmDeleteButton
          size="icon"
          aria-label="Excluir professor"
          onConfirm={() => onDelete()}
          confirmText="Excluir"
          title="Excluir professor"
          description="Tem certeza que deseja excluir este professor?"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Excluir professor</span>
        </ConfirmDeleteButton>
      </>
    ) : null;

  const desktopActions =
    canManage && trainer.active ? (
      <>
        <EditButton
          size="sm"
          variant="outline"
          className="h-8 px-3 text-sm"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          fullWidthOnDesktop={false}
        />
        <ConfirmDeleteButton
          size="sm"
          onConfirm={() => onDelete()}
          title="Excluir professor"
          description="Tem certeza que deseja excluir este professor?"
          className="h-8 px-3 text-sm gap-2"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>Excluir</span>
        </ConfirmDeleteButton>
      </>
    ) : null;

  return (
    <EntityCard
      title={displayName}
      avatar={{ label: initials }}
      badges={badges}
      metadata={metadata}
      infoRows={infoRows}
      body={specialtiesBody}
      onClick={trainer.active ? onOpen : undefined}
      disabled={!trainer.active}
      muted={!trainer.active}
      mobileActions={mobileActions}
      desktopActions={desktopActions}
    />
  );
}

export function TrainersSkeletonGrid() {
  return (
    <EntityList>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-dashed bg-card p-4"
        >
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </EntityList>
  );
}

interface TrainersEmptyStateProps {
  hasSearch: boolean;
  hasActiveFilters: boolean;
  onCreate: () => void;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}

export function TrainersEmptyState({
  hasSearch,
  hasActiveFilters,
  onCreate,
  onClearSearch,
  onClearFilters,
}: TrainersEmptyStateProps) {
  const hasFiltersApplied = hasSearch || hasActiveFilters;

  return (
    <EmptyState
      icon={<Users className="h-12 w-12" aria-hidden="true" />}
      title={
        hasFiltersApplied
          ? "Nenhum professor encontrado"
          : "Nenhum professor cadastrado"
      }
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
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onCreate}
          >
            Novo professor
          </Button>
        </div>
      }
    />
  );
}

interface TrainersErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function TrainersErrorState({
  message,
  onRetry,
}: TrainersErrorStateProps) {
  return (
    <EmptyState
      icon={
        <TriangleAlert className="h-12 w-12 text-red-500" aria-hidden="true" />
      }
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
  );
}
