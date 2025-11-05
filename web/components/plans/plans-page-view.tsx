"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import {
  createPlanMutation,
  deletePlanMutation,
  getAllPlansOptions,
  getAllPlansQueryKey,
  restorePlanMutation,
} from "@/lib/api-client/@tanstack/react-query.gen";
import { useToast } from "@/hooks/use-toast";
import type { StudentPlanResponseDto } from "@/lib/api-client";
import { PageHeader } from "@/components/base/page-header";
import { handleHttpError } from "@/lib/error-utils";
import { PlanStatusFilter } from "@/components/plans/plan-status-filter";
import {
  PlanCreateDialog,
  type PlanFormValues,
} from "@/components/plans/plan-create-dialog";
import { PlanList, PlanListSkeleton } from "@/components/plans/plan-grid";
import type {
  PlanStatusValue,
  PlanWithId,
} from "@/lib/plans/plan-types";
import { PLAN_STATUS_EMPTY_MESSAGES } from "@/lib/plans/plan-types";
import { Section } from "@/components/base/section";
import { EmptyState } from "@/components/base/empty-state";
import { Button } from "@/components/ui/button";

const PLAN_STATUS_TO_INVALIDATE: PlanStatusValue[] = [
  "active",
  "inactive",
  "all",
];

const hasStatus = (value: unknown): value is { status?: number } =>
  typeof value === "object" && value !== null && "status" in value;

const hasPlanId = (
  plan: StudentPlanResponseDto | undefined,
): plan is PlanWithId => typeof plan?.id === "string" && plan.id.length > 0;

export function PlansPageView() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<PlanStatusValue>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const invalidateAllStatusVariants = useCallback(
    () =>
      Promise.all(
        PLAN_STATUS_TO_INVALIDATE.map((status) =>
          queryClient.invalidateQueries({
            queryKey: getAllPlansQueryKey({
              client: apiClient,
              query: { status },
            }),
          }),
        ),
      ),
    [queryClient],
  );

  const plansQueryOptions = useMemo(
    () =>
      getAllPlansOptions({
        client: apiClient,
        query: { status: statusFilter },
      }),
    [statusFilter],
  );

  const { data, isLoading, error } = useQuery(plansQueryOptions);

  const createPlan = useMutation({
    ...createPlanMutation({ client: apiClient }),
    onSuccess: async () => {
      await invalidateAllStatusVariants();
      toast({ title: "Plano criado", variant: "success" });
    },
    onError: (err) => {
      if (hasStatus(err) && err.status === 409) {
        toast({
          title: "Nome já utilizado",
          description:
            "Já existe um plano com este nome. Escolha outro nome e tente novamente.",
          variant: "destructive",
        });
      } else {
        handleHttpError(err, "criar plano", "Erro ao criar plano");
      }
    },
  });

  const deletePlan = useMutation({
    ...deletePlanMutation({ client: apiClient }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: plansQueryOptions.queryKey });
      const previousPlans = queryClient.getQueryData<StudentPlanResponseDto[]>(
        plansQueryOptions.queryKey,
      );
      if (previousPlans) {
        const updatedPlans = previousPlans.map((plan) =>
          plan?.id === variables.path.planId
            ? { ...plan, active: false }
            : plan,
        );
        queryClient.setQueryData(plansQueryOptions.queryKey, updatedPlans);
      }
      return { previousPlans };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPlans) {
        queryClient.setQueryData(
          plansQueryOptions.queryKey,
          context.previousPlans,
        );
      }
      toast({ title: "Erro ao excluir plano", variant: "destructive" });
    },
    onSuccess: () => toast({ title: "Plano excluído" }),
    onSettled: async () => {
      await invalidateAllStatusVariants();
    },
  });

  const restorePlan = useMutation({
    ...restorePlanMutation({ client: apiClient }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: plansQueryOptions.queryKey });
    },
    onSuccess: async () => {
      toast({ title: "Plano restaurado" });
      await invalidateAllStatusVariants();
    },
    onError: (err) =>
      handleHttpError(err, "restaurar plano", "Erro ao restaurar plano"),
    onSettled: async () => {
      await invalidateAllStatusVariants();
    },
  });

  const plans = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const withId = list.filter(hasPlanId);
    withId.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    return withId;
  }, [data]);

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando planos...";
    }

    if (error) {
      return "Não foi possível carregar os planos.";
    }

    if (!plans.length) {
      return statusFilter === "all"
        ? "Nenhum plano cadastrado ainda."
        : "Nenhum plano encontrado para o filtro selecionado.";
    }

    const label = plans.length === 1 ? "plano exibido" : "planos exibidos";
    return `${plans.length} ${label}`;
  }, [error, isLoading, plans.length, statusFilter]);

  const handleCreatePlan = useCallback(
    async (values: PlanFormValues) => {
      await createPlan.mutateAsync({
        body: {
          name: values.name,
          maxDays: values.maxDays,
          durationDays: values.durationDays,
        },
        client: apiClient,
      });
    },
    [createPlan],
  );

  const handleDeletePlan = useCallback(
    (planId: string) => {
      deletePlan.mutate({ path: { planId }, client: apiClient });
    },
    [deletePlan],
  );

  const handleRestorePlan = useCallback(
    (planId: string) => {
      restorePlan.mutate({ path: { planId }, client: apiClient });
    },
    [restorePlan],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Planos"
          description="Gerencie os planos de assinatura"
        />
        <div className="flex items-center gap-2">
          <PlanStatusFilter
            value={statusFilter}
            onValueChange={setStatusFilter}
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
          />
          <PlanCreateDialog
            onCreate={handleCreatePlan}
            isSubmitting={createPlan.isPending}
          />
        </div>
      </div>

      <Section title="Resultados" description={resultsSummary}>
        {isLoading ? <PlanListSkeleton /> : null}

        {error ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" aria-hidden="true" />}
            title="Não foi possível carregar os planos"
            description={
              error instanceof Error
                ? error.message
                : "Tente novamente em instantes."
            }
            action={
              <Button
                variant="outline"
                onClick={() => {
                  void queryClient.invalidateQueries({
                    queryKey: plansQueryOptions.queryKey,
                  });
                }}
              >
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!isLoading && !error && plans.length > 0 ? (
          <PlanList
            plans={plans}
            onDeletePlan={handleDeletePlan}
            onRestorePlan={handleRestorePlan}
            isDeleting={deletePlan.isPending}
            isRestoring={restorePlan.isPending}
          />
        ) : null}

        {!isLoading && !error && plans.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" aria-hidden="true" />}
            title={
              statusFilter === "all"
                ? "Nenhum plano cadastrado"
                : "Nenhum plano encontrado"
            }
            description={PLAN_STATUS_EMPTY_MESSAGES[statusFilter]}
          />
        ) : null}
      </Section>
    </div>
  );
}
