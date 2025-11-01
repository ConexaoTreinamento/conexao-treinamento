import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Search, UserPlus, Users, Check } from "lucide-react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";

const StudentToAdd = (props: {
  student: string,
  onAdd: (student: string) => void,
  isRecentlyAdded?: boolean,
  isAlreadyAdded?: boolean,
  disabled?: boolean
}) => {
  const [isAdded, setIsAdded] = useState(false)

  const handleClick = () => {
    if (props.disabled) return

    setIsAdded(true)
    props.onAdd(props.student)

    // Reset the visual feedback after a short delay
    setTimeout(() => {
      setIsAdded(false)
    }, 500)
  }

  return (
    <div
      key={props.student}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
        props.disabled 
          ? "opacity-50 cursor-not-allowed" 
          : isAdded 
            ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 cursor-pointer" 
            : "hover:bg-muted/50 cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
          {props.student
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate">
          {props.student}
        </span>
      </div>
      {isAdded && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <Check className="w-4 h-4" />
          <span>Adicionado!</span>
        </div>
      )}
    </div>
  )
}

interface AddStudentDialogProps {
  students: string[]
  onAddStudent: (student: string) => void
  excludeStudents?: string[]
  disabled?: boolean
}

export default function AddStudentDialog({
  students,
  onAddStudent,
  excludeStudents = [],
  disabled = false
}: AddStudentDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Filter students based on search and exclude lists
  const filteredStudents = students.filter(student =>
    student.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !excludeStudents.includes(student)
  )

  const handleAddStudent = (student: string) => {
    onAddStudent(student)
    // Don't close dialog automatically to allow adding multiple students
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={disabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {disabled ? "Limite Atingido" : "Adicionar Aluno"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Adicionar Aluno
          </DialogTitle>
          <DialogDescription>
            Selecione um aluno para adicionar ao evento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentToAdd
                  key={student}
                  student={student}
                  onAdd={handleAddStudent}
                  disabled={disabled}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm ? "Nenhum aluno encontrado" : "Todos os alunos já foram adicionados"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
