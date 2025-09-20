import {useMutation, UseMutationOptions, useQueryClient} from "@tanstack/react-query";
import {
  createEventMutation,
  updateEventMutation,
  patchEventMutation,
  deleteEventMutation,
  restoreEventMutation,
  findEventByIdOptions
} from "@/lib/api-client/@tanstack/react-query.gen";
import {apiClient} from "@/lib/client";
import type {Options, EventResponseDto, CreateEventData, UpdateEventData, PatchEventData} from "@/lib/api-client";

/**
 * Hooks wrapping generated event mutations and handling cache invalidation
 */

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const base = createEventMutation();

  return useMutation({
    ...base,
    onSuccess: async (...args) => {
      if (base.onSuccess) {
        try { await (base.onSuccess)(...args); } catch (_) { /* ignore */ }
      }
      // Invalidate events list
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllEvents",
      });
    },
  });
};

export const useUpdateEvent = (options?: UseMutationOptions<EventResponseDto, Error, Options<UpdateEventData>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...updateEventMutation(),
    ...options,
    onSuccess: async (...args) => {
      if (options?.onSuccess) {
        try { await options.onSuccess(...args); } catch (_) { /* ignore */ }
      }
      // Invalidate events list and single event cache
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          // args[1] is the options passed to the mutation; path.id contains the event id
          queryKey: findEventByIdOptions({path: {id: args[1]?.path?.id ?? ""}, client: apiClient}).queryKey
        })
      ]);
    }
  });
};

export const usePatchEvent = (options?: UseMutationOptions<EventResponseDto, Error, Options<PatchEventData>>) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...patchEventMutation(),
    ...options,
    onSuccess: async (...args) => {
      if (options?.onSuccess) {
        try { await options.onSuccess(...args); } catch (_) { /* ignore */ }
      }
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          queryKey: findEventByIdOptions({path: {id: args[1]?.path?.id ?? ""}, client: apiClient}).queryKey
        })
      ]);
    }
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const base = deleteEventMutation();

  return useMutation({
    ...base,
    onSuccess: async (...args) => {
      if (base.onSuccess) {
        try { await (base.onSuccess)(...args); } catch (_) { /* ignore */ }
      }
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllEvents",
      });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();
  const base = restoreEventMutation();

  return useMutation({
    ...base,
    onSuccess: async (...args) => {
      if (base.onSuccess) {
        try { await (base.onSuccess)(...args); } catch (_) { /* ignore */ }
      }
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllEvents",
      });
    },
  });
};
