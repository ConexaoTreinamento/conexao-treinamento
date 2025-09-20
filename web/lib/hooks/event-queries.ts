import {useQuery, keepPreviousData, UseQueryOptions} from "@tanstack/react-query";
import {findAllEventsOptions, findEventByIdOptions, findEventByIdQueryKey} from "@/lib/api-client/@tanstack/react-query.gen";
import type { Options } from "@/lib/api-client/client/types";
import {apiClient} from "@/lib/client";
import type {FindAllEventsData, FindEventByIdData, EventResponseDto} from "@/lib/api-client";

/**
 * useEvent - fetch single event by id
 */
export const useEvent = (options: Options<FindEventByIdData>, queryOptions?: Omit<UseQueryOptions<EventResponseDto, Error, EventResponseDto, ReturnType<typeof findEventByIdQueryKey>>, 'queryKey' | 'queryFn'>) => useQuery({
  ...findEventByIdOptions({...options, client: apiClient}),
  ...queryOptions,
});

/**
 * useEvents - encapsulates the events list query
 * Accepts search and pagination params and returns the react-query result.
 */
export const useEvents = (params: {
  search?: string;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const {
    search,
    includeInactive,
    page = 0,
    pageSize = 20,
  } = params;

  const options: Options<FindAllEventsData> = {
    query: {
      ...(search && { search }),
      includeInactive: Boolean(includeInactive),
      pageable: {
        page,
        size: pageSize,
        sort: ["createdAt,DESC"],
      },
    },
  };

  return useQuery({
    ...findAllEventsOptions({...options, client: apiClient}),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};
