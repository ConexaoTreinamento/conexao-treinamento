import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, type StatCardProps } from "@/components/base/stat-card";
import { EmptyState } from "@/components/base/empty-state";

interface DashboardStat extends Omit<StatCardProps, "value"> {
  id: string;
  value: string | number;
}

interface DashboardStatsGridProps {
  stats: DashboardStat[];
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  if (!stats.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ id, ...stat }) => (
        <StatCard key={id} {...stat} />
      ))}
    </div>
  );
}

interface DashboardActivity {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: StatCardProps["accent"];
}

const ACTIVITY_ACCENTS: Record<
  NonNullable<DashboardActivity["accent"]>,
  string
> = {
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-300",
  purple: "text-purple-600 dark:text-purple-300",
  orange: "text-orange-600 dark:text-orange-300",
  neutral: "text-muted-foreground",
};

interface DashboardActivitiesCardProps {
  activities: DashboardActivity[];
  emptyLabel?: string;
  badge?: string;
}

export function DashboardActivitiesCard({
  activities,
  emptyLabel = "Nenhuma atividade recente",
  badge,
}: DashboardActivitiesCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          Atividades recentes
        </CardTitle>
        {badge ? (
          <Badge variant="outline" className="text-xs">
            {badge}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/40 p-3"
            >
              <activity.icon
                className={
                  "h-5 w-5 " +
                  (activity.accent
                    ? ACTIVITY_ACCENTS[activity.accent]
                    : ACTIVITY_ACCENTS.green)
                }
                aria-hidden="true"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.subtitle}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title={emptyLabel}
            description="As atividades recentes aparecerão aqui assim que houver movimentações."
            className="min-h-0 border-none bg-transparent p-6"
          />
        )}
      </CardContent>
    </Card>
  );
}

interface ExpiredPlanSummary {
  id: string;
  student: string;
  plan: string;
  expiredLabel: string;
}

interface DashboardPlansCardProps {
  plans: ExpiredPlanSummary[];
  onViewAll?: () => void;
  badge?: string;
}

export function DashboardPlansCard({
  plans,
  onViewAll,
  badge,
}: DashboardPlansCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Planos vencidos</CardTitle>
          {badge ? (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          ) : null}
        </div>
        {onViewAll ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="bg-transparent"
          >
            Ver todos
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {plans.length ? (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 p-3 text-sm dark:border-orange-900 dark:bg-orange-950/30"
            >
              <div>
                <p className="font-medium leading-tight">{plan.student}</p>
                <p className="text-xs text-muted-foreground">
                  Plano {plan.plan}
                </p>
              </div>
              <Badge variant="destructive" className="text-xs">
                {plan.expiredLabel}
              </Badge>
            </div>
          ))
        ) : (
          <EmptyState
            title="Nenhum plano vencido"
            description="Estamos em dia. Você será avisado quando algum plano estiver próximo do vencimento."
            className="min-h-0 border-none bg-transparent p-6"
          />
        )}
      </CardContent>
    </Card>
  );
}

interface ScheduleEntry {
  id: string;
  title: string;
  subtitle: string;
  timeLabel: string;
  badge?: string;
}

interface DashboardScheduleCardProps {
  items: ScheduleEntry[];
}

export function DashboardScheduleCard({ items }: DashboardScheduleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Minha agenda de hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-border/50 bg-muted/40 p-3 text-sm"
            >
              <div>
                <p className="font-medium leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {item.timeLabel}
              </Badge>
            </div>
          ))
        ) : (
          <EmptyState
            title="Nenhuma aula hoje"
            description="Assim que forem adicionadas aulas para hoje, elas aparecerão aqui."
            className="min-h-0 border-none bg-transparent p-6"
          />
        )}
      </CardContent>
    </Card>
  );
}
