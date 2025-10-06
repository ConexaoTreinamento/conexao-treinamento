// DEPRECATED: This file previously contained custom React Query hooks for events.
// The project now uses generated hooks from the OpenAPI client located at
// `@/lib/api-client/@tanstack/react-query.gen`.
//
// We keep minimal type exports here temporarily to avoid breaking imports
// during the migration. Remove this file once all imports have been updated.
// If you still see usages of useEvents/useEvent/useStudentLookup/useTrainerLookup,
// refactor them to the generated counterparts (findAllEventsOptions, findEventByIdOptions, etc.).
//
// Any attempt to call the old hooks will throw to highlight lingering references.

// Event Types - based on our backend DTOs
export interface EventParticipant {
  id: string;
  name: string;
  avatar: string | null;
  enrolledAt: string;
  present: boolean;
}

export interface EventData {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  instructorId: string;
  instructor: string;
  participants: EventParticipant[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StudentLookup {
  id: string;
  name: string;
}

export interface TrainerLookup {
  id: string;
  name: string;
}

// Query Keys
export const eventKeys: Readonly<Record<string, never>> = Object.freeze({})

// Hooks
export function useEvents() { throw new Error('useEvents deprecated - use generated findAllEventsOptions with useQuery') }
export function useEvent() { throw new Error('useEvent deprecated - use generated findEventByIdOptions with useQuery') }
export function useStudentLookup() { throw new Error('useStudentLookup deprecated - replace with generated lookup query (not yet migrated)') }
export function useTrainerLookup() { throw new Error('useTrainerLookup deprecated - replace with generated lookup query (not yet migrated)') }
