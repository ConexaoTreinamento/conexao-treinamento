import type { QueryClient, QueryFilters } from "@tanstack/react-query";

const EXERCISES_QUERY_ID = "findAllExercises" as const;

type QueryKeyWithId = { _id?: string };

const matchesExercisesQuery = (filters: QueryFilters): QueryFilters => ({
  ...filters,
  predicate: (query) => {
    if (!Array.isArray(query.queryKey) || query.queryKey.length === 0) {
      return false;
    }

    const firstKey = query.queryKey[0] as QueryKeyWithId | undefined;
    const matchesId = firstKey?._id === EXERCISES_QUERY_ID;

    if (!matchesId) {
      return false;
    }

    return filters.predicate ? filters.predicate(query) : true;
  },
});

export const invalidateExercisesQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries(matchesExercisesQuery({}));

export const refetchExercisesQueries = (queryClient: QueryClient) =>
  queryClient.refetchQueries(matchesExercisesQuery({}));
