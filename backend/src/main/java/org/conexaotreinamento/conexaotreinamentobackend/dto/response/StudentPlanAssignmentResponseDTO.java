package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record StudentPlanAssignmentResponseDTO(
        UUID id,
        UUID studentId,
        String studentName,
        UUID planId,
        String planName,
        Integer planMaxDays,
        Integer planDurationDays,
        Integer durationDays,
        LocalDate startDate,
        UUID assignedByUserId,
        String assignedByUserEmail,
        String assignmentNotes,
        Instant createdAt,
        boolean active,
        boolean expired,
        boolean expiringSoon,
        long daysRemaining
) {}
