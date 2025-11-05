import type {
  AddRegisteredParticipantExerciseData,
  AddRegisteredParticipantExerciseResponse,
  AddSessionParticipantData,
  AddSessionParticipantResponse,
  CancelOrRestoreSessionData,
  CancelOrRestoreSessionResponse,
  CreateExerciseData,
  CreateOneOffSessionData,
  CreateOneOffSessionResponse,
  ExerciseResponseDto,
  Options,
  RemoveRegisteredParticipantExerciseData,
  RemoveSessionParticipantData,
  UpdatePresenceData,
  UpdatePresenceResponse,
  UpdateRegisteredParticipantExerciseData,
  UpdateRegisteredParticipantExerciseResponse,
  UpdateSessionTrainerData,
  UpdateSessionTrainerResponse,
} from "@/lib/api-client"
import {
  addRegisteredParticipantExerciseMutation,
  addSessionParticipantMutation,
  cancelOrRestoreSessionMutation,
  createOneOffSessionMutation,
  createExerciseMutation,
  removeRegisteredParticipantExerciseMutation,
  removeSessionParticipantMutation,
  updatePresenceMutation,
  updateRegisteredParticipantExerciseMutation,
  updateSessionTrainerMutation,
} from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export const updateSessionTrainerMutationOptions = () =>
  updateSessionTrainerMutation({ client: apiClient })

export const updatePresenceMutationOptions = () =>
  updatePresenceMutation({ client: apiClient })

export const removeSessionParticipantMutationOptions = () =>
  removeSessionParticipantMutation({ client: apiClient })

export const addSessionParticipantMutationOptions = () =>
  addSessionParticipantMutation({ client: apiClient })

export const addRegisteredParticipantExerciseMutationOptions = () =>
  addRegisteredParticipantExerciseMutation({ client: apiClient })

export const updateRegisteredParticipantExerciseMutationOptions = () =>
  updateRegisteredParticipantExerciseMutation({ client: apiClient })

export const removeRegisteredParticipantExerciseMutationOptions = () =>
  removeRegisteredParticipantExerciseMutation({ client: apiClient })

export const cancelOrRestoreSessionMutationOptions = () =>
  cancelOrRestoreSessionMutation({ client: apiClient })

export const createExerciseMutationOptions = () =>
  createExerciseMutation({ client: apiClient })

export const createOneOffSessionMutationOptions = () =>
  createOneOffSessionMutation({ client: apiClient })

export type UpdateSessionTrainerMutationOptions = ReturnType<typeof updateSessionTrainerMutationOptions>
export type UpdatePresenceMutationOptions = ReturnType<typeof updatePresenceMutationOptions>
export type RemoveSessionParticipantMutationOptions = ReturnType<typeof removeSessionParticipantMutationOptions>
export type AddSessionParticipantMutationOptions = ReturnType<typeof addSessionParticipantMutationOptions>
export type AddRegisteredParticipantExerciseMutationOptions = ReturnType<typeof addRegisteredParticipantExerciseMutationOptions>
export type UpdateRegisteredParticipantExerciseMutationOptions = ReturnType<
  typeof updateRegisteredParticipantExerciseMutationOptions
>
export type RemoveRegisteredParticipantExerciseMutationOptions = ReturnType<
  typeof removeRegisteredParticipantExerciseMutationOptions
>
export type CancelOrRestoreSessionMutationOptions = ReturnType<typeof cancelOrRestoreSessionMutationOptions>
export type CreateExerciseMutationOptions = ReturnType<typeof createExerciseMutationOptions>
export type CreateOneOffSessionMutationOptions = ReturnType<typeof createOneOffSessionMutationOptions>

export type {
  AddRegisteredParticipantExerciseData,
  AddRegisteredParticipantExerciseResponse,
  AddSessionParticipantData,
  AddSessionParticipantResponse,
  CancelOrRestoreSessionData,
  CancelOrRestoreSessionResponse,
  CreateOneOffSessionData,
  CreateOneOffSessionResponse,
  CreateExerciseData,
  ExerciseResponseDto,
  Options,
  RemoveRegisteredParticipantExerciseData,
  RemoveSessionParticipantData,
  UpdatePresenceData,
  UpdatePresenceResponse,
  UpdateRegisteredParticipantExerciseData,
  UpdateRegisteredParticipantExerciseResponse,
  UpdateSessionTrainerData,
  UpdateSessionTrainerResponse,
}

