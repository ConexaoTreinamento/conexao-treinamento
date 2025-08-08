"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, MapPin, Users, Clock, Trophy, UserPlus, UserMinus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)

  // Mock event data
  const eventData = {
    id: 1,
    name: "Corrida no Parque",
    type: "Corrida",
    date: "2024-08-15",
    time: "07:00",
    location: "Parque Ibirapuera",
    maxParticipants: 30,
    currentParticipants: 18,
    status: "Aberto",
    description: "Corrida matinal de 5km no parque para todos os níveis. Venha participar desta atividade ao ar livre e conhecer outros alunos da academia!",
    requirements: [
      "Tênis adequado para corrida",
      "Roupa confortável",
      "Garrafa de água",
      "Protetor solar"
    ],
    meetingPoint: "Portão 2 do Parque Ibirapuera",
    instructor: "Prof. Carlos Santos",
    participants: [
      { id: 1, name: "Maria Silva", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-20" },
      { id: 2, name: "João Santos", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-18" },
      { id: 3, name: "Ana Costa", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-15" },
      { id: 4, name: "Carlos Lima", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-22" },
      { id: 5, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-19" }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Lotado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Cancelado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleEnrollment = () => {
    setIsEnrolled(!isEnrolled)
    setIsEnrollDialogOpen(false)
    // Mock enrollment logic
    console.log(isEnrolled ? "Unenrolling from event" : "Enrolling in event")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{eventData.name}</h1>
            <p className="text-muted-foreground">
              {formatDate(eventData.date)} • {eventData.time}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Informações do Evento
              </CardTitle>
              <Badge className={getStatusColor(eventData.status)}>
                {eventData.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(eventData.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{eventData.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{eventData.currentParticipants}/{eventData.maxParticipants} participantes</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">{eventData.description}</p>
                <p className="text-sm font-medium mb-2">Ponto de Encontro:</p>
                <p className="text-sm text-muted-foreground">{eventData.meetingPoint}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Instrutor:</p>
                <p className="text-sm text-muted-foreground">{eventData.instructor}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(eventData.currentParticipants / eventData.maxParticipants) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((eventData.currentParticipants / eventData.maxParticipants) * 100)}% de ocupação
                </p>
              </div>

              <div className="pt-4 border-t">
                <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className={`w-full ${isEnrolled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      disabled={eventData.status === "Lotado" && !isEnrolled}
                    >
                      {isEnrolled ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Cancelar Inscrição
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {eventData.status === "Lotado" ? "Lotado" : "Inscrever-se"}
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {isEnrolled ? "Cancelar Inscrição" : "Confirmar Inscrição"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEnrolled 
                          ? `Tem certeza que deseja cancelar sua inscrição no evento "${eventData.name}"?`
                          : `Confirme sua inscrição no evento "${eventData.name}".`
                        }
                      </DialogDescription>
                    </DialogHeader>
                    {!isEnrolled && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium mb-2">Requisitos:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {eventData.requirements.map((req, idx) => (
                              <li key={idx}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleEnrollment}
                        className={isEnrolled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {isEnrolled ? "Confirmar Cancelamento" : "Confirmar Inscrição"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes ({eventData.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Inscrito em {new Date(participant.enrolledAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {eventData.participants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum participante inscrito ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
