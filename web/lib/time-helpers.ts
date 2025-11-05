import { formatTimeHM } from "@/lib/formatters/time";
import type { TrainerScheduleResponseDto } from "@/lib/api-client/types.gen";

const MINUTES_PER_DAY = 24 * 60;

export const toHHmm = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const formatted = formatTimeHM(value);
  return formatted === "--:--" ? "" : formatted;
};

export const addMinutesHHmm = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) {
    return "00:00";
  }

  const base = hours * 60 + mins;
  const total = base + minutes;

  if (!Number.isFinite(total)) {
    return "00:00";
  }

  if (total >= MINUTES_PER_DAY) {
    return "23:59";
  }

  if (total < 0) {
    return "00:00";
  }

  const normalizedHours = Math.floor(total / 60);
  const normalizedMinutes = total % 60;
  return `${String(normalizedHours).padStart(2, "0")}:${String(normalizedMinutes).padStart(2, "0")}`;
};

export const compareHHmm = (a: string, b: string): number => a.localeCompare(b);

export const toMinutesFromHHmm = (value?: string | null): number => {
  if (!value) {
    return Number.NaN;
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
};

export const toMinutes = (value?: string | null): number => {
  if (!value) {
    return 0;
  }

  const parts = formatTimeHM(value);
  if (parts === "--:--") {
    return 0;
  }

  const [hours, minutes] = parts.split(":").map(Number);
  return (
    (Number.isFinite(hours) ? hours : 0) * 60 +
    (Number.isFinite(minutes) ? minutes : 0)
  );
};

export const scheduleEndHHmm = (
  schedule: TrainerScheduleResponseDto,
  fallbackDurationMinutes = 60,
): string => {
  const start = toHHmm(schedule.startTime) || "00:00";
  const duration = schedule.intervalDuration ?? fallbackDurationMinutes;
  return addMinutesHHmm(start, duration);
};

export const scheduleEndMinutes = (
  schedule: TrainerScheduleResponseDto,
  fallbackDurationMinutes = 60,
): number => toMinutes(scheduleEndHHmm(schedule, fallbackDurationMinutes));

export const displayTimeRange = (
  schedule: TrainerScheduleResponseDto,
  fallbackDurationMinutes = 60,
): string => {
  const start = toHHmm(schedule.startTime);
  if (!start) {
    return "--:--";
  }

  const end = scheduleEndHHmm(schedule, fallbackDurationMinutes);
  return `${start} - ${end}`;
};
