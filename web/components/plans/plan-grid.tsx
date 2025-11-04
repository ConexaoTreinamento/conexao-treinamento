"use client";

import { EntityList } from "@/components/base/entity-list";
import { Skeleton } from "@/components/ui/skeleton";
import PlanCard from "@/components/plans/plan-card";
import type { PlanWithId } from "./plan-types";

type PlanListProps = {
  plans: PlanWithId[];
  onDeletePlan: (planId: string) => void;
  onRestorePlan: (planId: string) => void;
  isDeleting: boolean;
  isRestoring: boolean;
};

export function PlanList({
  plans,
  onDeletePlan,
  onRestorePlan,
  isDeleting,
  isRestoring,
}: PlanListProps) {
  if (!plans.length) {
    return null;
  }

  return (
    <EntityList>
      {plans.map(({ id, name, maxDays, durationDays, active, description }) => (
        <PlanCard
          key={id}
          id={id}
          name={name ?? "Plano sem nome"}
          maxDays={maxDays ?? 0}
          durationDays={durationDays ?? 0}
          active={Boolean(active)}
          description={description ?? null}
          onDelete={() => onDeletePlan(id)}
          onRestore={() => onRestorePlan(id)}
          deleting={isDeleting}
          restoring={isRestoring}
        />
      ))}
    </EntityList>
  );
}

export function PlanListSkeleton() {
  return (
    <EntityList>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
        </div>
      ))}
    </EntityList>
  );
}

export { PlanList as PlanGrid };
