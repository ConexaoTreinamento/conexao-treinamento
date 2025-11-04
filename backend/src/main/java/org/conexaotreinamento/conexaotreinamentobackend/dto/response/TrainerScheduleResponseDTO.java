package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

public record TrainerScheduleResponseDTO(
        UUID id,
        UUID trainerId,
        Integer weekday,
        LocalTime startTime,
        Integer intervalDuration,
        String seriesName,
        Instant effectiveFromTimestamp,
        Instant createdAt,
        Instant updatedAt,
        boolean active
) {
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
