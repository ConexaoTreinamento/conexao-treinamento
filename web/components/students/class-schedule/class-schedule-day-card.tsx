"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertTriangle, Calendar, Clock, History, User, Users } from "lucide-react"
import { Fragment } from "react"
import type { NormalizedSeries } from "./types"

interface ClassScheduleDayCardProps {
  dayLabel: string
  weekday: number
  classes: NormalizedSeries[]
  selectedSeries: ReadonlyArray<string>
  activeSeriesIds: ReadonlySet<string>
  canSelectSeries: (seriesId: string) => boolean
  toggleSeries: (seriesId: string) => void
  hasConflict: (series: NormalizedSeries) => boolean
  getTrainerLabel: (series: NormalizedSeries) => string
  onOpenParticipants: (seriesId: string) => void
  onOpenHistory: (seriesId: string) => void
}

const formatTime = (value?: string): string => (value ? value.slice(0, 5) : "--:--")

const getOccupancyColor = (current: number, max: number): string => {
  if (max === 0) {
    return "bg-muted"
  }
  const percentage = (current / max) * 100
  if (percentage >= 90) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }
  if (percentage >= 70) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  }
  return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
}

export function ClassScheduleDayCard({
  dayLabel,
  weekday,
  classes,
  selectedSeries,
  activeSeriesIds,
  canSelectSeries,
  toggleSeries,
  hasConflict,
  getTrainerLabel,
  onOpenParticipants,
  onOpenHistory,
}: ClassScheduleDayCardProps) {
  return (
    <Card key={weekday}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" /> {dayLabel}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {classes.length} séries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {classes.map((session) => {
          const isSelected = selectedSeries.includes(session.id)
          const canSelect = canSelectSeries(session.id)
          const max = session.capacity ?? 0
          const current = session.enrolledCount ?? 0
          const conflict = isSelected && hasConflict(session)
          const trainerLabel = getTrainerLabel(session)

          return (
            <Fragment key={session.id}>
              <div
                className={`space-y-2 rounded border p-3 transition-colors ${
                  isSelected
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSeries(session.id)}
                    disabled={!isSelected && !canSelect}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-sm font-medium">{session.seriesName}</h4>
                      {max > 0 ? (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                className={`${getOccupancyColor(
                                  current,
                                  max
                                )} text-xs ${current >= max ? "ring-2 ring-red-500" : ""}`}
                              >
                                {current}/{max}
                                {current >= max ? " • Cheia" : ""}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Inscritos/Capacidade (informativo)
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      {activeSeriesIds.has(session.id) ? (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="text-[10px]">
                                Ativo
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Compromisso atual do aluno nesta série
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      {conflict ? (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="destructive"
                                className="flex cursor-help items-center gap-1 text-[10px]"
                              >
                                <AlertTriangle className="h-3 w-3" /> Conflito
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Conflito de horário com outra série selecionada no mesmo dia
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="max-w-[14rem] truncate" title={trainerLabel}>
                          {trainerLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onOpenParticipants(session.id)}
                      title="Participantes"
                    >
                      <Users className="h-3 w-3" />
                    </Button>
                    {isSelected ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onOpenHistory(session.id)}
                        title="Histórico"
                      >
                        <History className="h-3 w-3" />
                      </Button>
                    ) : null}
                  </div>
                </div>
                {max > 0 ? (
                  <div aria-hidden className="h-1.5 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((current / (max || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </Fragment>
          )
        })}
      </CardContent>
    </Card>
  )
}
