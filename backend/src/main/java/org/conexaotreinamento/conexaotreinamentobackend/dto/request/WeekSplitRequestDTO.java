package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeekSplitRequestDTO {
    @NotNull
    private UUID trainerId;

    private String seriesName; // optional, fallback to existing seriesName if needed

    private Integer intervalDuration; // optional, default to 60

    @NotNull
    private Instant newEffectiveFrom; // when the split takes effect

    @NotNull
    private List<DayConfig> days;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayConfig {
        @NotNull
        private Integer weekday; // 0..6
        @NotNull
        private Boolean active;  // true=enabled, false=disabled
        private LocalTime startTime; // required when active
        private LocalTime endTime;   // required when active
    }
}
