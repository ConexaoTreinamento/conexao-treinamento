"use client";

import {AlertTriangle, Loader2} from "lucide-react";
import type {StudentPlanAssignmentResponseDto, StudentResponseDto} from "@/lib/api-client/types.gen";
import {Button} from "@/components/ui/button";
import {ExpiringPlanAssignmentCard} from "./expiring-plan-assignment-card";

export type AssignmentWithStudent = {
  assignment: StudentPlanAssignmentResponseDto;
  student?: StudentResponseDto;
};

interface ExpiringPlansBodyProps {
  assignments: AssignmentWithStudent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
  showStatusSpinner: boolean;
}

export function ExpiringPlansBody({
  assignments,
  isLoading,
  isError,
  onRetry,
  onClose,
  showStatusSpinner,
}: ExpiringPlansBodyProps) {
  if (isLoading) {
    return <ExpiringPlansLoadingState />;
  }

  if (isError) {
    return <ExpiringPlansErrorState onRetry={onRetry} />;
  }

  if (!assignments.length) {
    return <ExpiringPlansEmptyState />;
  }

  return (
      <>
        <ExpiringPlansSummary count={assignments.length} />
        <ExpiringPlanAssignmentsList
            assignments={assignments}
            onClose={onClose}
            showStatusSpinner={showStatusSpinner}
        />
      </>
  );
}

function ExpiringPlansLoadingState() {
  return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando planos...</span>
        </div>
      </div>
  );
}

function ExpiringPlansErrorState({ onRetry }: { onRetry: () => void }) {
  return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
          <p className="font-medium text-red-600 dark:text-red-400">
            Não foi possível carregar os planos
          </p>
          <p className="text-sm">Tente novamente em instantes ou verifique sua conexão.</p>
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      </div>
  );
}

function ExpiringPlansSummary({ count }: { count: number }) {
  return (
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="font-medium text-orange-800 dark:text-orange-200">
            {count} aluno(s) necessitam atenção
          </span>
        </div>
        <p className="text-sm text-orange-700 dark:text-orange-300">
          Entre em contato para renovar ou ajustar seus planos
        </p>
      </div>
  );
}

interface ExpiringPlanAssignmentsListProps {
  assignments: AssignmentWithStudent[];
  onClose: () => void;
  showStatusSpinner: boolean;
}

function ExpiringPlanAssignmentsList({
  assignments,
  onClose,
  showStatusSpinner,
}: ExpiringPlanAssignmentsListProps) {
  return (
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {assignments.map(({ assignment, student }) => (
            <ExpiringPlanAssignmentCard
                key={assignment.id ?? `${assignment.studentId ?? "unknown"}-${assignment.startDate ?? "start"}`}
                assignment={assignment}
                student={student}
                onClose={onClose}
                showStatusSpinner={showStatusSpinner}
            />
        ))}
      </div>
  );
}

function ExpiringPlansEmptyState() {
  return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            Nenhum plano próximo ao vencimento
          </p>
          <p className="text-sm">Todos os planos estão em dia!</p>
        </div>
      </div>
  );
}
