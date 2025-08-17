import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import {Search, UserPlus, Users, Check } from "lucide-react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import {useState} from "react";

const StudentToAdd = (props: {student: string, onAdd: (student: string) => void, isRecentlyAdded?: boolean, isAlreadyAdded?: boolean}) => {
    const [isAdded, setIsAdded] = useState(false)

    const handleClick = () => {
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
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                isAdded 
                    ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700" 
                    : "hover:bg-muted/50"
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
                <span className="text-sm cursor-pointer truncate">
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

const AddStudentDialog = (props: {
    students: string[],
    onAddStudent: (student: string) => void,
    excludeStudents?: string[]
}) => {
    const [studentSearchTerm, setStudentSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

    // Filter out students that are already added, but keep recently added ones for visual feedback
    const availableStudents = props.students.filter(student =>
        !props.excludeStudents?.includes(student) || recentlyAdded.has(student)
    )

    const filteredAvailableStudents = availableStudents.filter((student) =>
        student.toLowerCase().includes(studentSearchTerm.toLowerCase())
    )

    const handleAddStudent = (student: string) => {
        if (recentlyAdded.has(student)) {
            return;
        }
        // Add to recently added set for visual feedback
        setRecentlyAdded(prev => new Set(prev).add(student))

        // Call the parent callback
        props.onAddStudent(student)

        // Remove from recently added after showing feedback
        setTimeout(() => {
            setRecentlyAdded(prev => {
                const newSet = new Set(prev)
                newSet.delete(student)
                return newSet
            })
        }, 500)

        setStudentSearchTerm("")
    }

    const isStudentRecentlyAdded = (student: string) => recentlyAdded.has(student)
    const isStudentAlreadyAdded = (student: string) => props.excludeStudents?.includes(student)

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button size="sm" variant="outline">
                <UserPlus className="w-4 h-4 mr-1"/>
                Adicionar
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Adicionar Participantes</DialogTitle>
                <DialogDescription>Busque e selecione alunos para adicionar ao evento</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                {/* Search Box */}
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                    <Input
                        placeholder="Buscar alunos..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Students List */}
                <div className="max-h-64 overflow-y-auto space-y-3">
                    {filteredAvailableStudents.map(student =>
                        <StudentToAdd
                            key={student}
                            student={student}
                            onAdd={handleAddStudent}
                            isRecentlyAdded={isStudentRecentlyAdded(student)}
                            isAlreadyAdded={isStudentAlreadyAdded(student)}
                        />
                    )}
                    {filteredAvailableStudents.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">
                                {availableStudents.length === 0
                                    ? "Todos os alunos já foram adicionados"
                                    : "Nenhum aluno encontrado"
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    </Dialog>;
};

export default AddStudentDialog;
