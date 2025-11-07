"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { apiClient } from "@/lib/client";
import {
  getReportsOptions,
  getTrainersForLookupOptions,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type {
  AgeDistributionDto,
  TrainerLookupDto,
  TrainerReportDto,
} from "@/lib/api-client/types.gen";
import { TrainerSelect } from "@/components/trainers/trainer-select";
import { PageHeader } from "@/components/base/page-header";
import { formatDurationHours } from "@/lib/formatters/time";

type PeriodKey = "week" | "month" | "quarter" | "year" | "custom";

type CustomRange = {
  start: string;
  end: string;
};

type ReportsFiltersForm = {
  searchTerm: string;
  trainerId: string;
  period: PeriodKey;
  customRange: CustomRange;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDateFromInput = (value: string, endOfDay = false) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  if (endOfDay) {
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const computePeriodRange = (period: PeriodKey, customRange?: CustomRange) => {
  if (period === "custom") {
    const startDate = customRange?.start
      ? createDateFromInput(customRange.start, false)
      : null;
    const endDate = customRange?.end
      ? createDateFromInput(customRange.end, true)
      : null;

    if (!startDate || !endDate || startDate > endDate) {
      return { start: "", end: "" };
    }

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case "week": {
      start.setDate(now.getDate() - 6);
      break;
    }
    case "month": {
      start.setMonth(now.getMonth(), 1);
      break;
    }
    case "quarter": {
      const quarterIndex = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = quarterIndex * 3;
      start.setMonth(quarterStartMonth, 1);
      end.setMonth(quarterStartMonth + 3, 0);
      break;
    }
    case "year": {
      start.setMonth(0, 1);
      end.setMonth(12, 0);
      break;
    }
    default:
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

const formatCompensation = (value?: "HOURLY" | "MONTHLY") => {
  if (value === "MONTHLY") return "Mensalista";
  if (value === "HOURLY") return "Horista";
  return "—";
};

const formatNumber = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value);

export function ReportsPageView() {
  const [userRole, setUserRole] = useState<string>("");
  const { control, watch, setValue, getValues } = useForm<ReportsFiltersForm>({
    mode: "onChange",
    defaultValues: {
      searchTerm: "",
      trainerId: "all",
      period: "month",
      customRange: { start: "", end: "" },
    },
  });

  const selectedPeriod = (watch("period") ?? "month") as PeriodKey;
  const watchedCustomRange = useMemo(
    () => watch("customRange") ?? { start: "", end: "" },
    [watch],
  );
  const customRangeStart = watchedCustomRange.start ?? "";
  const customRangeEnd = watchedCustomRange.end ?? "";
  const selectedTrainer = watch("trainerId") ?? "all";
  const searchTerm = watch("searchTerm") ?? "";
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor";
    setUserRole(role);

    if (role !== "admin") {
      router.push("/schedule");
    }
  }, [router]);

  const periodRange = useMemo(
    () => computePeriodRange(selectedPeriod, watchedCustomRange),
    [selectedPeriod, watchedCustomRange],
  );

  const customRangeError = useMemo(() => {
    if (
      selectedPeriod !== "custom" ||
      !watchedCustomRange.start ||
      !watchedCustomRange.end
    ) {
      return false;
    }

    const startDate = createDateFromInput(watchedCustomRange.start);
    const endDate = createDateFromInput(watchedCustomRange.end);

    if (!startDate || !endDate) return false;

    return startDate > endDate;
  }, [watchedCustomRange.end, watchedCustomRange.start, selectedPeriod]);

  const handlePeriodSelect = (
    value: string,
    onChange: (value: PeriodKey) => void,
  ) => {
    const period = value as PeriodKey;
    onChange(period);

    if (period === "custom") {
      const currentRange = getValues("customRange");
      if (currentRange?.start && currentRange?.end) {
        return;
      }

      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);

      setValue(
        "customRange",
        {
          start: formatDateInput(start),
          end: formatDateInput(now),
        },
        { shouldDirty: true, shouldValidate: true },
      );
    }
  };

  const handleCustomRangeChange = (key: keyof CustomRange, value: string) => {
    const currentRange = getValues("customRange") ?? { start: "", end: "" };
    setValue(
      "customRange",
      {
        ...currentRange,
        [key]: value,
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const reportsQuery = useQuery({
    ...getReportsOptions({
      client: apiClient,
      query: {
        startDate: periodRange.start,
        endDate: periodRange.end,
        ...(selectedTrainer !== "all" ? { trainerId: selectedTrainer } : {}),
      },
    }),
    enabled:
      userRole === "admin" && Boolean(periodRange.start && periodRange.end),
    staleTime: 60_000,
  });

  const trainersQuery = useQuery({
    ...getTrainersForLookupOptions({ client: apiClient }),
    enabled: userRole === "admin",
    staleTime: 5 * 60_000,
  });

  const trainerOptions = useMemo(
    () =>
      (trainersQuery.data ?? []).filter(
        (trainer): trainer is TrainerLookupDto & { id: string } =>
          Boolean(trainer?.id),
      ),
    [trainersQuery.data],
  );

  useEffect(() => {
    if (
      selectedTrainer !== "all" &&
      trainerOptions.length > 0 &&
      !trainerOptions.some((trainer) => trainer.id === selectedTrainer)
    ) {
      setValue("trainerId", "all");
    }
  }, [selectedTrainer, setValue, trainerOptions]);

  const trainerReports = useMemo<TrainerReportDto[]>(
    () => (reportsQuery.data?.trainerReports ?? []) as TrainerReportDto[],
    [reportsQuery.data],
  );

  const filteredReports = useMemo<TrainerReportDto[]>(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return trainerReports;
    return trainerReports.filter((trainer) =>
      (trainer?.name ?? "").toLowerCase().includes(search),
    );
  }, [trainerReports, searchTerm]);

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, trainer) => {
        acc.hours += trainer.hoursWorked ?? 0;
        acc.classes += trainer.classesGiven ?? 0;
        acc.students += trainer.studentsManaged ?? 0;
        return acc;
      },
      { hours: 0, classes: 0, students: 0 },
    );
  }, [filteredReports]);

  const ageDistribution = useMemo(
    () => reportsQuery.data?.ageDistribution ?? [],
    [reportsQuery.data],
  );

  const isLoading = reportsQuery.isLoading || trainersQuery.isLoading;
  const isError = reportsQuery.isError;

  if (userRole !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
        <PageHeader
          title="Relatórios"
          description="Análise de horas trabalhadas e aulas ministradas"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Controller
          control={control}
          name="searchTerm"
          render={({ field }) => (
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Buscar professor..."
                className="pl-10"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="trainerId"
          render={({ field }) => (
            <TrainerSelect
              value={field.value}
              onValueChange={field.onChange}
              trainers={trainerOptions}
              isLoading={trainersQuery.isLoading}
              disabled={trainersQuery.isError}
              className="w-full sm:w-48"
              placeholder="Filtrar por professor"
            />
          )}
        />

        <Controller
          control={control}
          name="period"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) =>
                handlePeriodSelect(value, field.onChange)
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="custom">Intervalo Personalizado</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {selectedPeriod === "custom" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reports-custom-start">Data inicial</Label>
            <Input
              id="reports-custom-start"
              type="date"
              value={customRangeStart}
              max={customRangeEnd || undefined}
              onChange={(event) =>
                handleCustomRangeChange("start", event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reports-custom-end">Data final</Label>
            <Input
              id="reports-custom-end"
              type="date"
              value={customRangeEnd}
              min={customRangeStart || undefined}
              onChange={(event) =>
                handleCustomRangeChange("end", event.target.value)
              }
            />
          </div>
          {!customRangeStart || !customRangeEnd || customRangeError ? (
            <p
              className={`text-sm sm:col-span-2 ${customRangeError ? "text-destructive" : "text-muted-foreground"}`}
            >
              {customRangeError
                ? "A data inicial não pode ser maior que a data final."
                : "Selecione a data inicial e final para aplicar o filtro."}
            </p>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Não foi possível carregar os relatórios. Tente novamente mais tarde.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Horas
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    formatDurationHours(totals.hours)
                  )}
                </p>
              </div>
              <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aulas Ministradas
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    formatNumber(totals.classes)
                  )}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Alunos Atendidos
                </p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    formatNumber(totals.students)
                  )}
                </p>
              </div>
              <Users className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            Performance dos professores
          </CardTitle>
          <CardDescription>
            Detalhamento de horas trabalhadas e aulas ministradas por professor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2
                className="h-5 w-5 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          ) : filteredReports.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nenhum dado disponível para os filtros selecionados.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Professor</th>
                      <th className="p-3 text-left">Horas trabalhadas</th>
                      <th className="p-3 text-left">Aulas ministradas</th>
                      <th className="p-3 text-left">Alunos</th>
                      <th className="p-3 text-left">Regime</th>
                      <th className="p-3 text-left">Especialidades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((trainer) => {
                      const name = trainer?.name ?? "Professor";
                      const initials = name
                        .replace("Prof.", "")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase();

                      return (
                        <tr
                          key={trainer?.id ?? name}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <span className="select-none text-sm font-semibold text-green-700 dark:text-green-300">
                                  {initials || "?"}
                                </span>
                              </div>
                              <span className="font-medium">{name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium">
                            {formatDurationHours(trainer?.hoursWorked ?? 0)}
                          </td>
                          <td className="p-3 font-medium">
                            {formatNumber(trainer?.classesGiven ?? 0)}
                          </td>
                          <td className="p-3 font-medium">
                            {formatNumber(trainer?.studentsManaged ?? 0)}
                          </td>
                          <td className="p-3">
                            <Badge className="bg-muted text-xs font-medium">
                              {formatCompensation(trainer?.compensation)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(trainer?.specialties ?? []).map(
                                (specialty, idx) => (
                                  <Badge
                                    key={`${trainer?.id ?? name}-${idx}`}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {specialty}
                                  </Badge>
                                ),
                              )}
                              {(trainer?.specialties?.length ?? 0) === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 sm:hidden">
                {filteredReports.map((trainer) => {
                  const name = trainer?.name ?? "Professor";
                  const initials = name
                    .replace("Prof.", "")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={trainer?.id ?? name}
                      className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <span className="select-none text-sm font-semibold text-green-700 dark:text-green-300">
                            {initials || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCompensation(trainer?.compensation)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Horas</p>
                          <p className="font-semibold">
                            {formatDurationHours(trainer?.hoursWorked ?? 0)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Aulas</p>
                          <p className="font-semibold">
                            {formatNumber(trainer?.classesGiven ?? 0)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Alunos</p>
                          <p className="font-semibold">
                            {formatNumber(trainer?.studentsManaged ?? 0)}
                          </p>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <p className="text-muted-foreground">
                            Especialidades
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(trainer?.specialties ?? []).map(
                              (specialty, idx) => (
                                <Badge
                                  key={`${trainer?.id ?? name}-mobile-${idx}`}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ),
                            )}
                            {(trainer?.specialties?.length ?? 0) === 0 ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            Perfil etário dos alunos
          </CardTitle>
          <CardDescription>
            Distribuição dos alunos por faixa etária
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            ) : ageDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum dado disponível para o período selecionado.
              </p>
            ) : (
              ageDistribution.map((profile: AgeDistributionDto, index) => {
                const percentage = profile?.percentage ?? 0;
                const count = profile?.count ?? 0;
                const percentageLabel = Number.isFinite(percentage)
                  ? percentage.toFixed(1).replace(/\.0$/, "")
                  : "0";
                return (
                  <div
                    key={`${profile?.ageRange ?? index}`}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded bg-green-600" />
                      <span className="font-medium">
                        {profile?.ageRange ?? "Faixa etária"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:min-w-[220px]">
                      <div className="h-2 w-full rounded-full bg-muted sm:w-32">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${Math.min(100, Math.max(0, percentage))}%`,
                          }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm font-medium">
                        {formatNumber(count)}
                      </span>
                      <span className="w-12 text-right text-sm text-muted-foreground">
                        ({percentageLabel}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
