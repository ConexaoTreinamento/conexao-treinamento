"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DEFAULT_STUDENT_FILTERS,
  StudentFilters,
  countActiveStudentFilters,
} from "@/lib/students/types";
import {
  currentStudentPlanQueryOptions,
  expiringPlanAssignmentsQueryOptions,
  useStudents,
} from "@/lib/students/hooks/student-queries";
import {
  assignPlanToStudentMutationOptions,
  useCreateStudent,
  useDeleteStudent,
  useRestoreStudent,
} from "@/lib/students/hooks/student-mutations";
import type {
  AssignPlanToStudentMutationResponse,
  AssignPlanToStudentMutationVariables,
} from "@/lib/students/hooks/student-mutations";
import type {
  StudentPlanAssignmentResponseDto,
  StudentResponseDto,
} from "@/lib/api-client/types.gen";
import type { UseFormReturn } from "react-hook-form";

type StudentsQueryResult = ReturnType<typeof useStudents>;
type StudentsList = StudentResponseDto[];
type StudentsRefetch = StudentsQueryResult["refetch"];

const EXPIRING_LOOKAHEAD_DAYS = 7;
const PAGE_SIZE = 20;

interface StudentsPageState {
  form: UseFormReturn<StudentFilters>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  students: StudentsList;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  error: unknown;
  refetch: StudentsRefetch;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  uniqueProfessions: string[];
  resultDescription: string;
  resolveAssignment: (
    studentId: string,
  ) => StudentPlanAssignmentResponseDto | null;
  deleteStudent: ReturnType<typeof useDeleteStudent>["mutateAsync"];
  restoreStudent: ReturnType<typeof useRestoreStudent>["mutateAsync"];
  createStudent: ReturnType<typeof useCreateStudent>;
  assignPlan: UseMutationResult<
    AssignPlanToStudentMutationResponse,
    Error,
    AssignPlanToStudentMutationVariables
  >;
  isDeleting: boolean;
  isRestoring: boolean;
  resetFilters: () => void;
}

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
    default:
      return undefined;
  }
};

export function useStudentsPageState(): StudentsPageState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<StudentFilters>({
    defaultValues: DEFAULT_STUDENT_FILTERS,
    mode: "onChange",
  });
  const watchedFilters = form.watch();

  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const debouncedFilters = useDebounce(watchedFilters, 400);

  const debouncedInvalidDateRange = Boolean(
    debouncedFilters.startDate &&
      debouncedFilters.endDate &&
      debouncedFilters.startDate > debouncedFilters.endDate,
  );

  const currentPage = useMemo(() => {
    const raw = searchParams.get("page");
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [searchParams]);

  const updatePageInURL = useCallback(
    (newPage: number) => {
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
    },
    [router, searchParams],
  );

  const setCurrentPage = useCallback(
    (newPage: number) => {
      updatePageInURL(newPage);
    },
    [updatePageInURL],
  );

  const studentsQuery = useStudents({
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
    pageSize: PAGE_SIZE,
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

  const students = useMemo<StudentResponseDto[]>(
    () => studentsQuery.data?.content ?? [],
    [studentsQuery.data?.content],
  );

  const studentIdsNeedingCurrentPlan = useMemo(
    () =>
      students
        .map((student) => student.id)
        .filter((id): id is string => Boolean(id && !expiringMap.has(id))),
    [expiringMap, students],
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
    [currentPlanMap, expiringMap],
  );

  const { mutateAsync: deleteStudent, isPending: isDeleting } =
    useDeleteStudent();
  const { mutateAsync: restoreStudent, isPending: isRestoring } =
    useRestoreStudent();
  const createStudent = useCreateStudent();

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

  const totalPages = studentsQuery.data?.totalPages ?? 0;
  const totalElements = studentsQuery.data?.totalElements ?? 0;

  const activeFilterCount = countActiveStudentFilters(watchedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  const uniqueProfessions = useMemo(() => {
    const professionSet = new Set<string>();
    studentsQuery.data?.content?.forEach((student) => {
      if (student.profession) {
        professionSet.add(student.profession);
      }
    });
    return Array.from(professionSet);
  }, [studentsQuery.data?.content]);

  const resultDescription = useMemo(() => {
    if (studentsQuery.isLoading) {
      return "Carregando alunos...";
    }

    if (studentsQuery.error) {
      return "Não foi possível carregar os alunos.";
    }

    if (students.length === 0) {
      return hasActiveFilters
        ? "Nenhum aluno encontrado para os filtros selecionados."
        : "Acompanhe todos os alunos cadastrados e seus planos em andamento.";
    }

    return `Mostrando ${students.length} de ${totalElements} alunos${hasActiveFilters ? " (filtrados)" : ""}`;
  }, [
    hasActiveFilters,
    students.length,
    studentsQuery.error,
    studentsQuery.isLoading,
    totalElements,
  ]);

  const resetFilters = () => {
    form.reset(DEFAULT_STUDENT_FILTERS);
  };

  return {
    form,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    students,
    totalPages,
    totalElements,
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    refetch: studentsQuery.refetch,
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
  };
}
