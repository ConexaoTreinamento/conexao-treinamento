import { useQuery, UseQueryOptions } from "@tanstack/react-query";

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
  
  return response.json();
};

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
  status: string;
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
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: { search?: string; includeInactive?: boolean }) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  lookups: () => [...eventKeys.all, 'lookups'] as const,
  students: () => [...eventKeys.lookups(), 'students'] as const,
  trainers: () => [...eventKeys.lookups(), 'trainers'] as const,
};

// Hooks
export const useEvents = (params: {
  search?: string;
  includeInactive?: boolean;
} = {}) => {
  const { search, includeInactive = false } = params;

  return useQuery({
    queryKey: eventKeys.list({ search, includeInactive }),
    queryFn: async (): Promise<EventData[]> => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.append('search', search);
      if (includeInactive) searchParams.append('includeInactive', 'true');
      
      return apiCall(`/events?${searchParams.toString()}`);
    },
    staleTime: 1, // 5 minutes
  });
};

export const useEvent = (
  id: string,
  queryOptions?: Omit<UseQueryOptions<EventData, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async (): Promise<EventData> => {
      return apiCall(`/events/${id}`);
    },
    staleTime: 1,
    ...queryOptions,
  });
};

export const useStudentLookup = () => {
  return useQuery({
    queryKey: eventKeys.students(),
    queryFn: async (): Promise<StudentLookup[]> => {
      return apiCall('/events/lookup/students');
    },
    staleTime: 1, // 10 minutes - lookup data doesn't change often
  });
};

export const useTrainerLookup = () => {
  return useQuery({
    queryKey: eventKeys.trainers(),
    queryFn: async (): Promise<TrainerLookup[]> => {
      return apiCall('/events/lookup/trainers');
    },
    staleTime: 1, // 10 minutes - lookup data doesn't change often
  });
};
