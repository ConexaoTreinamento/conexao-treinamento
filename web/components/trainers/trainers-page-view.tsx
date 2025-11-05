"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TrainerModal from "@/components/trainers/trainer-modal";
import { PageHeader } from "@/components/base/page-header";
import { Section } from "@/components/base/section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/base/empty-state";
import {
  countActiveTrainerFilters,
  DEFAULT_TRAINER_FILTERS,
  type TrainerCardData,
  type TrainerFilters,
  TrainerFiltersContent,
  TrainersEmptyState,
  TrainersErrorState,
  TrainersGrid,
  TrainersSkeletonGrid,
} from "@/components/trainers/trainers-view";
import { FilterToolbar } from "@/components/base/filter-toolbar";
import {
  createTrainerAndUserMutation,
  findAllTrainersOptions,
  softDeleteTrainerUserMutation,
  updateTrainerAndUserMutation,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type { ListTrainersDto, TrainerResponseDto } from "@/lib/api-client";
import { apiClient } from "@/lib/client";
import { handleHttpError } from "@/lib/error-utils";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

const INITIAL_FILTERS: TrainerFilters = { ...DEFAULT_TRAINER_FILTERS };

interface NormalizedTrainer extends TrainerCardData {
  searchText: string;
}

export function TrainersPageView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TrainerFilters>({
    ...INITIAL_FILTERS,
  });
  const [userRole, setUserRole] = useState<string>("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingTrainer, setEditingTrainer] = useState<ListTrainersDto | null>(
    null,
  );

  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchTerm.trim().toLowerCase(), 250);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin";
    setUserRole(role);
  }, []);

  const invalidateTrainersQueries = useCallback(() => {
    return queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "object" &&
        query.queryKey[0] !== null &&
        ((query.queryKey[0] as { _id?: string })._id === "findAllTrainers" ||
          (query.queryKey[0] as { _id?: string })._id ===
            "getTrainersForLookup"),
    });
  }, [queryClient]);

  const trainersQuery = useQuery({
    ...findAllTrainersOptions({ client: apiClient }),
  });

  const { data: trainersData, isLoading, error, refetch } = trainersQuery;

  const normalizedTrainers = useMemo<NormalizedTrainer[]>(() => {
    if (!trainersData?.length) {
      return [];
    }

    return trainersData
      .filter((trainer): trainer is ListTrainersDto & { id: string } =>
        Boolean(trainer?.id),
      )
      .map((trainer) => {
        const specialties = trainer.specialties ?? [];
        const searchTokens = [
          trainer.name,
          trainer.email,
          trainer.phone,
          specialties.join(" "),
        ] as Array<string | undefined>;

        return {
          id: trainer.id,
          name: trainer.name ?? "Professor",
          email: trainer.email ?? null,
          phone: trainer.phone ?? null,
          joinDate: trainer.joinDate ?? null,
          hoursWorked: trainer.hoursWorked ?? null,
          active: Boolean(trainer.active),
          compensationType: trainer.compensationType ?? null,
          specialties,
          searchText: searchTokens.filter(Boolean).join(" ").toLowerCase(),
        };
      });
  }, [trainersData]);

  const trainerMap = useMemo(() => {
    const map = new Map<string, ListTrainersDto>();
    trainersData?.forEach((trainer) => {
      if (trainer?.id) {
        map.set(trainer.id, trainer);
      }
    });
    return map;
  }, [trainersData]);

  const filteredTrainers = useMemo(() => {
    return normalizedTrainers.filter((trainer) => {
      const matchesSearch = debouncedSearch
        ? trainer.searchText.includes(debouncedSearch)
        : true;
      const matchesStatus =
        filters.status === "all"
          ? true
          : filters.status === "Ativo"
            ? trainer.active
            : !trainer.active;
      const matchesCompensation =
        filters.compensation === "all"
          ? true
          : filters.compensation === "Mensalista"
            ? trainer.compensationType === "MONTHLY"
            : trainer.compensationType === "HOURLY";
      const matchesSpecialty = filters.specialty
        ? trainer.specialties.some((spec) =>
            spec.toLowerCase().includes(filters.specialty.toLowerCase()),
          )
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCompensation &&
        matchesSpecialty
      );
    });
  }, [normalizedTrainers, debouncedSearch, filters]);

  const activeFilterCount = useMemo(
    () => countActiveTrainerFilters(filters),
    [filters],
  );
  const hasActiveFilters = activeFilterCount > 0;

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando professores...";
    }

    if (error) {
      return "Não foi possível carregar os professores.";
    }

    if (!normalizedTrainers.length) {
      return "Nenhum professor cadastrado ainda.";
    }

    if (!filteredTrainers.length) {
      return "Ajuste a busca ou filtros para encontrar professores.";
    }

    if (hasActiveFilters || debouncedSearch) {
      return `${filteredTrainers.length} de ${normalizedTrainers.length} professores exibidos`;
    }

    return `${filteredTrainers.length} professores cadastrados`;
  }, [
    debouncedSearch,
    error,
    filteredTrainers.length,
    hasActiveFilters,
    isLoading,
    normalizedTrainers.length,
  ]);

  const { mutateAsync: createTrainer } = useMutation(
    createTrainerAndUserMutation({ client: apiClient }),
  );
  const { mutateAsync: updateTrainer } = useMutation(
    updateTrainerAndUserMutation({ client: apiClient }),
  );
  const { mutateAsync: deleteTrainer } = useMutation(
    softDeleteTrainerUserMutation({ client: apiClient }),
  );

  const handleFiltersChange = useCallback((nextFilters: TrainerFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCreateTrainer = useCallback(() => {
    setModalMode("create");
    setEditingTrainer(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTrainer = useCallback(
    (trainerId: string) => {
      const trainer = trainerMap.get(trainerId);
      if (!trainer) {
        return;
      }

      setModalMode("edit");
      setEditingTrainer(trainer);
      setIsModalOpen(true);
    },
    [trainerMap],
  );

  const handleOpenTrainerDetails = useCallback(
    (trainerId: string) => {
      router.push(`/trainers/${trainerId}`);
    },
    [router],
  );

  const handleModalSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      try {
        if (modalMode === "create") {
          await createTrainer({ client: apiClient, body: formData });
          toast({
            title: "Professor criado",
            description: "Professor cadastrado com sucesso.",
            variant: "success",
            duration: 3000,
          });
        } else if (editingTrainer?.id) {
          await updateTrainer({
            client: apiClient,
            path: { id: String(editingTrainer.id) },
            body: formData,
          });
          toast({
            title: "Professor atualizado",
            description: "As alterações foram salvas.",
            variant: "success",
            duration: 3000,
          });
        }

        await invalidateTrainersQueries();
        setIsModalOpen(false);
        setEditingTrainer(null);
      } catch (submitError) {
        const action =
          modalMode === "create" ? "criar treinador" : "atualizar treinador";
        handleHttpError(
          submitError,
          action,
          `Não foi possível ${action}. Tente novamente.`,
        );
      }
    },
    [
      createTrainer,
      editingTrainer,
      invalidateTrainersQueries,
      modalMode,
      toast,
      updateTrainer,
    ],
  );

  const handleDeleteTrainer = useCallback(
    async (trainerId: string) => {
      try {
        await deleteTrainer({
          client: apiClient,
          path: { id: String(trainerId) },
        });
        toast({
          title: "Professor excluído",
          description: "O professor foi marcado como inativo.",
          variant: "success",
          duration: 3000,
        });
        await invalidateTrainersQueries();
      } catch (deleteError) {
        handleHttpError(
          deleteError,
          "excluir treinador",
          "Não foi possível excluir o treinador. Tente novamente.",
        );
      }
    },
    [deleteTrainer, invalidateTrainersQueries, toast],
  );

  const canManageTrainers = userRole === "admin";
  const hasSearchTerm = Boolean(searchTerm.trim());

  if (!canManageTrainers) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<ShieldAlert className="h-12 w-12" aria-hidden="true" />}
          title="Acesso restrito"
          description="Apenas administradores podem acessar a gestão de professores."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Professores"
          description="Gerencie professores e instrutores"
        />
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleCreateTrainer}
        >
          <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo professor
        </Button>
      </div>

      <FilterToolbar
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nome, email ou telefone"
        searchLabel="Buscar professores"
        activeFilterCount={activeFilterCount}
        filterTitle="Filtros de professores"
        filterDescription="Combine filtros para localizar professores rapidamente."
        renderFilters={({ close }) => (
          <TrainerFiltersContent
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleClearFilters}
            onClose={close}
          />
        )}
      />

      <Section title="Professores" description={resultsSummary}>
        {isLoading ? <TrainersSkeletonGrid /> : null}

        {error ? (
          <TrainersErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {!isLoading && !error && filteredTrainers.length ? (
          <TrainersGrid
            trainers={filteredTrainers}
            canManage={canManageTrainers}
            onOpen={handleOpenTrainerDetails}
            onEdit={handleEditTrainer}
            onDelete={handleDeleteTrainer}
          />
        ) : null}

        {!isLoading && !error && !filteredTrainers.length ? (
          <TrainersEmptyState
            hasSearch={hasSearchTerm}
            hasActiveFilters={hasActiveFilters}
            onCreate={handleCreateTrainer}
            onClearSearch={
              hasSearchTerm ? () => handleSearchChange("") : undefined
            }
            onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
          />
        ) : null}
      </Section>

      <TrainerModal
        open={isModalOpen}
        mode={modalMode}
        initialData={
          (editingTrainer ?? undefined) as
            | Partial<TrainerResponseDto>
            | undefined
        }
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrainer(null);
        }}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
