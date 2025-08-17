import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import {Search, UserPlus, Users } from "lucide-react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import {ChangeEventHandler, JSX, useState} from "react";

const StudentToAdd = (props: {student: string}) => (
    <div key={props.student} className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
                className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span
                                        className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                                      {props.student
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                    </span>
            </div>
            <div className="flex items-center space-x-2 flex-1 min-w-0">
                <label htmlFor={`edit-${props.student}`} className="text-sm cursor-pointer flex-1 truncate">
                    {props.student}
                </label>
            </div>
        </div>
    </div>
)

const AddStudentDialog = (props: {
    students: string[],
}) => {
    const [studentSearchTerm, setStudentSearchTerm] = useState("")
    const filteredAvailableStudents = props.students.filter((student) =>
        student.toLowerCase().includes(studentSearchTerm.toLowerCase())
    )

    return <Dialog>
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
                    {filteredAvailableStudents.map(student => <StudentToAdd key={student} student={student}/>)}
                    {props.students.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                            <p className="text-sm">Nenhum aluno encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </DialogContent>
    </Dialog>;
};

export default AddStudentDialog;