"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  AnamnesisRequestDto,
  AnamnesisResponseDto,
  PhysicalImpairmentRequestDto,
  StudentPlanAssignmentResponseDto,
  StudentRequestDto,
} from "@/lib/api-client/types.gen";
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
  countActiveStudentFilters,
  DEFAULT_STUDENT_FILTERS,
  StudentFilters,
} from "@/lib/students/types";
import {
  StudentsEmptyState,
  StudentsErrorState,
  StudentsList,
  StudentsLoadingList,
} from "@/components/students/students-view";
import useDebounce from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { handleHttpError } from "@/lib/error-utils";
import type {
  AssignPlanToStudentMutationResponse,
  AssignPlanToStudentMutationVariables,
} from "@/lib/students/hooks/student-mutations";
import {
  assignPlanToStudentMutationOptions,
  useCreateStudent,
  useDeleteStudent,
  useRestoreStudent,
} from "@/lib/students/hooks/student-mutations";
import {
  currentStudentPlanQueryOptions,
  expiringPlanAssignmentsQueryOptions,
  useStudents,
} from "@/lib/students/hooks/student-queries";

const EXPIRING_LOOKAHEAD_DAYS = 7;

const resolveGender = (value?: string): StudentRequestDto["gender"] => {
  if (value === "M" || value === "F") {
    return value;
  }
  return "O";
};

const normalizeHasInsomnia = (
  value?: string,
): AnamnesisRequestDto["hasInsomnia"] => {
  if (value === "yes" || value === "no" || value === "sometimes") {
    return value;
  }
  return undefined;
};

const normalizeImpairmentType = (
  value?: string,
): PhysicalImpairmentRequestDto["type"] | undefined => {
  if (
    value === "visual" ||
    value === "auditory" ||
    value === "motor" ||
    value === "intellectual" ||
    value === "other"
  ) {
    return value;
  }
  return undefined;
};

export function StudentsPageView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const form = useForm<StudentFilters>({
    defaultValues: DEFAULT_STUDENT_FILTERS,
    mode: "onChange",
  });
  const watchedFilters = form.watch();

  const { mutateAsync: deleteStudent, isPending: isDeleting } =
    useDeleteStudent();
  const { mutateAsync: restoreStudent, isPending: isRestoring } =
    useRestoreStudent();
  const { mutateAsync: createStudent } = useCreateStudent();
  const queryClient = useQueryClient();

  const assignPlan = useMutation<
    AssignPlanToStudentMutationResponse,
    Error,
    AssignPlanToStudentMutationVariables
  >({
    ...assignPlanToStudentMutationOptions(),
    onSuccess: async (_data, variables) => {
      const tasks = [
        queryClient.invalidateQueries({
          queryKey: expiringPlanAssignmentsQueryOptions({
            days: EXPIRING_LOOKAHEAD_DAYS,
          }).queryKey,
        }),
      ];

      const studentId = variables?.path?.studentId;
      if (studentId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: currentStudentPlanQueryOptions({ studentId }).queryKey,
          }),
        );
      }

      await Promise.all(tasks);
    },
  });

  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  const updatePageInURL = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 0) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    router.replace(`?${params.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const setCurrentPage = (newPage: number) => {
    updatePageInURL(newPage);
  };

  const mapGenderToBackend = (
    frontendGender: StudentFilters["gender"],
  ): string | undefined => {
    switch (frontendGender) {
      case "Masculino":
        return "M";
      case "Feminino":
        return "F";
      case "Outro":
        return "O";
      case "all":
        return undefined;
      default:
        return undefined;
    }
  };

  const pageSize = 20;

  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedFilters = useDebounce(watchedFilters, 400);

  const debouncedInvalidDateRange = Boolean(
    debouncedFilters.startDate &&
      debouncedFilters.endDate &&
      debouncedFilters.startDate > debouncedFilters.endDate,
  );

  const {
    data: studentsData,
    isLoading,
    error,
    refetch,
  } = useStudents({
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(debouncedFilters.gender !== "all" && {
      gender: mapGenderToBackend(debouncedFilters.gender),
    }),
    ...(debouncedFilters.profession !== "all" && {
      profession: debouncedFilters.profession,
    }),
    ...(debouncedFilters.minAge && { minAge: debouncedFilters.minAge }),
    ...(debouncedFilters.maxAge && { maxAge: debouncedFilters.maxAge }),
    ...(!debouncedInvalidDateRange &&
      debouncedFilters.startDate && {
        registrationPeriodMinDate: debouncedFilters.startDate,
      }),
    ...(!debouncedInvalidDateRange &&
      debouncedFilters.endDate && {
        registrationPeriodMaxDate: debouncedFilters.endDate,
      }),
    includeInactive: debouncedFilters.includeInactive,
    page: currentPage,
    pageSize,
  });

  const expiringAssignmentsQuery = useQuery(
    expiringPlanAssignmentsQueryOptions({ days: EXPIRING_LOOKAHEAD_DAYS }),
  );
  const expiringSoonAssignments = useMemo(
    () =>
      (expiringAssignmentsQuery.data ??
        []) as StudentPlanAssignmentResponseDto[],
    [expiringAssignmentsQuery.data],
  );

  const expiringMap = useMemo(() => {
    const map = new Map<string, StudentPlanAssignmentResponseDto>();
    expiringSoonAssignments.forEach((assignment) => {
      if (assignment.studentId) {
        map.set(assignment.studentId, assignment);
      }
    });
    return map;
  }, [expiringSoonAssignments]);

  const students = useMemo(
    () => studentsData?.content ?? [],
    [studentsData?.content],
  );

  const studentIdsNeedingCurrentPlan = useMemo(
    () =>
      students
        .map((student) => student.id)
        .filter((id): id is string => Boolean(id && !expiringMap.has(id))),
    [students, expiringMap],
  );

  const currentPlanQueries = useQueries({
    queries: studentIdsNeedingCurrentPlan.map((studentId) => ({
      ...currentStudentPlanQueryOptions({ studentId }),
      staleTime: 30_000,
    })),
  });

  const currentPlanMap = useMemo(() => {
    const map = new Map<string, StudentPlanAssignmentResponseDto | null>();
    currentPlanQueries.forEach((query, index) => {
      const studentId = studentIdsNeedingCurrentPlan[index];
      if (studentId) {
        map.set(studentId, query.data ?? null);
      }
    });
    return map;
  }, [currentPlanQueries, studentIdsNeedingCurrentPlan]);

  const resolveAssignment = useCallback(
    (studentId: string) =>
      expiringMap.get(studentId) ?? currentPlanMap.get(studentId) ?? null,
    [expiringMap, currentPlanMap],
  );

  const totalPages = studentsData?.totalPages || 0;
  const totalElements = studentsData?.totalElements || 0;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const activeFilterCount = countActiveStudentFilters(watchedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(0);
  };

  const handleResetAllFilters = () => {
    setSearchTerm("");
    form.reset(DEFAULT_STUDENT_FILTERS);
    setCurrentPage(0);
  };

  const resultDescription =
    !isLoading && !error
      ? `Mostrando ${students.length} de ${totalElements} alunos${hasActiveFilters ? " (filtrados)" : ""}`
      : "Acompanhe todos os alunos cadastrados e seus planos em andamento.";

  const uniqueProfessions = useMemo(() => {
    if (!studentsData?.content) {
      return [] as string[];
    }

    const professionSet = new Set<string>();
    studentsData.content.forEach((student) => {
      if (student.profession) {
        professionSet.add(student.profession);
      }
    });

    return Array.from(professionSet);
  }, [studentsData?.content]);

  const handleCreateStudent = async (formData: StudentFormData) => {
    setIsCreating(true);

    try {
      const anamnesisFields: (keyof AnamnesisResponseDto)[] = [
        "medication",
        "isDoctorAwareOfPhysicalActivity",
        "favoritePhysicalActivity",
        "hasInsomnia",
        "dietOrientedBy",
        "cardiacProblems",
        "hasHypertension",
        "chronicDiseases",
        "difficultiesInPhysicalActivities",
        "medicalOrientationsToAvoidPhysicalActivity",
        "surgeriesInTheLast12Months",
        "respiratoryProblems",
        "jointMuscularBackPain",
        "spinalDiscProblems",
        "diabetes",
        "smokingDuration",
        "alteredCholesterol",
        "osteoporosisLocation",
      ];
      const hasAnamnesis = anamnesisFields.some((field: string) => {
        const value = (formData as unknown as Record<string, unknown>)[field];
        if (value === undefined || value === null) {
          return false;
        }
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return true;
      });

      const requestBody: StudentRequestDto = {
        email: formData.email ?? "",
        name: formData.name ?? "",
        surname: formData.surname ?? "",
        gender: resolveGender(formData.sex),
        birthDate: formData.birthDate ?? "",
        phone: formData.phone ?? undefined,
        profession: formData.profession ?? undefined,
        street: formData.street ?? undefined,
        number: formData.number ?? undefined,
        complement: formData.complement ?? undefined,
        neighborhood: formData.neighborhood ?? undefined,
        cep: formData.cep ?? undefined,
        emergencyContactName: formData.emergencyName ?? undefined,
        emergencyContactPhone: formData.emergencyPhone ?? undefined,
        emergencyContactRelationship:
          formData.emergencyRelationship ?? undefined,
        objectives: formData.objectives ?? undefined,
        observations: formData.impairmentObservations ?? undefined,
        anamnesis: hasAnamnesis
          ? {
              medication: formData.medication ?? undefined,
              isDoctorAwareOfPhysicalActivity:
                formData.isDoctorAwareOfPhysicalActivity ?? undefined,
              favoritePhysicalActivity:
                formData.favoritePhysicalActivity ?? undefined,
              hasInsomnia: normalizeHasInsomnia(formData.hasInsomnia),
              dietOrientedBy: formData.dietOrientedBy ?? undefined,
              cardiacProblems: formData.cardiacProblems ?? undefined,
              hasHypertension: formData.hasHypertension ?? undefined,
              chronicDiseases: formData.chronicDiseases ?? undefined,
              difficultiesInPhysicalActivities:
                formData.difficultiesInPhysicalActivities ?? undefined,
              medicalOrientationsToAvoidPhysicalActivity:
                formData.medicalOrientationsToAvoidPhysicalActivity ??
                undefined,
              surgeriesInTheLast12Months:
                formData.surgeriesInTheLast12Months ?? undefined,
              respiratoryProblems: formData.respiratoryProblems ?? undefined,
              jointMuscularBackPain:
                formData.jointMuscularBackPain ?? undefined,
              spinalDiscProblems: formData.spinalDiscProblems ?? undefined,
              diabetes: formData.diabetes ?? undefined,
              smokingDuration: formData.smokingDuration ?? undefined,
              alteredCholesterol: formData.alteredCholesterol ?? undefined,
              osteoporosisLocation: formData.osteoporosisLocation ?? undefined,
            }
          : undefined,
        physicalImpairments: formData.physicalImpairments
          ?.filter(
            (
              p,
            ): p is NonNullable<
              StudentFormData["physicalImpairments"]
            >[number] => {
              if (!p) {
                return false;
              }
              const hasContent =
                String(p.type ?? "").trim().length > 0 ||
                String(p.name ?? "").trim().length > 0 ||
                String(p.observations ?? "").trim().length > 0;
              const hasValidType = Boolean(normalizeImpairmentType(p.type));
              return hasContent && hasValidType;
            },
          )
          .map((p) => ({
            type: normalizeImpairmentType(p.type)!,
            name: p.name?.trim() ?? "",
            observations: p.observations?.trim() || undefined,
          })),
      };

      const created = await createStudent({ body: requestBody });

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
          toast({
            title: "Aluno criado, mas falha ao atribuir plano",
            variant: "destructive",
            duration: 4000,
          });
          // eslint-disable-next-line no-console
          console.error(assignError);
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
  };

  const handleCancelCreate = () => {
    setIsCreateOpen(false);
  };

  const handleDelete = async (id: string) => {
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
  };

  const handleRestore = async (id: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Alunos"
          description="Gerencie todos os alunos da academia"
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar novo aluno</DialogTitle>
              <DialogDescription>
                Preencha as informações do aluno e a ficha de anamnese
              </DialogDescription>
            </DialogHeader>

            <StudentForm
              onSubmit={handleCreateStudent}
              onCancel={handleCancelCreate}
              submitLabel="Cadastrar Aluno"
              isLoading={isCreating}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <FilterToolbar
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar alunos por nome, email, telefone ou profissão..."
        searchLabel="Buscar alunos"
        activeFilterCount={activeFilterCount}
        filterTitle="Filtros avançados"
        filterDescription="Refine sua busca por alunos"
        renderFilters={({ close }) => (
          <StudentFiltersContent
            filtersForm={form}
            professions={uniqueProfessions}
            onFiltersReset={() => setCurrentPage(0)}
            onClose={close}
          />
        )}
      />

      <Section
        title="Resultados"
        description={resultDescription}
        contentClassName="space-y-6"
      >
        {isLoading ? <StudentsLoadingList /> : null}

        {error ? (
          <StudentsErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {!isLoading && !error && students.length > 0 ? (
          <>
            <StudentsList
              students={students}
              resolveAssignment={resolveAssignment}
              onOpenDetails={(id) => router.push(`/students/${id}`)}
              onCreateEvaluation={(id) =>
                router.push(`/students/${id}/evaluation/new`)
              }
              onRestore={(id) => handleRestore(id)}
              onDelete={(id) => handleDelete(id)}
              isRestoring={isRestoring}
              isDeleting={isDeleting}
            />

            {totalPages > 1 ? (
              <PageSelector
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </>
        ) : null}

        {!isLoading && !error && students.length === 0 ? (
          <StudentsEmptyState
            hasSearchTerm={Boolean(searchTerm)}
            hasActiveFilters={hasActiveFilters}
            onCreate={() => setIsCreateOpen(true)}
            onClearSearch={searchTerm ? handleClearSearch : undefined}
            onClearFilters={
              hasActiveFilters ? handleResetAllFilters : undefined
            }
          />
        ) : null}
      </Section>
    </div>
  );
}
