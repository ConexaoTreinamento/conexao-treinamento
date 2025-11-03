package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentPlanAssignmentResponseDTO {
    private UUID id;
    private UUID studentId;
    private String studentName; // For convenience
    private UUID planId;
    private String planName; // For convenience
    private Integer planMaxDays; // For convenience
    private Integer planDurationDays; // For convenience
    private Integer durationDays;
    private LocalDate startDate;
    private UUID assignedByUserId;
    private String assignedByUserEmail; // For convenience
    private String assignmentNotes;
    private Instant createdAt;
    
    // Computed fields
    private boolean isActive;
    private boolean isExpired;
    private boolean isExpiringSoon; // Within 7 days
    private long daysRemaining;
}
