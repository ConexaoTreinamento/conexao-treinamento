import {useQuery, keepPreviousData, UseQueryOptions} from "@tanstack/react-query";
import {findAllOptions, findByIdOptions, findByIdQueryKey} from "@/lib/api-client/@tanstack/react-query.gen";
import type { Options } from "@/lib/api-client/client/types";
import {apiClient} from "@/lib/client";
import {FindAllData, FindByIdData, StudentResponseDto} from "@/lib/api-client";

export const useStudent = (options: Options<FindByIdData>, queryOptions?: Omit<UseQueryOptions<StudentResponseDto, Error, StudentResponseDto, ReturnType<typeof findByIdQueryKey>>, 'queryKey' | 'queryFn'>) => useQuery({
  ...findByIdOptions({...options, client: apiClient}),
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

  const options: Options<FindAllData> = {
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
    ...findAllOptions({...options, client: apiClient}),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};
