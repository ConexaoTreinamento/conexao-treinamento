"use client"

import {useEffect, useMemo, useState} from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Calendar, Clock, User, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import {apiClient} from "@/lib/client"
import {getAvailableSessionSeriesOptions, getStudentCommitmentsOptions, bulkUpdateCommitmentsMutation, getCurrentStudentPlanOptions} from "@/lib/api-client/@tanstack/react-query.gen"
import {useQueryClient, useMutation, useQuery} from "@tanstack/react-query"
import { TrainerSchedule } from "@/lib/api-client"

const weekdayMap: Record<number,string> = {0:"Domingo",1:"Segunda-feira",2:"Terça-feira",3:"Quarta-feira",4:"Quinta-feira",5:"Sexta-feira",6:"Sábado"}

export default function ClassSchedulePage() {
  const router = useRouter()
  const params = useParams<{id:string}>()
  const studentId = params.id as string
  const qc = useQueryClient()
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  // Queries
  const availableQuery = useQuery(getAvailableSessionSeriesOptions({client: apiClient}))
  const commitmentsQuery = useQuery(getStudentCommitmentsOptions({path:{studentId}, client: apiClient}))
  const planQuery = useQuery(getCurrentStudentPlanOptions({path:{studentId}, client: apiClient}))
  const mutation = useMutation(bulkUpdateCommitmentsMutation({client: apiClient}))

  const planDays = planQuery.data?.planMaxDays || 3

  // Pre-select existing ATTENDING commitments
  useEffect(()=> {
    if(commitmentsQuery.data){
      const attending = (commitmentsQuery.data).filter(c=> c.commitmentStatus==='ATTENDING').map(c=> c.sessionSeriesId!)
      setSelectedSeries(attending)
    }
  }, [commitmentsQuery.data])

  interface NormalizedSeries {
    id: string
    weekday: number
    startTime?: string
    endTime?: string
    seriesName: string
    active: boolean
    intervalDuration?: number
    capacity?: number
    enrolledCount?: number
  }

  interface WeekdayGroup { weekday: number; day: string; classes: NormalizedSeries[] }

  const normalizedSeries: NormalizedSeries[] = useMemo(()=> {
    interface LegacyTrainerSchedule { dayOfWeek?: number; name?: string }
    const synonym = {
      weekday: (s: TrainerSchedule & LegacyTrainerSchedule) => s.weekday ?? s.dayOfWeek,
      seriesName: (s: TrainerSchedule & LegacyTrainerSchedule) => s.seriesName ?? s.name ?? 'Série'
    }
    const pickNumber = <K extends string>(s: unknown, key: K): number | undefined => (
      typeof s === 'object' && s !== null && key in (s as Record<string, unknown>) && typeof (s as Record<string, unknown>)[key] === 'number'
        ? (s as Record<string, number>)[key]
        : undefined
    )
    const raw = (availableQuery.data || []) as (TrainerSchedule & LegacyTrainerSchedule)[]
    return raw
      .filter(s => !!s && !!s.id && !!s.active && typeof synonym.weekday(s) === 'number')
      .map(s => ({
        id: s.id!,
        weekday: synonym.weekday(s)!,
        startTime: s.startTime,
        endTime: s.endTime,
        seriesName: synonym.seriesName(s),
        active: true,
        intervalDuration: pickNumber(s, 'intervalDuration'),
        capacity: pickNumber(s, 'capacity'),
        enrolledCount: pickNumber(s, 'enrolledCount')
      }))
  }, [availableQuery.data])

  const weeklyByWeekday: WeekdayGroup[] = useMemo(()=> {
    const grouped: Record<number, NormalizedSeries[]> = {}
    for (const s of normalizedSeries) {
      if (!grouped[s.weekday]) grouped[s.weekday] = []
      grouped[s.weekday].push(s)
    }
    return Object.keys(grouped)
      .map(k => Number(k))
      .sort((a,b)=> a-b)
      .map(weekday => ({
        weekday,
        day: weekdayMap[weekday],
        classes: grouped[weekday].slice().sort((x,y)=> (x.startTime||'').localeCompare(y.startTime||''))
      }))
  }, [normalizedSeries])

  const seriesById = useMemo(()=> {
    const m = new Map<string, NormalizedSeries>()
    for (const s of normalizedSeries) m.set(s.id, s)
    return m
  }, [normalizedSeries])

  const selectedDays = useMemo(()=> {
    const selectedWeekdays = new Set<number>()
    for (const id of selectedSeries) {
      const s = seriesById.get(id)
      if (s) selectedWeekdays.add(s.weekday)
    }
    return Array.from(selectedWeekdays).map(w=> weekdayMap[w])
  }, [selectedSeries, seriesById])

  const canSelectSeries = (seriesId: string) => {
    if(selectedSeries.includes(seriesId)) return true
    const series = seriesById.get(seriesId)
    if(!series) return false
    // If day already selected
    if(selectedSeries.some(id=> {
      const other = seriesById.get(id)
      return other?.weekday === series.weekday
    })) return true
    return selectedDays.length < planDays
  }

  const toggleSeries = (seriesId: string) => {
    setSelectedSeries(prev=> prev.includes(seriesId)? prev.filter(i=> i!==seriesId): canSelectSeries(seriesId)? [...prev, seriesId]: prev)
  }

  const toggleDay = (weekday: number) => {
    const ids = normalizedSeries.filter(s => s.weekday === weekday).map(s => s.id)
    const anySelected = ids.some(id => selectedSeries.includes(id))
    if(anySelected){
      setSelectedSeries(prev=> prev.filter(id=> !ids.includes(id)))
    } else if(selectedDays.length < planDays) {
      setSelectedSeries(prev=> [...prev, ...ids.filter(id => !prev.includes(id))])
    }
  }

  const handleSave = async () => {
    // Determine adds/removals
    const currentAttending = (commitmentsQuery.data||[])
      .filter((c)=> c.commitmentStatus==='ATTENDING')
      .map((c)=> c.sessionSeriesId)
      .filter((id): id is string => !!id)
    const toAttend = selectedSeries.filter(id=> !currentAttending.includes(id))
    const toRemove = currentAttending.filter(id => !selectedSeries.includes(id))
    try {
      if(toAttend.length){
        await mutation.mutateAsync({path:{studentId}, body:{sessionSeriesIds: toAttend, commitmentStatus:'ATTENDING'}, client: apiClient})
      }
      if(toRemove.length){
        await mutation.mutateAsync({path:{studentId}, body:{sessionSeriesIds: toRemove, commitmentStatus:'NOT_ATTENDING'}, client: apiClient})
      }
      await qc.invalidateQueries({queryKey:['getStudentCommitments']})
      router.back()
    } catch(e){/* no-op */}
  }

  const getOccupancyColor = (current: number, max: number) => {
    if(max===0) return "bg-muted"
    const pct = (current/max)*100
    if(pct>=90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if(pct>=70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={()=> router.back()}><ArrowLeft className="w-4 h-4"/></Button>
          <div>
            <h1 className="text-xl font-bold">Cronograma de Aulas</h1>
            <p className="text-sm text-muted-foreground">Selecione as séries que deseja frequentar</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Plano Atual</h3>
              <p className="text-sm text-muted-foreground">Limite de {planDays} dias por semana</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">{selectedDays.length}/{planDays} dias</Badge>
              <p className="text-xs text-muted-foreground">{selectedSeries.length} séries</p>
            </div>
          </CardContent>
        </Card>
        {availableQuery.isLoading && <div className="space-y-2">{[...Array(3)].map((_,i)=><Card key={i} className="animate-pulse"><CardContent className="h-16"/></Card>)}</div>}
        <div className="space-y-3">
          {weeklyByWeekday.map(day=> {
            const isDaySelected = selectedSeries.some(id=> {
              const s = seriesById.get(id)
              return s?.weekday === day.weekday
            })
            const canSelectDay = selectedDays.includes(day.day) || selectedDays.length < planDays
            return (
              <Card key={day.weekday}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Checkbox checked={isDaySelected} onCheckedChange={()=> toggleDay(day.weekday)} disabled={!canSelectDay && !isDaySelected}/>
                      <Calendar className="w-4 h-4"/> {day.day}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{day.classes.length} séries</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.classes.map(cls=> {
                    const isSelected = selectedSeries.includes(cls.id)
                    const canSelect = canSelectSeries(cls.id)
                    const max =  cls.intervalDuration || cls.capacity || 1
                    const current = cls.enrolledCount || 0
                    return (
                      <div key={cls.id} className={`p-3 rounded border transition-colors ${isSelected? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800':'hover:bg-muted/50'}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onCheckedChange={()=> toggleSeries(cls.id)} disabled={!isSelected && !canSelect} className="mt-0.5"/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{cls.seriesName}</h4>
                              <Badge className={`${getOccupancyColor(current, max)} text-xs`}>{current}/{max}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><Clock className="w-3 h-3"/><span>{cls.startTime?.slice(0,5)} - {cls.endTime?.slice(0,5)}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" onClick={()=> router.back()}>Cancelar</Button>
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700" disabled={mutation.isPending || selectedSeries.length===0}>{mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}<Save className="w-4 h-4 mr-2"/> Salvar</Button>
        </div>
      </div>
    </Layout>
  )
}
