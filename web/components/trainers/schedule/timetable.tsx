import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainerScheduleResponseDto } from "@/lib/api-client/types.gen";
import { WEEKDAY_NAMES } from "../../../lib/trainers/constants";
import {
  scheduleEndHHmm,
  scheduleEndMinutes,
  toHHmm,
  toMinutes,
} from "../../../lib/time-helpers";

const ROW_HEIGHT_PX = 56;

const ensureDayBuckets = (
  schedules: TrainerScheduleResponseDto[],
): Record<number, TrainerScheduleResponseDto[]> => {
  const buckets: Record<number, TrainerScheduleResponseDto[]> = {};

  for (const schedule of schedules) {
    const weekday = schedule.weekday ?? 0;
    const bucket = buckets[weekday] ?? [];
    bucket.push(schedule);
    buckets[weekday] = bucket;
  }

  return buckets;
};

const getHourRange = (schedules: TrainerScheduleResponseDto[]) => {
  if (!schedules.length) {
    return { startHour: 8, endHour: 18 };
  }

  const starts = schedules.map((schedule) => toMinutes(schedule.startTime));
  const ends = schedules.map((schedule) => scheduleEndMinutes(schedule));
  const minStart = Math.min(...starts);
  const maxEnd = Math.max(...ends);

  const startHour = Number.isFinite(minStart) ? Math.floor(minStart / 60) : 8;
  const endHour = Number.isFinite(maxEnd)
    ? Math.ceil(maxEnd / 60)
    : startHour + 1;

  return { startHour, endHour };
};

const HoursColumn = ({ hours }: { hours: number[] }) => (
  <div
    className="absolute top-0 left-0 w-20 bg-background/70 backdrop-blur"
    style={{ height: Math.max(1, hours.length - 1) * ROW_HEIGHT_PX }}
  >
    {hours.slice(0, -1).map((hour, index) => (
      <div
        key={hour}
        className="absolute w-full pr-1 text-[10px] text-muted-foreground flex items-start justify-end"
        style={{ top: index * ROW_HEIGHT_PX }}
      >
        {String(hour).padStart(2, "0")}:00
      </div>
    ))}
  </div>
);

const HourGridLines = ({ hours }: { hours: number[] }) => (
  <>
    {hours.map((_, index) => (
      <div
        key={index}
        className="absolute left-0 right-0 border-t border-border"
        style={{ top: index * ROW_HEIGHT_PX }}
      />
    ))}
  </>
);

export interface TrainerTimetableProps {
  schedules: TrainerScheduleResponseDto[];
}

export const TrainerWeekTimetable = ({ schedules }: TrainerTimetableProps) => {
  const buckets = ensureDayBuckets(schedules);
  const { startHour, endHour } = getHourRange(schedules);
  const hours = Array.from(
    { length: Math.max(endHour - startHour, 1) + 1 },
    (_, index) => startHour + index,
  );
  const totalHeight = Math.max(1, endHour - startHour) * ROW_HEIGHT_PX;

  return (
    <div className="relative mt-2 overflow-auto rounded-md border bg-background timetable-desktop">
      <div className="min-w-[720px] md:min-w-[880px] xl:min-w-[980px]">
        <div
          className="grid sticky top-0 z-30"
          style={{ gridTemplateColumns: "80px repeat(7,1fr)" }}
        >
          <div className="sticky left-0 z-40 flex h-10 items-center justify-center border-r bg-muted/60 text-xs font-medium backdrop-blur supports-[backdrop-filter]:bg-muted/50">
            Hora
          </div>
          {Array.from({ length: 7 }, (_, day) => (
            <div
              key={day}
              className="h-10 border-r bg-muted/60 text-xs font-semibold backdrop-blur supports-[backdrop-filter]:bg-muted/50 last:border-r-0 flex items-center justify-center"
            >
              {WEEKDAY_NAMES[day]}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: totalHeight }}>
          <HourGridLines hours={hours} />
          <HoursColumn hours={hours} />

          <div
            className="absolute top-0 left-20 right-0 grid h-full"
            style={{ gridTemplateColumns: "repeat(7,1fr)" }}
          >
            {Array.from({ length: 7 }, (_, day) => {
              const daySchedules = (buckets[day] ?? [])
                .slice()
                .sort(
                  (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
                );

              return (
                <div key={day} className="relative border-r last:border-r-0">
                  {daySchedules.map((schedule) => {
                    const startMinutes = toMinutes(schedule.startTime);
                    const endMinutes = scheduleEndMinutes(schedule);
                    const top = (startMinutes / 60 - startHour) * ROW_HEIGHT_PX;
                    const height = Math.max(
                      ((endMinutes - startMinutes) / 60) * ROW_HEIGHT_PX,
                      24,
                    );

                    return (
                      <div
                        key={schedule.id}
                        className="absolute left-[2px] right-[2px] mx-1 cursor-default overflow-hidden rounded-md border border-green-500 bg-green-500/15 shadow-sm hover:bg-green-500/25"
                        style={{ top, height }}
                      >
                        <div className="px-1 pt-0.5 text-[10px] font-semibold text-green-800 dark:text-green-200">
                          {schedule.seriesName}
                        </div>
                        <div className="px-1 pb-0.5 text-[10px] text-muted-foreground">
                          {toHHmm(schedule.startTime)} -{" "}
                          {schedule.startTime
                            ? scheduleEndHHmm(schedule)
                            : "--:--"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrainerMobileTimetable = ({
  schedules,
}: TrainerTimetableProps) => {
  const buckets = ensureDayBuckets(schedules);
  const orderedDays = Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b);

  if (!orderedDays.length) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Nenhum horário configurado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orderedDays.map((day) => (
        <Card key={day} className="border border-green-600/40">
          <CardHeader className="py-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" /> {WEEKDAY_NAMES[day]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {buckets[day].map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-md border border-green-500 bg-green-500/15 p-2 text-[11px] leading-tight"
              >
                <div className="mb-0.5 text-xs font-semibold text-green-700 dark:text-green-200">
                  {schedule.seriesName}
                </div>
                <div className="text-muted-foreground">
                  {schedule.startTime
                    ? `${toHHmm(schedule.startTime)} - ${scheduleEndHHmm(schedule)}`
                    : "--:--"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
