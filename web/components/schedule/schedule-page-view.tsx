"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ClassModal from "@/components/schedule/class-modal";
import { PageHeader } from "@/components/base/page-header";
import { Section } from "@/components/base/section";
import { EmptyState } from "@/components/base/empty-state";
import { Button } from "@/components/ui/button";
import {
  scheduleByDateQueryOptions,
  trainersLookupQueryOptions,
} from "@/lib/schedule/hooks/session-queries";
import { createOneOffSessionMutationOptions } from "@/lib/schedule/hooks/session-mutations";
import { ScheduleToolbar } from "@/components/schedule/schedule-toolbar";
import { ScheduleMonthNavigation } from "@/components/schedule/schedule-month-navigation";
import { ScheduleDayPicker } from "@/components/schedule/schedule-day-picker";
import { ScheduleClassCard } from "@/components/schedule/schedule-class-card";
import { ScheduleClassSkeletonList } from "@/components/schedule/schedule-class-skeleton";
import type {
  ScheduleClassItem,
  ScheduleDayItem,
  ScheduleStudent,
} from "@/components/schedule/types";

interface OneOffClassData {
  name: string;
  trainerId: string;
  trainerName?: string;
  startTime: string;
  endTime: string;
}

export function SchedulePageView() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const dayParam = searchParams.get("day");
  const currentMonth = useMemo(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  }, [monthParam]);
  const selectedDate = useMemo(() => {
    if (dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam)) {
      const [y, m, d] = dayParam.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  }, [dayParam, monthParam]);
  const [userRole, setUserRole] = useState<string>("");
  const [isNewClassOpen, setIsNewClassOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<
    Partial<OneOffClassData>
  >({
    name: "",
    trainerId: "",
    startTime: "",
    endTime: "",
  });
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor";
    setUserRole(role);
  }, []);

  const invalidateReportsQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key.length === 0) {
          return false;
        }
        const root = key[0];
        return (
          typeof root === "object" &&
          root !== null &&
          (root as { _id?: string })._id === "getReports"
        );
      },
    });
  }, [queryClient]);

  const setUrlParams = useCallback(
    (monthDate: Date, dayDate: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      const monthIndex = String(monthDate.getMonth() + 1).padStart(2, "0");
      const monthStr = `${monthDate.getFullYear()}-${monthIndex}`;
      const dayStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(
        dayDate.getDate(),
      ).padStart(2, "0")}`;
      params.set("month", monthStr);
      params.set("day", dayStr);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedIso = useMemo(
    () => formatLocalDate(selectedDate),
    [selectedDate],
  );
  const monthStart = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth],
  );
  const monthEnd = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth],
  );
  const monthStartIso = useMemo(
    () => formatLocalDate(monthStart),
    [monthStart],
  );
  const monthEndIso = useMemo(() => formatLocalDate(monthEnd), [monthEnd]);

  const monthScheduleOptions = useMemo(
    () =>
      scheduleByDateQueryOptions({
        startDate: monthStartIso,
        endDate: monthEndIso,
      }),
    [monthEndIso, monthStartIso],
  );
  const scheduleQuery = useQuery({
    ...monthScheduleOptions,
    refetchInterval: 60_000,
  });
  const apiSessions = useMemo(
    () => scheduleQuery.data?.sessions ?? [],
    [scheduleQuery.data?.sessions],
  );
  const backendClasses = useMemo<ScheduleClassItem[]>(
    () =>
      apiSessions.map((session) => {
        const students: ScheduleStudent[] = (session.students ?? []).map(
          (student) => ({
            id: student.studentId || "",
            name: student.studentName || "Aluno",
            present:
              student.present ?? student.commitmentStatus === "ATTENDING",
          }),
        );

        const dateIso = session.startTime?.slice(0, 10) || selectedIso;
        const sessionId =
          session.sessionId && session.sessionId.length > 0
            ? session.sessionId
            : undefined;

        return {
          id: sessionId,
          real: Boolean(sessionId),
          name: session.seriesName || "Aula",
          instructor: session.trainerName || "—",
          trainerId: session.trainerId,
          time: session.startTime?.slice(11, 16) || "",
          endTime: session.endTime?.slice(11, 16) || "",
          canceled: Boolean(session.canceled),
          overridden: Boolean(session.instanceOverride),
          students,
          dateIso,
        };
      }),
    [apiSessions, selectedIso],
  );

  const classesForSelectedDate = useMemo(
    () =>
      backendClasses
        .filter((classItem) => classItem.dateIso === selectedIso)
        .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [backendClasses, selectedIso],
  );

  const trainersQuery = useQuery(trainersLookupQueryOptions());
  const trainersById = useMemo(() => {
    const map: Record<string, string> = {};
    const list = Array.isArray(trainersQuery.data) ? trainersQuery.data : [];
    for (const trainer of list) {
      if (trainer && trainer.id && trainer.name) {
        map[trainer.id] = trainer.name;
      }
    }
    return map;
  }, [trainersQuery.data]);

  const createOneOffSession = useMutation(createOneOffSessionMutationOptions());

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    for (
      let date = new Date(monthStart);
      date <= monthEnd;
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    ) {
      days.push(date);
    }
    return days;
  }, [monthEnd, monthStart]);

  const daySessionCounts = useMemo(() => {
    const map: Record<string, { total: number; present: number }> = {};
    backendClasses.forEach((classItem) => {
      const key = classItem.dateIso;
      if (!map[key]) {
        map[key] = { total: 0, present: 0 };
      }
      map[key].total += 1;
      map[key].present += classItem.students.filter(
        (student) => student.present,
      ).length;
    });
    return map;
  }, [backendClasses]);

  const todayIso = useMemo(() => formatLocalDate(new Date()), []);

  const dayPickerItems = useMemo<ScheduleDayItem[]>(
    () =>
      monthDays.map((date) => {
        const iso = formatLocalDate(date);
        return {
          date,
          iso,
          stats: daySessionCounts[iso],
          isToday: iso === todayIso,
          isSelected: iso === selectedIso,
        };
      }),
    [daySessionCounts, monthDays, selectedIso, todayIso],
  );

  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [selectedDate],
  );
  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    [currentMonth],
  );

  const canCreateClass = userRole === "admin";

  const handleCreateClass = async (formData: OneOffClassData) => {
    const start = `${selectedIso}T${formData.startTime}:00`;
    const end = `${selectedIso}T${formData.endTime}:00`;

    try {
      await createOneOffSession.mutateAsync({
        body: {
          seriesName: formData.name,
          trainerId: formData.trainerId || undefined,
          startTime: start,
          endTime: end,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: monthScheduleOptions.queryKey,
      });

      const today = new Date();
      const recentEnd = formatLocalDate(today);
      const recentStart = formatLocalDate(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      );
      await queryClient.invalidateQueries({
        queryKey: scheduleByDateQueryOptions({
          startDate: recentStart,
          endDate: recentEnd,
        }).queryKey,
      });

      invalidateReportsQueries();
      setIsNewClassOpen(false);
    } catch {
      setIsNewClassOpen(false);
    }
  };

  const handleCloseClassModal = () => setIsNewClassOpen(false);
  const handleOpenClassModal = () => {
    setModalInitialData({
      name: "",
      trainerId: "",
      startTime: "",
      endTime: "",
    });
    setIsNewClassOpen(true);
  };

  const goToToday = () => {
    const today = new Date();
    setUrlParams(today, today);
  };

  const goToPreviousMonth = () => {
    const previous = new Date(currentMonth);
    previous.setMonth(previous.getMonth() - 1);
    const firstDay = new Date(previous.getFullYear(), previous.getMonth(), 1);
    setUrlParams(previous, firstDay);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    const firstDay = new Date(next.getFullYear(), next.getMonth(), 1);
    setUrlParams(next, firstDay);
  };

  const scheduleError = scheduleQuery.error as Error | null | undefined;
  const isScheduleLoading = scheduleQuery.isLoading;

  const handleManageSession = useCallback(
    ({
      sessionId,
      trainerId,
      startTime,
    }: {
      sessionId: string;
      trainerId?: string;
      startTime?: string;
    }) => {
      if (!sessionId) {
        return;
      }

      const params = new URLSearchParams({ date: selectedIso });
      if (startTime) {
        const hhmm = startTime.replace(":", "");
        if (hhmm) {
          params.set("start", hhmm);
        }
      }
      if (trainerId) {
        params.set("trainer", trainerId);
      }

      router.push(`/schedule/${sessionId}?${params.toString()}`);
    },
    [router, selectedIso],
  );

  return (
    <div className="space-y-6 pb-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Agenda"
            description="Organize aulas e sessões da equipe"
          />
          <ScheduleToolbar
            onGoToday={goToToday}
            canCreateClass={canCreateClass}
            onCreateClass={handleOpenClassModal}
          />
        </div>

        <div className="space-y-3">
          <ScheduleMonthNavigation
            monthLabel={monthLabel}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
          <p className="text-sm text-muted-foreground capitalize">
            {selectedDateLabel}
          </p>
          <div className="mx-auto w-full md:max-w-[80vw]">
            <ScheduleDayPicker
              days={dayPickerItems}
              onSelectDay={(date) => setUrlParams(currentMonth, date)}
            />
          </div>
        </div>
      </div>

      <Section title="Aulas do dia" description={selectedDateLabel}>
        {isScheduleLoading ? <ScheduleClassSkeletonList count={3} /> : null}

        {scheduleError ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" aria-hidden="true" />}
            title="Não foi possível carregar a agenda"
            description={
              scheduleError instanceof Error
                ? scheduleError.message
                : "Tente novamente em instantes."
            }
            action={
              <Button variant="outline" onClick={() => scheduleQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!isScheduleLoading &&
        !scheduleError &&
        classesForSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {classesForSelectedDate.map((classItem) => (
              <ScheduleClassCard
                key={classItem.id ?? `${classItem.dateIso}-${classItem.time}`}
                classItem={classItem}
                trainersById={trainersById}
                onManage={handleManageSession}
              />
            ))}
          </div>
        ) : null}

        {!isScheduleLoading &&
        !scheduleError &&
        classesForSelectedDate.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" aria-hidden="true" />}
            title="Nenhuma aula para este dia"
            description="Selecione outra data ou crie uma nova aula para preencher a agenda."
            action={
              canCreateClass ? (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleOpenClassModal}
                >
                  Criar aula
                </Button>
              ) : undefined
            }
          />
        ) : null}
      </Section>

      <ClassModal
        open={isNewClassOpen}
        mode="create"
        initialData={modalInitialData}
        onClose={handleCloseClassModal}
        onSubmitData={handleCreateClass}
      />
    </div>
  );
}
