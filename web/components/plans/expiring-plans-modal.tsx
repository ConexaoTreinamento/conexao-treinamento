"use client";

import {useMemo} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {AlertTriangle} from "lucide-react";
import {useQueries, useQuery} from "@tanstack/react-query";
import type {StudentResponseDto} from "@/lib/api-client/types.gen";
import {expiringPlanAssignmentsQueryOptions} from "@/lib/students/hooks/student-queries";
import {findStudentByIdOptions} from "@/lib/api-client/@tanstack/react-query.gen";
import {apiClient} from "@/lib/client";
import {EXPIRING_LOOKAHEAD_DAYS} from "@/lib/students/constants";
import {ExpiringPlansBody, type AssignmentWithStudent} from "./expiring-plans-body";
import {ExpiringPlansFooter} from "./expiring-plans-footer";

interface ExpiringPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpiringPlansModal({
  isOpen,
  onClose,
}: ExpiringPlansModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const expiringAssignmentsQuery = useQuery({
    ...expiringPlanAssignmentsQueryOptions({days: EXPIRING_LOOKAHEAD_DAYS}),
    enabled: isOpen,
  });

  const expiringAssignments = useMemo(
      () =>
          expiringAssignmentsQuery.data ??
              [],
      [expiringAssignmentsQuery.data],
  );

  const studentIds = useMemo(
      () =>
          Array.from(
              new Set(
                  expiringAssignments
                      .map((assignment) => assignment.studentId)
                      .filter((id): id is string => Boolean(id)),
              ),
          ),
      [expiringAssignments],
  );

  const studentQueries = useQueries({
    queries: studentIds.map((studentId) => ({
      ...findStudentByIdOptions({
        client: apiClient,
        path: {id: studentId},
      }),
      enabled: isOpen,
      staleTime: 60_000,
    })),
  });

  const studentMap = useMemo(() => {
    const map = new Map<string, StudentResponseDto>();
    studentQueries.forEach((query, index) => {
      const studentId = studentIds[index];
      if (studentId && query.data) {
        map.set(studentId, query.data);
      }
    });
    return map;
  }, [studentQueries, studentIds]);

  const assignmentsWithDetails = useMemo(
      () =>
          expiringAssignments.map((assignment) => {
            const student = assignment.studentId ? studentMap.get(assignment.studentId) : undefined;
            return { assignment, student } satisfies AssignmentWithStudent;
          }),
      [expiringAssignments, studentMap],
  );

  const isLoading =
      expiringAssignmentsQuery.isLoading || expiringAssignmentsQuery.isFetching;
  const isError = expiringAssignmentsQuery.isError;
  const studentsLoading = studentQueries.some(
      (query) => query.isLoading || query.isFetching,
  );
  const showStatusSpinner = expiringAssignmentsQuery.isRefetching || studentsLoading;

  return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] md:h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Planos próximos ao vencimento
            </DialogTitle>
            <DialogDescription>
              Alunos com planos que vencem nos próximos 7 dias ou já expirados
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <ExpiringPlansBody
                assignments={assignmentsWithDetails}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => {
                  void expiringAssignmentsQuery.refetch();
                }}
                onClose={onClose}
                showStatusSpinner={showStatusSpinner}
            />
          </div>

          <ExpiringPlansFooter onClose={onClose} />
        </DialogContent>
      </Dialog>
  );
}
