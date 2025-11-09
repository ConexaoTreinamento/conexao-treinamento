import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  getAllEvaluationsOptions,
  getAllEvaluationsQueryKey,
  getEvaluationOptions,
  getEvaluationQueryKey,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type {
  GetAllEvaluationsData,
  GetEvaluationData,
  PhysicalEvaluationResponseDto,
} from "@/lib/api-client";
import type { Options } from "@/lib/api-client/client/types";
import { apiClient } from "@/lib/client";

export type PhysicalEvaluationResponse = PhysicalEvaluationResponseDto;

type EvaluationDetailPath = GetEvaluationData["path"] & { studentId: string };
export type EvaluationDetailOptionsInput = Omit<Options<GetEvaluationData>, "path"> & {
  path: EvaluationDetailPath;
};

const evaluationDetailQueryOptions = (options: EvaluationDetailOptionsInput) =>
  getEvaluationOptions({
    ...options,
    path: options.path as GetEvaluationData["path"],
    client: apiClient,
  });

const evaluationsListQueryOptions = (options: Options<GetAllEvaluationsData>) =>
  getAllEvaluationsOptions({ ...options, client: apiClient });

const getEvaluationDefaultEnabled = (options: EvaluationDetailOptionsInput) => {
  const path = options.path as Record<string, string | undefined> | undefined;
  return Boolean(path?.studentId && path?.evaluationId);
};

const getEvaluationsDefaultEnabled = (
  options: Options<GetAllEvaluationsData>,
) => {
  const path = options.path as Record<string, string | undefined> | undefined;
  return Boolean(path?.studentId);
};

export const useEvaluation = (
  options: EvaluationDetailOptionsInput,
  queryOptions?: Omit<
    UseQueryOptions<
      PhysicalEvaluationResponse,
      Error,
      PhysicalEvaluationResponse,
      ReturnType<typeof getEvaluationQueryKey>
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    ...evaluationDetailQueryOptions(options),
    enabled: queryOptions?.enabled ?? getEvaluationDefaultEnabled(options),
    ...queryOptions,
  });

export const useEvaluations = (
  options: Options<GetAllEvaluationsData>,
  queryOptions?: Omit<
    UseQueryOptions<
      PhysicalEvaluationResponse[],
      Error,
      PhysicalEvaluationResponse[],
      ReturnType<typeof getAllEvaluationsQueryKey>
    >,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    ...evaluationsListQueryOptions(options),
    staleTime: queryOptions?.staleTime ?? 1000 * 60 * 5,
    enabled: queryOptions?.enabled ?? getEvaluationsDefaultEnabled(options),
    ...queryOptions,
  });

export const evaluationDetailQueryKey = (options: EvaluationDetailOptionsInput) =>
  evaluationDetailQueryOptions(options).queryKey;

export const evaluationsListQueryKey = (
  options: Options<GetAllEvaluationsData>,
) => evaluationsListQueryOptions(options).queryKey;

export type EvaluationDetailQueryOptions = ReturnType<typeof evaluationDetailQueryOptions>;
export type EvaluationsListQueryOptions = ReturnType<typeof evaluationsListQueryOptions>;
