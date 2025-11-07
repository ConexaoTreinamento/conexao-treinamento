export interface WeekConfigRow {
  weekday: number;
  enabled: boolean;
  seriesName: string;
  shiftStart: string;
  shiftEnd: string;
  existingActive: Map<string, string>;
  selectedStarts: Set<string>;
}
