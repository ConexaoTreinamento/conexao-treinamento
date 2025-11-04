interface MeasurementCardProps {
  label: string;
  value: string | number;
  unit: string;
}

export function MeasurementCard({ label, value, unit }: MeasurementCardProps) {
  return (
    <div
      className={`flex justify-between items-center p-4 bg-muted/30 rounded-lg`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-primary">
        {value} {unit}
      </span>
    </div>
  );
}
