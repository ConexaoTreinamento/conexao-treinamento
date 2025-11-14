package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between StudentPlan entities and DTOs.
 */
@Component
public class StudentPlanMapper {

    /**
     * Maps StudentPlan entity to StudentPlanResponseDTO.
     */
    public StudentPlanResponseDTO toResponse(StudentPlan entity) {
        return new StudentPlanResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getMaxDays(),
                entity.getDurationDays(),
                entity.getDescription(),
                entity.isActive(),
                entity.getCreatedAt()
        );
    }

    /**
     * Maps StudentPlanRequestDTO to a new StudentPlan entity.
     */
    public StudentPlan toEntity(StudentPlanRequestDTO request) {
        StudentPlan plan = new StudentPlan();
        plan.setName(request.name());
        plan.setMaxDays(request.maxDays());
        plan.setDurationDays(request.durationDays());
        plan.setDescription(request.description());
        plan.setActive(true);
        return plan;
    }

    /**
     * Maps StudentPlanAssignment to StudentPlanAssignmentResponseDTO.
     */
    public StudentPlanAssignmentResponseDTO toAssignmentResponse(StudentPlanAssignment assignment,
                                                                  Student student,
                                                                  StudentPlan plan,
                                                                  User assigningUser) {
        String studentName = null;
        if (student != null) {
            studentName = student.getName() + " " + student.getSurname();
        }

        String planName = null;
        Integer planMaxDays = null;
        Integer planDurationDays = null;
        if (plan != null) {
            planName = plan.getName();
            planMaxDays = plan.getMaxDays();
            planDurationDays = plan.getDurationDays();
        }

        String assignedByUserEmail = assigningUser != null ? assigningUser.getEmail() : null;

        long daysRemaining = assignment.isActive()
                ? ChronoUnit.DAYS.between(LocalDate.now(), assignment.getEndDateExclusive())
                : 0;

        return new StudentPlanAssignmentResponseDTO(
                assignment.getId(),
                assignment.getStudentId(),
                studentName,
                assignment.getPlanId(),
                planName,
                planMaxDays,
                planDurationDays,
                assignment.getDurationDays(),
                assignment.getStartDate(),
                assignment.getAssignedByUserId(),
                assignedByUserEmail,
                assignment.getAssignmentNotes(),
                assignment.getCreatedAt(),
                assignment.isActive(),
                assignment.isExpired(),
                assignment.isExpiringSoon(7),
                daysRemaining
        );
    }

    /**
     * Maps StudentPlanAssignment to StudentPlanAssignmentResponseDTO 
     * (fetches related entities from assignment).
     */
    public StudentPlanAssignmentResponseDTO toAssignmentResponse(StudentPlanAssignment assignment) {
        return toAssignmentResponse(
                assignment,
                assignment.getStudent(),
                assignment.getPlan(),
                assignment.getAssignedByUser()
        );
    }
}

