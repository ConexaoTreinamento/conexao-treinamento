"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, Trophy, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const events = [
    {
      id: 1,
      name: "Corrida no Parque",
      type: "Corrida",
      date: "2024-08-15",
      time: "07:00",
      location: "Parque Ibirapuera",
      maxParticipants: 30,
      currentParticipants: 18,
      status: "Aberto",
      description: "Corrida matinal de 5km no parque",
      participants: [
        { name: "Maria Silva", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "João Santos", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Ana Costa", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 2,
      name: "Aula de Yoga na Praça",
      type: "Yoga",
      date: "2024-08-20",
      time: "18:00",
      location: "Praça da República",
      maxParticipants: 25,
      currentParticipants: 25,
      status: "Lotado",
      description: "Sessão de yoga ao ar livre",
      participants: [
        { name: "Carlos Lima", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Lucia Ferreira", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 3,
      name: "Subida do Pico do Jaraguá",
      type: "Trilha",
      date: "2024-08-25",
      time: "06:00",
      location: "Pico do Jaraguá",
      maxParticipants: 15,
      currentParticipants: 8,
      status: "Aberto",
      description: "Trilha até o ponto mais alto de São Paulo",
      participants: [
        { name: "Patricia Oliveira", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 4,
      name: "Torneio de CrossFit",
      type: "Competição",
      date: "2024-09-01",
      time: "09:00",
      location: "Academia FitManager",
      maxParticipants: 20,
      currentParticipants: 12,
      status: "Aberto",
      description: "Competição interna de CrossFit",
      participants: []
    }
  ]

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getTypeColor = (type: string) => {
    const colors = {
      "Corrida": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Yoga": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Trilha": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Competição": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">
              Gerencie eventos e atividades especiais
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  {event.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {event.currentParticipants}/{event.maxParticipants} participantes
                    </span>
                  </div>
                </div>

                {/* Participants Preview */}
                {event.participants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Participantes:</p>
                    <div className="flex -space-x-2">
                      {event.participants.slice(0, 5).map((participant, idx) => (
                        <Avatar key={idx} className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {event.participants.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">+{event.participants.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ocupação</span>
                    <span>{Math.round((event.currentParticipants / event.maxParticipants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => router.push(`/events/${event.id}`)}>
                    Ver Detalhes
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    size="sm"
                    disabled={event.status === "Lotado"}
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    {event.status === "Lotado" ? "Lotado" : "Inscrever"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou crie um novo evento.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos Abertos</p>
                  <p className="text-2xl font-bold">
                    {events.filter(e => e.status === "Aberto").length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                  <p className="text-2xl font-bold">
                    {events.reduce((sum, event) => sum + event.currentParticipants, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (events.reduce((sum, event) => sum + event.currentParticipants, 0) /
                       events.reduce((sum, event) => sum + event.maxParticipants, 0)) * 100
                    )}%
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
