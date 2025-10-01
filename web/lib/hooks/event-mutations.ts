import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys, EventData } from "./event-queries";

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  // Only parse JSON if there's content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

// Request Types
export interface CreateEventRequest {
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  trainerId: string;
  participantIds?: string[];
}

export interface UpdateEventRequest extends CreateEventRequest {}

export interface PatchEventRequest {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  trainerId?: string;
  participantIds?: string[];
}

// Mutations
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventRequest): Promise<EventData> => {
      return apiCall('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventRequest }): Promise<EventData> => {
      return apiCall(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, { id }) => {
      // Invalidate events list and specific event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
};

export const usePatchEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatchEventRequest }): Promise<EventData> => {
      return apiCall(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, { id }) => {
      // Invalidate events list and specific event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return apiCall(`/events/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

export const useRestoreEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<EventData> => {
      return apiCall(`/events/${id}/restore`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

// Participant Management Mutations
export const useAddParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, studentId }: { eventId: string; studentId: string }): Promise<EventData> => {
      return apiCall(`/events/${eventId}/participants/${studentId}`, {
        method: 'POST',
      });
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate events list and specific event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, studentId }: { eventId: string; studentId: string }): Promise<void> => {
      return apiCall(`/events/${eventId}/participants/${studentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate events list and specific event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
};

export const useToggleAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, studentId }: { eventId: string; studentId: string }): Promise<EventData> => {
      return apiCall(`/events/${eventId}/participants/${studentId}/attendance`, {
        method: 'PATCH',
      });
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate events list and specific event
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
};