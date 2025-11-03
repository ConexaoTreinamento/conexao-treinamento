"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/client"
import { handleHttpError } from "@/lib/error-utils"
import {
  getSchedulesByTrainerOptions,
  getSchedulesByTrainerQueryKey,
  createScheduleMutation,
  deleteScheduleMutation,
  getAvailableSessionSeriesQueryKey,
  getScheduleQueryKey,
} from "@/lib/api-client/@tanstack/react-query.gen"
import {
  type TrainerScheduleResponseDto,
  type TrainerScheduleRequestDto,
} from "@/lib/api-client/types.gen"
import {
  DEFAULT_SERIES_NAME,
  DEFAULT_SHIFT_END,
  DEFAULT_SHIFT_START,
  MIN_CLASS_DURATION_MINUTES,
} from "@/components/trainers/schedule/constants"
import {
  TrainerWeekTimetable,
  TrainerMobileTimetable,
} from "@/components/trainers/schedule/timetable"
import { TrainerWeekConfigDialog } from "@/components/trainers/schedule/week-config-dialog"
import { addMinutesHHmm, compareHHmm, scheduleEndHHmm, toHHmm } from "@/components/trainers/schedule/time-helpers"
import type { WeekConfigRow } from "@/components/trainers/schedule/types"

export default function TrainerSchedulePage(){
  const params = useParams<{id:string}>()
  const trainerId = params.id as string
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [weekConfig, setWeekConfig] = useState<WeekConfigRow[]>([])
  const [classDuration, setClassDuration] = useState<number>(60)
  const [saving, setSaving] = useState(false)

  const handleClassDurationChange = useCallback((minutes: number) => {
    setClassDuration(Math.max(MIN_CLASS_DURATION_MINUTES, minutes))
  }, [setClassDuration])

  const genSlots = useCallback((row: WeekConfigRow): string[] => {
    if (!row.enabled) {
      return []
    }

    const slots: string[] = []
    let current = row.shiftStart

    while (current && row.shiftEnd && compareHHmm(addMinutesHHmm(current, classDuration), row.shiftEnd) <= 0) {
      slots.push(current)
      current = addMinutesHHmm(current, classDuration)
    }

    return slots
  }, [classDuration])

  const invalidateReportsQueries = () => {
    qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey
        if (!Array.isArray(key) || key.length === 0) return false
        const root = key[0]
        return typeof root === "object" && root !== null && (root as { _id?: string })._id === "getReports"
      }
    })
  }

  const invalidateTrainersQueries = () => qc.invalidateQueries({
      predicate: (query) => {
        const root = (query.queryKey as unknown[])?.[0] as { _id?: string } | undefined
      if (!root || typeof root !== "object") return false
      const id = root._id
      return id === "findAllTrainers" || id === "getTrainersForLookup"
    }
  })

  const schedulesQueryOptions = getSchedulesByTrainerOptions({path:{trainerId}, client: apiClient})
  const {data, isLoading:loadingList} = useQuery(schedulesQueryOptions)

  const createMutation = useMutation(createScheduleMutation({client: apiClient}))
  const deleteMutation = useMutation(deleteScheduleMutation({client: apiClient}))

  // Initialize weekConfig from backend schedules when dialog opens
  useEffect(()=>{
    if(!bulkOpen) return
    const list: TrainerScheduleResponseDto[] = (data as TrainerScheduleResponseDto[] | undefined) || []
    // Group all active schedules by weekday and collect their slot starts
    const grouped: Record<number, TrainerScheduleResponseDto[]> = {}
    for(const s of list){
      const wd = s.weekday ?? 0
      if(!grouped[wd]) grouped[wd] = []
      grouped[wd].push(s)
    }
    const defaults: WeekConfigRow[] = Array.from({length:7}, (_,i)=>{
      const slots = (grouped[i]||[]).slice().sort((a,b)=> (a.startTime||'').localeCompare(b.startTime||''))
      const firstStart = toHHmm(slots[0]?.startTime) || DEFAULT_SHIFT_START
      const lastSchedule = slots[slots.length-1]
      const lastEnd = lastSchedule ? scheduleEndHHmm(lastSchedule, lastSchedule.intervalDuration ?? classDuration) : DEFAULT_SHIFT_END
      const existingActive = new Map<string,string>()
      const selectedStarts = new Set<string>()
      for(const s of slots){
        const st = toHHmm(s.startTime)
        if(st){ existingActive.set(st, s.id||''); selectedStarts.add(st) }
      }
      const any = slots.length>0
      // Best-effort infer duration from first slot
      const inferredDur = slots.length>0 ? Math.max(MIN_CLASS_DURATION_MINUTES, slots[0]?.intervalDuration ?? classDuration) : classDuration
      setClassDuration(prev=> prev || inferredDur)
      return {
        weekday: i,
        enabled: any,
        seriesName: slots[0]?.seriesName || DEFAULT_SERIES_NAME,
        shiftStart: firstStart,
        shiftEnd: lastEnd,
        existingActive,
        selectedStarts,
      }
    })
    setWeekConfig(defaults)
  }, [bulkOpen, classDuration, data])

  // When classDuration changes, auto-select newly generated slots for enabled days
  useEffect(()=>{
    setWeekConfig(prev=> prev.map(r=>{
      if(!r.enabled) return r
      const slots = genSlots(r)
      const sel = new Set(r.selectedStarts)
      let changed = false
      for(const s of slots){ if(!sel.has(s)){ sel.add(s); changed = true } }
      return changed ? {...r, selectedStarts: sel} : r
    }))
  }, [classDuration, genSlots])

  const toggleEnabled = (weekday:number) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const nextEnabled = !r.enabled
    if(!nextEnabled) return {...r, enabled: nextEnabled}
    const newShiftStart = DEFAULT_SHIFT_START
    const newShiftEnd = DEFAULT_SHIFT_END
    const tempRow = { ...r, shiftStart: newShiftStart, shiftEnd: newShiftEnd, enabled: true }
    const allSlots = genSlots(tempRow)
    const lunchStart = '12:00'
    const lunchEnd = '13:00'
    const overlapsLunch = (start:string) => {
      const end = addMinutesHHmm(start, classDuration)
      return compareHHmm(start, lunchEnd) < 0 && compareHHmm(end, lunchStart) > 0
    }
    const filtered = allSlots.filter(s => !overlapsLunch(s))
    return { ...r, enabled: nextEnabled, shiftStart: newShiftStart, shiftEnd: newShiftEnd, selectedStarts: new Set(filtered) }
  }))
  const updateRow = (weekday:number, patch: Partial<WeekConfigRow>) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const next = {...r, ...patch}
    // If shift times changed or classDuration changed elsewhere, auto-select new slots
    const slots = genSlots(next)
    // Keep existing selections and add any newly generated slots
    const selected = new Set(next.selectedStarts)
    let changed = false
    for(const s of slots){ if(!selected.has(s)){ selected.add(s); changed = true } }
    return changed ? {...next, selectedStarts: selected} : next
  }))
  const toggleSlot = (weekday:number, start:string) => setWeekConfig(prev=> prev.map(r=> {
    if(r.weekday!==weekday) return r
    const sel = new Set(r.selectedStarts)
    if(sel.has(start)) sel.delete(start); else sel.add(start)
    return {...r, selectedStarts: sel}
  }))

  const rowsInvalid = useMemo(
    () =>
      weekConfig.some((row) =>
        row.enabled && (
          !row.seriesName ||
          !row.shiftStart ||
          !row.shiftEnd ||
          compareHHmm(row.shiftEnd, row.shiftStart) <= 0
        )
      ) || classDuration < MIN_CLASS_DURATION_MINUTES,
    [weekConfig, classDuration]
  )

  const handleSaveWeek = async () => {
    setSaving(true)

    try {
      for (const row of weekConfig) {
        const desired = row.enabled ? new Set(genSlots(row)) : new Set<string>()
        const existingActive = row.existingActive

        for (const [start, id] of existingActive) {
          const isSelected = row.selectedStarts.has(start)
          if (!desired.has(start) || !isSelected) {
            await deleteMutation.mutateAsync({ path: { id } })
          }
        }

        for (const start of desired) {
          const isSelected = row.selectedStarts.has(start)
          if (!existingActive.has(start) && isSelected) {
            const payload: TrainerScheduleRequestDto = {
              trainerId,
              weekday: row.weekday,
              startTime: `${start}:00`,
              intervalDuration: classDuration,
              seriesName: row.seriesName || DEFAULT_SERIES_NAME,
            }
            await createMutation.mutateAsync({ body: payload })
          }
        }
      }

      await qc.invalidateQueries({ queryKey: getSchedulesByTrainerQueryKey({ path: { trainerId }, client: apiClient }) })
      await qc.invalidateQueries({ queryKey: getAvailableSessionSeriesQueryKey({ client: apiClient }) })
      await invalidateTrainersQueries()

      const today = new Date()
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
      const monthStartIso = monthStart.toISOString().slice(0, 10)
      const monthEndIso = monthEnd.toISOString().slice(0, 10)
      await qc.invalidateQueries({
        queryKey: getScheduleQueryKey({
          client: apiClient,
          query: { startDate: monthStartIso, endDate: monthEndIso },
        }),
      })

      const formatLocalDate = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
      const recentEnd = formatLocalDate(new Date())
      const anchor = new Date()
      const recentStart = formatLocalDate(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 7))
      await qc.invalidateQueries({
        queryKey: getScheduleQueryKey({
          client: apiClient,
          query: { startDate: recentStart, endDate: recentEnd },
        }),
      })

      invalidateReportsQueries()
      toast({
        title: "Agenda atualizada",
        description: "Horários configurados com sucesso.",
        variant: "success",
      })
      setBulkOpen(false)
    } catch (error: unknown) {
      handleHttpError(error, "atualizar agenda", "Não foi possível atualizar a agenda. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const grouped = useMemo(()=>{
    const list: TrainerScheduleResponseDto[] = (data as TrainerScheduleResponseDto[] | undefined) || []
    return list.slice().sort((a,b)=>(a.weekday??0)-(b.weekday??0) || (a.startTime||'').localeCompare(b.startTime||''))
  },[data])

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Agenda do Professor</h1>
              <p className="text-sm text-muted-foreground">Configure os horários semanais e séries geradas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <TrainerWeekConfigDialog
              open={bulkOpen}
              onOpenChange={setBulkOpen}
              weekConfig={weekConfig}
              classDuration={classDuration}
              onChangeClassDuration={handleClassDurationChange}
              onToggleWeekday={toggleEnabled}
              onUpdateWeekday={updateRow}
              onToggleSlot={toggleSlot}
              onSave={handleSaveWeek}
              onCancel={() => setBulkOpen(false)}
              isSaving={saving}
              isInvalid={rowsInvalid}
              getSlotsForRow={genSlots}
            />
          </div>
        </div>

        {/* Current timetable preview */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Horários Ativos</h2>
          {loadingList && (
            <div className="space-y-2">
              {[...Array(2)].map((_,i)=> (
                <div key={i} className="animate-pulse h-24 rounded border" />
              ))}
            </div>
          )}
          {!loadingList && (
            <>
              <div className="hidden md:block">
                <TrainerWeekTimetable schedules={grouped} />
              </div>
              <div className="md:hidden">
                <TrainerMobileTimetable schedules={grouped} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
