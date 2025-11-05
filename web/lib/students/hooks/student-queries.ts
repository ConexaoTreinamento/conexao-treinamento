import {useQuery, keepPreviousData, UseQueryOptions} from "@tanstack/react-query";
import {
  findAllStudentsOptions,
  findStudentByIdOptions,
  findStudentByIdQueryKey,
  getAllPlansOptions,
  getAllSchedulesOptions,
  getAvailableSessionSeriesOptions,
  getCommitmentHistoryOptions,
  getCurrentActiveCommitmentsOptions,
  getCurrentStudentPlanOptions,
  getExpiringSoonAssignmentsOptions,
  getSessionSeriesCommitmentsOptions,
  getStudentCommitmentsOptions,
  getStudentPlanHistoryOptions,
  getTrainersForLookupOptions,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type { Options } from "@/lib/api-client/client/types";
import {apiClient} from "@/lib/client";
import type {FindAllStudentsData, FindStudentByIdData, StudentResponseDto} from "@/lib/api-client";

export const useStudent = (options: Options<FindStudentByIdData>, queryOptions?: Omit<UseQueryOptions<StudentResponseDto, Error, StudentResponseDto, ReturnType<typeof findStudentByIdQueryKey>>, 'queryKey' | 'queryFn'>) => useQuery({
  ...findStudentByIdOptions({...options, client: apiClient}),
  ...queryOptions,
});

/**
 * useStudents - encapsulates the students list query
 * Accepts debounced search/filters and pagination and returns the react-query result.
 */
export const useStudents = (params: {
  search?: string;
  gender?: string;
  profession?: string;
  minAge?: number | null;
  maxAge?: number | null;
  registrationPeriodMinDate?: string;
  registrationPeriodMaxDate?: string;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const {
    search,
    gender,
    profession,
    minAge,
    maxAge,
    registrationPeriodMinDate,
    registrationPeriodMaxDate,
    includeInactive,
    page = 0,
    pageSize = 20,
  } = params;

  const options: Options<FindAllStudentsData> = {
    query: {
      ...(search && { search }),
      ...(gender && { gender }),
      ...(profession && { profession }),
      ...(minAge != null && { minAge }),
      ...(maxAge != null && { maxAge }),
      ...(registrationPeriodMinDate && { registrationPeriodMinDate }),
      ...(registrationPeriodMaxDate && { registrationPeriodMaxDate }),
      includeInactive: Boolean(includeInactive),
      pageable: {
        page,
        size: pageSize,
        sort: ["name,ASC"],
      },
    },
  };

  return useQuery({
    ...findAllStudentsOptions({...options, client: apiClient}),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const currentStudentPlanQueryOptions = ({ studentId }: { studentId: string }) =>
  getCurrentStudentPlanOptions({ client: apiClient, path: { studentId } });

export const studentPlanHistoryQueryOptions = ({ studentId }: { studentId: string }) =>
  getStudentPlanHistoryOptions({ client: apiClient, path: { studentId } });

export const studentCommitmentsQueryOptions = ({ studentId }: { studentId: string }) =>
  getStudentCommitmentsOptions({ client: apiClient, path: { studentId } });

export const allPlansQueryOptions = () => getAllPlansOptions({ client: apiClient });

export const allSchedulesQueryOptions = () => getAllSchedulesOptions({ client: apiClient });

export const expiringPlanAssignmentsQueryOptions = ({ days }: { days: number }) => ({
  ...getExpiringSoonAssignmentsOptions({ client: apiClient, query: { days } }),
  staleTime: 30_000,
  refetchInterval: 60_000,
});

export const availableSessionSeriesQueryOptions = () =>
  getAvailableSessionSeriesOptions({ client: apiClient });

export const currentActiveCommitmentsQueryOptions = ({ studentId }: { studentId: string }) =>
  getCurrentActiveCommitmentsOptions({ client: apiClient, path: { studentId } });

export const trainersForLookupQueryOptions = () =>
  getTrainersForLookupOptions({ client: apiClient });

export const sessionSeriesCommitmentsQueryOptions = ({ sessionSeriesId }: { sessionSeriesId: string }) =>
  getSessionSeriesCommitmentsOptions({ client: apiClient, path: { sessionSeriesId } });

export const commitmentHistoryQueryOptions = (
  { studentId, sessionSeriesId }: { studentId: string; sessionSeriesId: string },
) =>
  getCommitmentHistoryOptions({ client: apiClient, path: { studentId, sessionSeriesId } });

export type CurrentStudentPlanQueryOptions = ReturnType<typeof currentStudentPlanQueryOptions>;
export type StudentPlanHistoryQueryOptions = ReturnType<typeof studentPlanHistoryQueryOptions>;
export type StudentCommitmentsQueryOptions = ReturnType<typeof studentCommitmentsQueryOptions>;
export type AllPlansQueryOptions = ReturnType<typeof allPlansQueryOptions>;
export type AllSchedulesQueryOptions = ReturnType<typeof allSchedulesQueryOptions>;
export type ExpiringPlanAssignmentsQueryOptions = ReturnType<typeof expiringPlanAssignmentsQueryOptions>;
export type AvailableSessionSeriesQueryOptions = ReturnType<typeof availableSessionSeriesQueryOptions>;
export type CurrentActiveCommitmentsQueryOptions = ReturnType<typeof currentActiveCommitmentsQueryOptions>;
export type TrainersForLookupQueryOptions = ReturnType<typeof trainersForLookupQueryOptions>;
export type SessionSeriesCommitmentsQueryOptions = ReturnType<typeof sessionSeriesCommitmentsQueryOptions>;
export type CommitmentHistoryQueryOptions = ReturnType<typeof commitmentHistoryQueryOptions>;
