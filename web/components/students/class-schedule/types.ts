export interface NormalizedSeries {
  id: string
  weekday: number
  startTime?: string
  endTime?: string
  seriesName: string
  active: boolean
  intervalDuration?: number
  capacity?: number
  enrolledCount?: number
  trainerId?: string
  trainerName?: string
}
