"use client"

import { useEffect, useMemo, useState } from "react"
import Layout from "@/components/layout"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { getScheduleOptions, updateSessionMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import type { ScheduleResponseDto, ScheduledSession, SessionParticipant, SessionUpdateRequestDto } from "@/lib/api-client/types.gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle, XCircle, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTrainersList } from "@/lib/hooks/trainer-schedule-queries"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const qc = useQueryClient()
  const idParam = params.id as string

  // Query a window that likely contains the session; Agenda navigation will already have the data cached
  const today = new Date()
  const startDate = new Date(today); startDate.setDate(today.getDate() - 30)
  const endDate = new Date(today); endDate.setDate(today.getDate() + 30)

  const scheduleQ = useQuery(getScheduleOptions({ client: apiClient, query: { startDate: startDate.toISOString().slice(0,10), endDate: endDate.toISOString().slice(0,10) } }))

  const session: ScheduledSession | undefined = useMemo(() => {
    const sessions = (scheduleQ.data as ScheduleResponseDto | undefined)?.sessions ?? []
    return sessions.find(s => String(s.sessionId ?? "") === idParam || String(s.id ?? "") === idParam)
  }, [scheduleQ.data, idParam])

  const [notes, setNotes] = useState<string>("")
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined)
  const [canceled, setCanceled] = useState<boolean>(false)
  const [trainerIdOverride, setTrainerIdOverride] = useState<string>("")

  useEffect(() => {
    if (session) {
      setNotes(session.notes ?? "")
      setParticipants(session.participants ?? [])
      setMaxParticipants((session as any).maxParticipants ?? undefined)
      setCanceled(Boolean((session as any).canceled))
      setTrainerIdOverride(String((session as any).trainerId ?? ""))
    }
  }, [session])

  const updateMutation = useMutation(updateSessionMutation({ client: apiClient }))
  const trainersQ = useTrainersList()

  const togglePresence = (participantId?: string) => {
    if (!participantId) return
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, present: !p.present } : p))
  }

  const save = () => {
    if (!session) return
    const sid = session.sessionId ?? session.id
    if (!sid) return

    const body: SessionUpdateRequestDto = {
      notes,
      participants: participants.map(p => ({
        id: p.id,
        studentId: p.studentId,
        participationType: p.participationType,
        attendanceNotes: p.attendanceNotes,
        present: p.present,
      })) as any,
      // Extended fields understood by backend via diff
      ...(trainerIdOverride ? { trainerId: trainerIdOverride as any } : {}),
      ...(typeof maxParticipants === 'number' ? { maxParticipants: maxParticipants as any } : {}),
      ...(canceled ? { canceled: true as any } : {}),
    }

    updateMutation.mutate({
      path: { sessionId: String(sid) },
      body,
      client: apiClient,
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getSchedule' })
        router.back()
      }
    })
  }

  if (scheduleQ.isLoading) {
    return (
      <Layout>
        <div className="p-6 text-sm text-muted-foreground">Carregando aula…</div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-lg font-semibold mb-2">Aula não encontrada</div>
          <Button variant="outline" onClick={() => router.push('/schedule')}>Voltar</Button>
        </div>
      </Layout>
    )
  }

  const start = session.startTime ? new Date(session.startTime) : undefined
  const end = session.endTime ? new Date(session.endTime) : undefined

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <Button onClick={save} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-1" /> Salvar alterações
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{session.seriesName ?? 'Aula'}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Professor</Label>
              <Select value={trainerIdOverride || undefined} onValueChange={(v) => setTrainerIdOverride(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {trainersQ.isLoading && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                  {trainersQ.data?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
                  ))}
                  <SelectItem value="">—</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data e Horário</Label>
              <Input value={start ? `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}` : ''} readOnly />
            </div>
            <div>
              <Label>Capacidade (max alunos)</Label>
              <Input type="number" min={1} value={typeof maxParticipants === 'number' ? String(maxParticipants) : ''} onChange={(e) => setMaxParticipants(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="ex: 10" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox checked={canceled} onCheckedChange={(v) => setCanceled(Boolean(v))} id="canceled" />
              <Label htmlFor="canceled">Cancelar esta aula</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas desta aula" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(participants ?? []).length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum aluno inscrito</div>
            )}
            {participants?.map(p => (
              <div key={p.id} className="flex items-center justify-between border rounded p-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{p.student?.name ?? p.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.present ? (
                    <span className="text-green-700 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Presente</span>
                  ) : (
                    <span className="text-red-700 text-xs flex items-center"><XCircle className="w-3 h-3 mr-1" /> Ausente</span>
                  )}
                  <Button size="sm" variant="outline" onClick={() => togglePresence(p.id)}>Alternar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
