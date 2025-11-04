"use client"

import { Suspense, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import { SessionDetailView } from "@/components/schedule/session/session-detail-view"

export default function ClassDetailPage() {
  return (
    <Suspense
      fallback={(
        <Layout>
          <div className="p-6 text-sm text-muted-foreground">Carregando aula...</div>
        </Layout>
      )}
    >
      <ClassDetailPageContent />
    </Suspense>
  )
}

function ClassDetailPageContent() {
  const { sessionId: rawSessionId } = useParams<{ sessionId: string }>()
  const searchParams = useSearchParams()

  const sessionId = useMemo(() => {
    if (!rawSessionId) return ""
    try {
      return rawSessionId.includes("%") ? decodeURIComponent(rawSessionId) : rawSessionId
    } catch {
      return rawSessionId
    }
  }, [rawSessionId])

  const hintedDate = searchParams.get("date") || undefined
  const hintedTrainer = searchParams.get("trainer") || undefined

  if (!sessionId) {
    return (
      <Layout>
        <div className="p-6 text-sm text-muted-foreground">Sessão inválida.</div>
      </Layout>
    )
  }

  return (
    <SessionDetailView
      sessionId={sessionId}
      hintedDate={hintedDate}
      hintedTrainer={hintedTrainer}
    />
  )
}
