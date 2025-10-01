package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerScheduleResponseDTO {
    
    private UUID id;
    private UUID trainerId;
    private Integer weekday;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer intervalDuration;
    private String seriesName;
    private Instant effectiveFromTimestamp;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean active;
    
    // Helper method for weekday display
    public String getWeekdayName() {
        return switch (weekday) {
            case 0 -> "Sunday";
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            case 4 -> "Thursday";
            case 5 -> "Friday";
            case 6 -> "Saturday";
            default -> "Unknown";
        };
    }
}
