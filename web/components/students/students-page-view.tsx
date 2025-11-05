"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PageSelector from "@/components/ui/page-selector";
import { PageHeader } from "@/components/base/page-header";
import { Section } from "@/components/base/section";
import { FilterToolbar } from "@/components/base/filter-toolbar";
import StudentForm, {
  type StudentFormData,
} from "@/components/students/student-form";
import { StudentFiltersContent } from "@/components/students/student-filters";
import {
  StudentsEmptyState,
  StudentsErrorState,
  StudentsList,
  StudentsLoadingList,
} from "@/components/students/students-view";
import { useToast } from "@/hooks/use-toast";
import { handleHttpError } from "@/lib/error-utils";
import { useStudentsPageState } from "@/lib/students/students-page-state";
import { buildStudentRequestPayload } from "@/lib/students/student-form-transforms";
import type {
  StudentPlanAssignmentResponseDto,
  StudentResponseDto,
} from "@/lib/api-client/types.gen";
import type { UseFormReturn } from "react-hook-form";
import type { StudentFilters } from "@/lib/students/types";

interface StudentsPageLayoutProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  filtersForm: UseFormReturn<StudentFilters>;
  professions: string[];
  onFiltersReset: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  resultDescription: string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  students: StudentResponseDto[];
  resolveAssignment: (
    studentId: string,
  ) => StudentPlanAssignmentResponseDto | null;
  onOpenDetails: (studentId: string) => void;
  onCreateEvaluation: (studentId: string) => void;
  onRestore: (studentId: string) => Promise<void>;
  onDelete: (studentId: string) => Promise<void>;
  isRestoring: boolean;
  isDeleting: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  onCreateStudent: (formData: StudentFormData) => Promise<void>;
  onCancelCreate: () => void;
  isCreating: boolean;
  onResetAllFilters: () => void;
}

function StudentsPageLayout({
  searchTerm,
  onSearchChange,
  onClearSearch,
  filtersForm,
  professions,
  onFiltersReset,
  activeFilterCount,
  hasActiveFilters,
  resultDescription,
  isLoading,
  error,
  onRetry,
  students,
  resolveAssignment,
  onOpenDetails,
  onCreateEvaluation,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
  totalPages,
  currentPage,
  onPageChange,
  isCreateOpen,
  onCreateOpenChange,
  onCreateStudent,
  onCancelCreate,
  isCreating,
  onResetAllFilters,
}: StudentsPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Alunos"
          description="Gerencie todos os alunos da academia"
        />
        <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar novo aluno</DialogTitle>
              <DialogDescription>
                Preencha as informa��es do aluno e a ficha de anamnese
              </DialogDescription>
            </DialogHeader>

            <StudentForm
              onSubmit={onCreateStudent}
              onCancel={onCancelCreate}
              submitLabel="Cadastrar Aluno"
              isLoading={isCreating}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <FilterToolbar
        searchValue={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar alunos por nome, email, telefone ou profiss�o..."
        searchLabel="Buscar alunos"
        activeFilterCount={activeFilterCount}
        filterTitle="Filtros avan�ados"
        filterDescription="Refine sua busca por alunos"
        renderFilters={({ close }) => (
          <StudentFiltersContent
            filtersForm={filtersForm}
            professions={professions}
            onFiltersReset={() => {
              onFiltersReset();
              close();
            }}
            onClose={close}
          />
        )}
      />

      <Section title="Resultados" description={resultDescription}>
        {isLoading ? <StudentsLoadingList /> : null}

        {error ? (
          <StudentsErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={onRetry}
          />
        ) : null}

        {!isLoading && !error && students.length > 0 ? (
          <>
            <StudentsList
              students={students}
              resolveAssignment={resolveAssignment}
              onOpenDetails={onOpenDetails}
              onCreateEvaluation={onCreateEvaluation}
              onRestore={onRestore}
              onDelete={onDelete}
              isRestoring={isRestoring}
              isDeleting={isDeleting}
            />

            {totalPages > 1 ? (
              <PageSelector
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            ) : null}
          </>
        ) : null}

        {!isLoading && !error && students.length === 0 ? (
          <StudentsEmptyState
            hasSearchTerm={Boolean(searchTerm)}
            hasActiveFilters={hasActiveFilters}
            onCreate={() => onCreateOpenChange(true)}
            onClearSearch={searchTerm ? onClearSearch : undefined}
            onClearFilters={hasActiveFilters ? onResetAllFilters : undefined}
          />
        ) : null}
      </Section>
    </div>
  );
}

export function StudentsPageView() {
  const {
    form,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    students,
    totalPages,
    isLoading,
    error,
    refetch,
    activeFilterCount,
    hasActiveFilters,
    uniqueProfessions,
    resultDescription,
    resolveAssignment,
    deleteStudent,
    restoreStudent,
    createStudent,
    assignPlan,
    isDeleting,
    isRestoring,
    resetFilters,
  } = useStudentsPageState();
  const { toast } = useToast();
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(0);
    },
    [setCurrentPage, setSearchTerm],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(0);
  }, [setCurrentPage, setSearchTerm]);

  const handleResetAllFilters = useCallback(() => {
    setSearchTerm("");
    resetFilters();
    setCurrentPage(0);
  }, [resetFilters, setCurrentPage, setSearchTerm]);

  const handleCreateStudent = useCallback(
    async (formData: StudentFormData) => {
      setIsCreating(true);

      try {
        const requestBody = buildStudentRequestPayload(formData);
        const created = await createStudent.mutateAsync({ body: requestBody });

        let assignedPlan = false;
        if (created?.id && formData.plan) {
          try {
            await assignPlan.mutateAsync({
              path: { studentId: created.id },
              body: {
                planId: formData.plan,
                startDate: new Date().toISOString().substring(0, 10),
                assignmentNotes: "Assinado automaticamente no cadastro.",
              },
            });
            assignedPlan = true;
          } catch (assignError) {
            handleHttpError(
              assignError,
              "atribuir plano",
              "Aluno criado, mas ocorreu um erro ao atribuir o plano.",
            );
          }
        }

        toast({
          title: "Aluno criado",
          description: assignedPlan
            ? "Aluno e plano atribuídos."
            : "Aluno cadastrado com sucesso.",
          variant: "success",
          duration: 3000,
        });
        setIsCreateOpen(false);
      } catch (createError: unknown) {
        handleHttpError(
          createError,
          "criar aluno",
          "Não foi possível criar o aluno. Tente novamente.",
        );
      } finally {
        setIsCreating(false);
      }
    },
    [assignPlan, createStudent, toast],
  );

  const handleDeleteStudent = useCallback(
    async (id: string) => {
      try {
        await deleteStudent({ path: { id } });
        toast({
          title: "Aluno excluído",
          description: "O aluno foi marcado como inativo.",
          duration: 3000,
        });
      } catch (deleteError: unknown) {
        handleHttpError(
          deleteError,
          "excluir aluno",
          "Não foi possível excluir o aluno. Tente novamente.",
        );
      }
    },
    [deleteStudent, toast],
  );

  const handleRestoreStudent = useCallback(
    async (id: string) => {
      try {
        await restoreStudent({ path: { id } });
        toast({
          title: "Aluno reativado",
          description: "O aluno foi reativado com sucesso.",
          duration: 3000,
        });
      } catch (restoreError: unknown) {
        handleHttpError(
          restoreError,
          "reativar aluno",
          "Não foi possível reativar o aluno. Tente novamente.",
        );
      }
    },
    [restoreStudent, toast],
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <StudentsPageLayout
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      filtersForm={form}
      professions={uniqueProfessions}
      onFiltersReset={() => setCurrentPage(0)}
      activeFilterCount={activeFilterCount}
      hasActiveFilters={hasActiveFilters}
      resultDescription={resultDescription}
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      students={students}
      resolveAssignment={resolveAssignment}
      onOpenDetails={(id) => router.push(`/students/${id}`)}
      onCreateEvaluation={(id) => router.push(`/students/${id}/evaluation/new`)}
      onRestore={handleRestoreStudent}
      onDelete={handleDeleteStudent}
      isRestoring={isRestoring}
      isDeleting={isDeleting}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      isCreateOpen={isCreateOpen}
      onCreateOpenChange={setIsCreateOpen}
      onCreateStudent={handleCreateStudent}
      onCancelCreate={() => setIsCreateOpen(false)}
      isCreating={isCreating}
      onResetAllFilters={handleResetAllFilters}
    />
  );
}
