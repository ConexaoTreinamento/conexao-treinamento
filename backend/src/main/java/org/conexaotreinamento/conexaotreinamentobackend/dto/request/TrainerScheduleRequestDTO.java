package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalTime;
import java.util.UUID;

public record TrainerScheduleRequestDTO(
        @NotNull(message = "Trainer ID is required")
        UUID trainerId,

        @NotNull(message = "Weekday is required")
        @Min(value = 0, message = "Weekday must be between 0 (Sunday) and 6 (Saturday)")
        @Max(value = 6, message = "Weekday must be between 0 (Sunday) and 6 (Saturday)")
        Integer weekday,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @Min(value = 15, message = "Interval duration must be at least 15 minutes")
        Integer intervalDuration,

        @NotBlank(message = "Series name is required")
        @Pattern(regexp = "^(?!.*__).*$", message = "Series name cannot contain double underscore '__'")
        String seriesName
) {
    public TrainerScheduleRequestDTO {
        if (intervalDuration == null) {
            intervalDuration = 60;
        }
    }
}
