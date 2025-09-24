package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequestDTO {
    @NotNull
    private UUID studentId;

    @NotNull
    private List<EnrollmentSessionDTO> sessions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentSessionDTO {
        @NotNull
        private String sessionId; // human-readable session identifier (series-date-time)

        private UUID sessionSeriesId; // optional, null for one-off

        @NotNull
        private Instant startTime;

        @NotNull
        private Instant endTime;

        private UUID trainerId;

        private Integer maxParticipants;

        private String seriesName;
    }
}
