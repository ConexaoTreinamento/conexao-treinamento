import { describe, it, expect, vi, beforeEach } from 'vitest'

import { apiClient } from '@/lib/client'
import {
  addRegisteredParticipantExerciseMutationOptions,
  addSessionParticipantMutationOptions,
  cancelOrRestoreSessionMutationOptions,
  createExerciseMutationOptions,
  createOneOffSessionMutationOptions,
  removeRegisteredParticipantExerciseMutationOptions,
  removeSessionParticipantMutationOptions,
  updatePresenceMutationOptions,
  updateRegisteredParticipantExerciseMutationOptions,
  updateSessionTrainerMutationOptions,
} from './session-mutations'

const mockReturnValue = (name: string) => ({ name })

vi.mock('@/lib/api-client/@tanstack/react-query.gen', () => ({
  updateSessionTrainerMutation: vi.fn(() => mockReturnValue('updateSessionTrainer')),
  updatePresenceMutation: vi.fn(() => mockReturnValue('updatePresence')),
  removeSessionParticipantMutation: vi.fn(() => mockReturnValue('removeSessionParticipant')),
  addSessionParticipantMutation: vi.fn(() => mockReturnValue('addSessionParticipant')),
  addRegisteredParticipantExerciseMutation: vi.fn(() => mockReturnValue('addRegisteredExercise')),
  updateRegisteredParticipantExerciseMutation: vi.fn(() => mockReturnValue('updateRegisteredExercise')),
  removeRegisteredParticipantExerciseMutation: vi.fn(() => mockReturnValue('removeRegisteredExercise')),
  cancelOrRestoreSessionMutation: vi.fn(() => mockReturnValue('cancelOrRestore')),
  createExerciseMutation: vi.fn(() => mockReturnValue('createExercise')),
  createOneOffSessionMutation: vi.fn(() => mockReturnValue('createOneOffSession')),
}))

import {
  updateSessionTrainerMutation,
  updatePresenceMutation,
  removeSessionParticipantMutation,
  addSessionParticipantMutation,
  addRegisteredParticipantExerciseMutation,
  updateRegisteredParticipantExerciseMutation,
  removeRegisteredParticipantExerciseMutation,
  cancelOrRestoreSessionMutation,
  createExerciseMutation,
  createOneOffSessionMutation,
} from '@/lib/api-client/@tanstack/react-query.gen'

describe('session mutations helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('wraps update session trainer mutation with apiClient', () => {
    const result = updateSessionTrainerMutationOptions()
    expect(updateSessionTrainerMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(result).toEqual(mockReturnValue('updateSessionTrainer'))
  })

  it('wraps presence mutation', () => {
    const result = updatePresenceMutationOptions()
    expect(updatePresenceMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(result).toEqual(mockReturnValue('updatePresence'))
  })

  it('wraps participant mutations', () => {
    expect(removeSessionParticipantMutationOptions()).toEqual(mockReturnValue('removeSessionParticipant'))
    expect(addSessionParticipantMutationOptions()).toEqual(mockReturnValue('addSessionParticipant'))
    expect(removeSessionParticipantMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(addSessionParticipantMutation).toHaveBeenCalledWith({ client: apiClient })
  })

  it('wraps registered exercise mutations', () => {
    expect(addRegisteredParticipantExerciseMutationOptions()).toEqual(mockReturnValue('addRegisteredExercise'))
    expect(updateRegisteredParticipantExerciseMutationOptions()).toEqual(mockReturnValue('updateRegisteredExercise'))
    expect(removeRegisteredParticipantExerciseMutationOptions()).toEqual(mockReturnValue('removeRegisteredExercise'))

    expect(addRegisteredParticipantExerciseMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(updateRegisteredParticipantExerciseMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(removeRegisteredParticipantExerciseMutation).toHaveBeenCalledWith({ client: apiClient })
  })

  it('wraps cancel and creation mutations', () => {
    expect(cancelOrRestoreSessionMutationOptions()).toEqual(mockReturnValue('cancelOrRestore'))
    expect(createExerciseMutationOptions()).toEqual(mockReturnValue('createExercise'))
    expect(createOneOffSessionMutationOptions()).toEqual(mockReturnValue('createOneOffSession'))

    expect(cancelOrRestoreSessionMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(createExerciseMutation).toHaveBeenCalledWith({ client: apiClient })
    expect(createOneOffSessionMutation).toHaveBeenCalledWith({ client: apiClient })
  })
})

