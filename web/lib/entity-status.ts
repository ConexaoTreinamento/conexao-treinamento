export type EntityStatusFilterValue = "active" | "inactive" | "all";

export const ENTITY_STATUS_FILTER_OPTIONS: Array<{
  value: EntityStatusFilterValue;
  label: string;
}> = [
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
  { value: "all", label: "Todos" },
];

export const shouldIncludeInactive = (status: EntityStatusFilterValue): boolean =>
  status !== "active";
