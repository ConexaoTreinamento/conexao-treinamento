"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CalendarDays,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/base/page-header";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import {
  DashboardActivitiesCard,
  DashboardPlansCard,
  DashboardScheduleCard,
  DashboardStatsGrid,
} from "@/components/dashboard/panels";

type UserRole = "admin" | "professor" | "";

type StatisticDefinition = {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
  accent: "green" | "blue" | "purple";
};

type ActivityDefinition = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof UserCheck;
};

type ExpiredPlan = {
  id: string;
  student: string;
  plan: string;
  expiredLabel: string;
};

type ScheduleItem = {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
};

const STATISTICS: StatisticDefinition[] = [
  {
    id: "active-students",
    title: "Alunos ativos",
    value: "142",
    description: "+12% vs. mês anterior",
    icon: Users,
    accent: "green",
  },
  {
    id: "today-classes",
    title: "Aulas hoje",
    value: "18",
    description: "6 em andamento",
    icon: Calendar,
    accent: "blue",
  },
  {
    id: "registered-exercises",
    title: "Exercícios registrados",
    value: "89",
    description: "+5 hoje",
    icon: Activity,
    accent: "purple",
  },
  {
    id: "attendance-rate",
    title: "Taxa de presença",
    value: "87%",
    description: "+3% vs. semana passada",
    icon: TrendingUp,
    accent: "green",
  },
];

const RECENT_ACTIVITIES: ActivityDefinition[] = [
  {
    id: "activity-1",
    title: "Maria Silva completou treino de força",
    subtitle: "há 15 minutos",
    icon: UserCheck,
  },
  {
    id: "activity-2",
    title: "Aula de Pilates iniciada - Sala 2",
    subtitle: "há 30 minutos",
    icon: CalendarDays,
  },
  {
    id: "activity-3",
    title: "João Santos registrou nova avaliação física",
    subtitle: "há 1 hora",
    icon: Activity,
  },
  {
    id: "activity-4",
    title: "Ana Costa completou treino de cardio",
    subtitle: "há 2 horas",
    icon: UserCheck,
  },
  {
    id: "activity-5",
    title: "Aula de Yoga finalizada - Sala 1",
    subtitle: "há 3 horas",
    icon: CalendarDays,
  },
];

const EXPIRED_PLANS: ExpiredPlan[] = [
  {
    id: "plan-1",
    student: "Ana Costa",
    plan: "Mensal",
    expiredLabel: "Vencido há 2 dias",
  },
  {
    id: "plan-2",
    student: "Carlos Lima",
    plan: "Trimestral",
    expiredLabel: "Vencido há 5 dias",
  },
  {
    id: "plan-3",
    student: "Lucia Ferreira",
    plan: "Mensal",
    expiredLabel: "Vencido há 1 dia",
  },
  {
    id: "plan-4",
    student: "Roberto Silva",
    plan: "Semestral",
    expiredLabel: "Vencido há 3 dias",
  },
  {
    id: "plan-5",
    student: "Patricia Oliveira",
    plan: "Mensal",
    expiredLabel: "Vencido há 1 semana",
  },
];

const PROFESSOR_SCHEDULE: ScheduleItem[] = [
  {
    id: "schedule-1",
    title: "Pilates iniciante",
    subtitle: "Sala 1 • 8 alunos",
    timeLabel: "09:00 - 10:00",
  },
  {
    id: "schedule-2",
    title: "Musculação",
    subtitle: "Sala 3 • 12 alunos",
    timeLabel: "14:00 - 15:00",
  },
  {
    id: "schedule-3",
    title: "Yoga",
    subtitle: "Sala 2 • 6 alunos",
    timeLabel: "18:00 - 19:00",
  },
];

export function DashboardPageView() {
  const [userRole, setUserRole] = useState<UserRole>("");
  const [userName, setUserName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = (localStorage.getItem("userRole") as UserRole | null) ?? "";
    const name = localStorage.getItem("userName") ?? "";

    if (!role) {
      router.push("/");
      return;
    }

    setUserRole(role);
    setUserName(name);
  }, [router]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    if (!normalizedSearch) {
      return RECENT_ACTIVITIES;
    }

    return RECENT_ACTIVITIES.filter((activity) =>
      activity.title.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch]);

  const filteredPlans = useMemo(() => {
    if (!normalizedSearch) {
      return EXPIRED_PLANS;
    }

    return EXPIRED_PLANS.filter((plan) =>
      plan.student.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch]);

  const resultsSummary = normalizedSearch
    ? `Encontradas ${filteredActivities.length} atividades e ${filteredPlans.length} planos`
    : null;

  if (!userRole) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Dashboard"
          description={`Bem-vindo, ${userName || "usuário"}. Acompanhe o resumo das atividades do dia.`}
        />
        <Button
          onClick={() => router.push("/students/new")}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo aluno
        </Button>
      </div>

      <DashboardSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
      />

      {resultsSummary ? (
        <p className="text-sm text-muted-foreground">{resultsSummary}</p>
      ) : null}

      <DashboardStatsGrid stats={STATISTICS} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardActivitiesCard
          activities={filteredActivities.map((activity) => ({
            ...activity,
            accent: "green" as const,
          }))}
          badge={
            normalizedSearch ? String(filteredActivities.length) : undefined
          }
        />

        {userRole === "admin" ? (
          <DashboardPlansCard
            plans={filteredPlans}
            badge={
              normalizedSearch
                ? String(filteredPlans.length)
                : String(EXPIRED_PLANS.length)
            }
            onViewAll={() => router.push("/plans")}
          />
        ) : null}

        {userRole === "professor" ? (
          <DashboardScheduleCard items={PROFESSOR_SCHEDULE} />
        ) : null}
      </div>

      {userRole === "admin" ? (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Mantenha o acompanhamento dos planos vencidos para evitar interrupções
          na rotina dos alunos.
        </div>
      ) : null}
    </div>
  );
}
