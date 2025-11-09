import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ENTITY_STATUS_FILTER_OPTIONS,
  type EntityStatusFilterValue,
} from "@/lib/entity-status";

export interface EntityStatusFilterProps {
  id?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  value: EntityStatusFilterValue;
  onChange: (value: EntityStatusFilterValue) => void;
}

export function EntityStatusFilter({
  id = "entity-status-filter",
  label = "Status",
  description,
  placeholder = "Selecione",
  className,
  value,
  onChange,
}: EntityStatusFilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </Label>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => onChange(next as EntityStatusFilterValue)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
