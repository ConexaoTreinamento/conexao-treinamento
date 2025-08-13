"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Calendar, Clock, MapPin, User } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function ClassSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [studentPlan, setStudentPlan] = useState({
    name: "Plano Mensal",
    daysPerWeek: 3,
    maxClasses: 12,
  })

  // Mock student data
  const student = {
    id: params.id,
    name: "Maria Silva",
    plan: "Mensal",
    daysPerWeek: 3,
  }

  // Mock weekly schedule with classes
  const weeklySchedule = [
    {
      day: "Segunda-feira",
      classes: [
        {
          id: "1",
          name: "Pilates Iniciante",
          time: "09:00",
          duration: 60,
          instructor: "Prof. Ana",
          room: "Sala 1",
          maxStudents: 10,
          currentStudents: 8,
          available: true,
        },
        {
          id: "2",
          name: "CrossFit",
          time: "18:00",
          duration: 60,
          instructor: "Prof. Roberto",
          room: "Sala 3",
          maxStudents: 8,
          currentStudents: 8,
          available: false,
        },
      ],
    },
    {
      day: "Terça-feira",
      classes: [
        {
          id: "3",
          name: "Yoga Avançado",
          time: "07:00",
          duration: 60,
          instructor: "Prof. Marina",
          room: "Sala 2",
          maxStudents: 12,
          currentStudents: 6,
          available: true,
        },
        {
          id: "4",
          name: "Musculação",
          time: "19:00",
          duration: 90,
          instructor: "Prof. Carlos",
          room: "Área de Musculação",
          maxStudents: 15,
          currentStudents: 12,
          available: true,
        },
      ],
    },
    {
      day: "Quarta-feira",
      classes: [
        {
          id: "5",
          name: "Pilates Avançado",
          time: "10:00",
          duration: 60,
          instructor: "Prof. Ana",
          room: "Sala 1",
          maxStudents: 8,
          currentStudents: 5,
          available: true,
        },
      ],
    },
    {
      day: "Quinta-feira",
      classes: [
        {
          id: "6",
          name: "Dança",
          time: "20:00",
          duration: 60,
          instructor: "Prof. Marina",
          room: "Sala 2",
          maxStudents: 15,
          currentStudents: 10,
          available: true,
        },
      ],
    },
    {
      day: "Sexta-feira",
      classes: [
        {
          id: "7",
          name: "CrossFit Iniciante",
          time: "17:00",
          duration: 60,
          instructor: "Prof. Roberto",
          room: "Sala 3",
          maxStudents: 10,
          currentStudents: 7,
          available: true,
        },
      ],
    },
    {
      day: "Sábado",
      classes: [
        {
          id: "8",
          name: "Yoga Relaxante",
          time: "09:00",
          duration: 90,
          instructor: "Prof. Marina",
          room: "Sala 2",
          maxStudents: 20,
          currentStudents: 15,
          available: true,
        },
      ],
    },
    {
      day: "Domingo",
      classes: [],
    },
  ]

  const getSelectedDays = () => {
    const selectedDays = new Set<string>()
    selectedClasses.forEach((classId) => {
      const daySchedule = weeklySchedule.find((day) => day.classes.some((cls) => cls.id === classId))
      if (daySchedule) {
        selectedDays.add(daySchedule.day)
      }
    })
    return Array.from(selectedDays)
  }

  const selectedDays = getSelectedDays()

  const canSelectClass = (classId: string) => {
    if (selectedClasses.includes(classId)) return true // Already selected

    const daySchedule = weeklySchedule.find((day) => day.classes.some((cls) => cls.id === classId))

    if (!daySchedule) return false

    // If this day is already selected, allow more classes from same day
    if (selectedDays.includes(daySchedule.day)) return true

    // If selecting this class would add a new day, check day limit
    return selectedDays.length < studentPlan.daysPerWeek
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) => {
      if (prev.includes(classId)) {
        return prev.filter((id) => id !== classId)
      } else if (canSelectClass(classId)) {
        return [...prev, classId]
      }
      return prev
    })
  }

  const handleDayToggle = (day: string) => {
    const dayClasses = weeklySchedule.find((d) => d.day === day)?.classes || []
    const availableClasses = dayClasses.filter((cls) => cls.available)

    if (selectedDays.includes(day)) {
      // Remove all classes from this day
      setSelectedClasses((prev) => prev.filter((classId) => !availableClasses.some((cls) => cls.id === classId)))
    } else if (selectedDays.length < studentPlan.daysPerWeek) {
      // Add all available classes from this day
      const newClassIds = availableClasses.map((cls) => cls.id)
      setSelectedClasses((prev) => [...prev, ...newClassIds])
    }
  }

  const handleSave = () => {
    console.log("Saving selected classes:", selectedClasses)
    console.log("Selected days:", selectedDays)
    router.back()
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Cronograma de Aulas</h1>
            <p className="text-sm text-muted-foreground">{student.name}</p>
          </div>
        </div>

        {/* Plan Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{studentPlan.name}</h3>
                <p className="text-sm text-muted-foreground">Selecione até {studentPlan.daysPerWeek} dias por semana</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {selectedDays.length}/{studentPlan.daysPerWeek} dias
                </Badge>
                <p className="text-xs text-muted-foreground">{selectedClasses.length} aulas selecionadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <div className="space-y-3">
          {weeklySchedule.map((daySchedule) => {
            const isDaySelected = selectedDays.includes(daySchedule.day)
            const canSelectDay = selectedDays.length < studentPlan.daysPerWeek || isDaySelected

            return (
              <Card key={daySchedule.day}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Checkbox
                        checked={isDaySelected}
                        onCheckedChange={() => handleDayToggle(daySchedule.day)}
                        disabled={daySchedule.classes.length === 0 || !canSelectDay}
                      />
                      <Calendar className="w-4 h-4" />
                      {daySchedule.day}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {daySchedule.classes.length} aulas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {daySchedule.classes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">Nenhuma aula disponível</p>
                    </div>
                  ) : (
                    daySchedule.classes.map((classItem) => {
                      const isClassSelected = selectedClasses.includes(classItem.id)
                      const canSelect = canSelectClass(classItem.id)

                      return (
                        <div
                          key={classItem.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            !classItem.available
                              ? "opacity-50 bg-muted/50"
                              : isClassSelected
                                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isClassSelected}
                              onCheckedChange={() => handleClassToggle(classItem.id)}
                              disabled={!classItem.available || (!isClassSelected && !canSelect)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{classItem.name}</h4>
                                <Badge
                                  className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents)} text-xs`}
                                >
                                  {classItem.currentStudents}/{classItem.maxStudents}
                                </Badge>
                                {!classItem.available && (
                                  <Badge variant="destructive" className="text-xs">
                                    Lotada
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {classItem.time} ({classItem.duration}min)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{classItem.instructor}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{classItem.room}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 flex-1"
            disabled={selectedClasses.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Cronograma
          </Button>
        </div>
      </div>
    </Layout>
  )
}
