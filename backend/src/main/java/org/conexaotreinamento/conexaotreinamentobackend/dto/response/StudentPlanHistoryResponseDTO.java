package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanHistoryResponseDTO {
    private UUID id;
    private UUID studentId;
    private UUID planId;
    private String planName; // From joined StudentPlan
    private Integer maxDays; // From joined StudentPlan
    private Integer durationDays; // From joined StudentPlan
    private Instant effectiveFromTimestamp;
    private UUID assignedByUserId;
    private String assignedByUserName; // From joined User
}
