import { apiClient } from "@/lib/client";
import { jsonBodySerializer } from "@/lib/api-client/core/bodySerializer";

export type WeekSplitRequest = {
  trainerId: string;
  seriesName?: string;
  intervalDuration?: number;
  newEffectiveFrom: string; // ISO string
  days: Array<{ weekday: number; active: boolean; startTime?: string; endTime?: string }>;
};

export async function splitWeek(req: WeekSplitRequest) {
  return apiClient.post({
    url: "/api/schedule/series/split-week",
    body: req,
    ...jsonBodySerializer,
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}
