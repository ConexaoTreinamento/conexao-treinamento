import { apiClient } from "@/lib/client";
import { jsonBodySerializer } from "@/lib/api-client/core/bodySerializer";

export type DeactivateWeekdaysRequest = {
  trainerId: string;
  weekdays: number[];
};

export async function deactivateWeekdays(req: DeactivateWeekdaysRequest) {
  return apiClient.post({
    url: "/api/schedule/series/deactivate-weekdays",
    body: req,
  ...jsonBodySerializer,
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}
