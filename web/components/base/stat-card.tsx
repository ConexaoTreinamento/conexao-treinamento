import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  accent?: "green" | "blue" | "purple" | "orange" | "neutral";
  footer?: ReactNode;
  className?: string;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps["accent"]>, string> = {
  green: "text-green-600 dark:text-green-400",
  blue: "text-blue-600 dark:text-blue-300",
  purple: "text-purple-600 dark:text-purple-300",
  orange: "text-orange-600 dark:text-orange-300",
  neutral: "text-muted-foreground",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "neutral",
  footer,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? (
          <Icon
            className={cn("h-5 w-5", ACCENT_STYLES[accent])}
            aria-hidden="true"
          />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
        {footer ? (
          <div className="pt-2 text-xs text-muted-foreground">{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
