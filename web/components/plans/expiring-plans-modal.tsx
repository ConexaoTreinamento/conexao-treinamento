"use client";

import {useMemo} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {AlertTriangle, Calendar, Loader2, Mail, Phone, User,} from "lucide-react";
import Link from "next/link";
import {useQueries, useQuery} from "@tanstack/react-query";
import type { StudentResponseDto,} from "@/lib/api-client";
import {expiringPlanAssignmentsQueryOptions} from "@/lib/students/hooks/student-queries";
import {getAssignmentEndDate, PlanAssignmentStatusBadge} from "./expiring-plans";
import {findStudentByIdOptions} from "@/lib/api-client/@tanstack/react-query.gen";
import {apiClient} from "@/lib/client";
import {EXPIRING_LOOKAHEAD_DAYS} from "@/lib/students/constants";

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
            const student = assignment.studentId
                ? studentMap.get(assignment.studentId)
                : undefined;
            return {assignment, student} as const;
          }),
      [expiringAssignments, studentMap],
  );

  const isLoading =
      expiringAssignmentsQuery.isLoading || expiringAssignmentsQuery.isFetching;
  const isRefetching = expiringAssignmentsQuery.isRefetching;
  const hasAssignments = assignmentsWithDetails.length > 0;
  const studentsLoading = studentQueries.some(
      (query) => query.isLoading || query.isFetching,
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return "Sem data";
    }
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

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
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin"/>
                    <span>Carregando planos...</span>
                  </div>
                </div>
            ) : expiringAssignmentsQuery.isError ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-10 h-10 mx-auto text-red-500"/>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Não foi possível carregar os planos
                  </p>
                  <p className="text-sm">
                    Tente novamente em instantes ou verifique sua conexão.
                  </p>
                  <Button
                      variant="outline"
                      onClick={() => expiringAssignmentsQuery.refetch()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : hasAssignments ? (
              <>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-800 dark:text-orange-200">
                      {assignmentsWithDetails.length} aluno(s) necessitam atenção
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Entre em contato para renovar ou ajustar seus planos
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {assignmentsWithDetails.map(({assignment, student}) => {
                    const fullName = student
                        ? `${student.name ?? ""} ${student.surname ?? ""}`.trim() ||
                        assignment.studentName ||
                        "Aluno sem nome"
                        : assignment.studentName || "Aluno sem nome";
                    const email = student?.email ?? "Não informado";
                    const phone = student?.phone ?? "Não informado";
                    const endDate = getAssignmentEndDate(assignment) ?? null;

                    return (
                        <Link
                            key={assignment.id ?? fullName}
                            href={assignment.studentId ? `/students/${assignment.studentId}` : "/students"}
                            onClick={onClose}
                            className="block"
                        >
                          <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground"/>
                                <span className="font-medium">{fullName}</span>
                              </div>
                              <PlanAssignmentStatusBadge assignment={assignment}/>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3"/>
                                <span className="hover:underline">{email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3"/>
                                <span className="hover:underline">{phone}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-3 h-3 text-muted-foreground"/>
                              <span className="text-muted-foreground">Vencimento:</span>
                              <span className="font-medium">{formatDate(endDate)}</span>
                              {isRefetching || studentsLoading ? (
                                  <Loader2 className="ml-2 h-3 w-3 animate-spin text-muted-foreground"/>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                    );
                  })}
                </div>
              </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500"/>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      Nenhum plano próximo ao vencimento
                    </p>
                    <p className="text-sm">Todos os planos estão em dia!</p>
                  </div>
                </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button asChild>
              <Link href="/students" onClick={onClose}>
                Ver todos os alunos
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}
