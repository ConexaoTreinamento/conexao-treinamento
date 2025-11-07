import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";

export interface ExerciseRecord {
  key: string;
  className: string;
  instructor: string;
  classDateLabel: string;
  exercises: Array<{
    id: string;
    name: string;
    detail: string;
  }>;
}

interface StudentExercisesTabProps {
  records: ExerciseRecord[];
  isLoading: boolean;
}

export function StudentExercisesTab({
  records,
  isLoading,
}: StudentExercisesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Exercícios Realizados</CardTitle>
        <CardDescription>Últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <p className="text-xs text-muted-foreground">
              Carregando exercícios...
            </p>
          )}
          {!isLoading && records.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Nenhum exercício encontrado
              </p>
            </div>
          )}
          {records.map((record) => (
            <div key={record.key} className="p-4 rounded-lg border bg-muted/50">
              <div className="mb-3">
                <h3 className="font-medium">
                  {record.className} - {record.instructor}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {record.classDateLabel}
                </p>
              </div>
              <div className="space-y-2">
                {record.exercises.map((exercise) => (
                  <div key={exercise.id} className="text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {exercise.name}
                      </span>
                      {exercise.detail && (
                        <p className="text-xs text-muted-foreground">
                          {exercise.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
