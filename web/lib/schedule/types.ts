export interface ScheduleStudent {
  id: string;
  name: string;
  present: boolean;
}

export interface ScheduleClassItem {
  id?: string;
  real: boolean;
  name: string;
  instructor: string;
  trainerId?: string;
  time?: string;
  endTime?: string;
  canceled: boolean;
  overridden: boolean;
  students: ScheduleStudent[];
  dateIso: string;
}

export interface ScheduleDayStats {
  total: number;
  present: number;
}

export interface ScheduleDayItem {
  date: Date;
  iso: string;
  stats?: ScheduleDayStats;
  isToday: boolean;
  isSelected: boolean;
}
