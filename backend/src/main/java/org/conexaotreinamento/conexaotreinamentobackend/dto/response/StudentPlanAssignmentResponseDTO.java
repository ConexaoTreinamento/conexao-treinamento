package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import com.fasterxml.jackson.annotation.JsonGetter;
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
    private Boolean isActive;
    private Boolean isExpired;
    private Boolean isExpiringSoon; // Within 7 days
    private long daysRemaining;
    
    // Explicit getters to ensure proper JSON serialization
    @JsonGetter("isActive")
    public Boolean getIsActive() {
        return isActive;
    }
    
    @JsonGetter("isExpired")
    public Boolean getIsExpired() {
        return isExpired;
    }
    
    @JsonGetter("isExpiringSoon")
    public Boolean getIsExpiringSoon() {
        return isExpiringSoon;
    }
}
