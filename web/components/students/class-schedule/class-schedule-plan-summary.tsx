"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ClassSchedulePlanSummaryProps {
  planDays: number;
  selectedDaysCount: number;
  selectedSeriesCount: number;
}

export function ClassSchedulePlanSummary({
  planDays,
  selectedDaysCount,
  selectedSeriesCount,
}: ClassSchedulePlanSummaryProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-semibold">Plano Atual</h3>
          <p className="text-sm text-muted-foreground">
            Limite de {planDays} dias por semana
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="mb-1">
            {selectedDaysCount}/{planDays} dias
          </Badge>
          <p className="text-xs text-muted-foreground">
            {selectedSeriesCount} séries
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
