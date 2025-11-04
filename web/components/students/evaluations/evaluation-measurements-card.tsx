"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MeasurementItem {
  label: string;
  value?: number | null;
  unit?: string;
}

interface MeasurementGroup {
  title?: string;
  metrics: MeasurementItem[];
  gridClassName?: string;
}

interface EvaluationMeasurementsCardProps {
  title: string;
  description?: string;
  groups: MeasurementGroup[];
}

const formatMeasurement = (
  value: number | null | undefined,
  unit?: string,
): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const formatted = Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return unit ? `${formatted} ${unit}` : formatted;
};

export function EvaluationMeasurementsCard({
  title,
  description,
  groups,
}: EvaluationMeasurementsCardProps) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      metrics: group.metrics.filter(
        (metric) => metric.value !== null && metric.value !== undefined,
      ),
    }))
    .filter((group) => group.metrics.length > 0);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {visibleGroups.map((group, index) => (
          <div key={group.title ?? index}>
            {group.title ? (
              <h3 className="mb-3 font-semibold">{group.title}</h3>
            ) : null}
            <div
              className={
                group.gridClassName ?? "grid grid-cols-2 gap-4 md:grid-cols-4"
              }
            >
              {group.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="font-medium">
                    {formatMeasurement(metric.value, metric.unit)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
