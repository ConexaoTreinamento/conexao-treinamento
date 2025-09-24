package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentPlanService {
    
    private final StudentPlanRepository studentPlanRepository;
    private final StudentPlanAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public StudentPlanResponseDTO createPlan(StudentPlanRequestDTO requestDTO) {
        // Check if plan with same name already exists
        if (studentPlanRepository.existsByNameAndActiveTrue(requestDTO.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Plan with name '" + requestDTO.getName() + "' already exists");
        }
        
        StudentPlan plan = new StudentPlan();
        // let JPA generate the id (do not assign UUID manually to avoid merge/detached-entity issues)
        plan.setName(requestDTO.getName());
        plan.setMaxDays(requestDTO.getMaxDays());
        plan.setDurationDays(requestDTO.getDurationDays());
        plan.setDescription(requestDTO.getDescription());
        // Map cost from request — required by DB (not-null)
        plan.setCostBrl(requestDTO.getCostBrl());
        plan.setActive(true);
        
        StudentPlan savedPlan = studentPlanRepository.save(plan);
        return mapToResponseDTO(savedPlan);
    }
    
    @Transactional
    public void deletePlan(UUID planId) {
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(planId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Plan not found or inactive"));
        
        // Check if plan is currently assigned to any students
        boolean hasActiveAssignments = assignmentRepository.findAllCurrentlyActive()
            .stream()
            .anyMatch(assignment -> assignment.getPlanId().equals(planId));
        
        if (hasActiveAssignments) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Cannot delete plan that is currently assigned to students");
        }
        
        plan.softDelete();
        studentPlanRepository.save(plan);
    }
    
    public List<StudentPlanResponseDTO> getAllActivePlans() {
        return studentPlanRepository.findByActiveTrueOrderByNameAsc()
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }
    
    /**
     * Return all plans. This is used when caller requests inactive (soft-deleted) plans as well.
     */
    public List<StudentPlanResponseDTO> getAllPlans() {
        return studentPlanRepository.findAll()
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }
    
    public StudentPlanResponseDTO getPlanById(UUID planId) {
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(planId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Plan not found or inactive"));
        
        return mapToResponseDTO(plan);
    }
    
    /**
     * Restore (reactivate) a soft-deleted plan.
     */
    @Transactional
    public void restorePlan(UUID planId) {
        StudentPlan plan = studentPlanRepository.findById(planId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));
        
        if (plan.isActive()) {
            // already active — no-op
            return;
        }
        
        plan.setActive(true);
        studentPlanRepository.save(plan);
    }
    
    @Transactional
    public StudentPlanAssignmentResponseDTO assignPlanToStudent(UUID studentId, 
                                                               AssignPlanRequestDTO requestDTO, 
                                                               UUID assignedByUserId) {
        
        // Validate student exists
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        // Validate plan exists and is active
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(requestDTO.getPlanId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Plan not found or inactive"));
        
        // Validate assigning user exists
        User assigningUser = userRepository.findById(assignedByUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigning user not found"));
        
        Instant effectiveFrom = requestDTO.getEffectiveFromTimestamp();
        Instant effectiveTo = effectiveFrom.plusSeconds(ChronoUnit.DAYS.getDuration().getSeconds() * plan.getDurationDays());
        
        // Check for overlapping assignments
        List<StudentPlanAssignment> overlapping = assignmentRepository.findOverlappingAssignments(
            studentId, effectiveFrom, effectiveTo);
        
        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Student already has an overlapping plan assignment for this period");
        }
        
        // Create new assignment
        StudentPlanAssignment assignment = new StudentPlanAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setStudentId(studentId);
        assignment.setPlanId(requestDTO.getPlanId());
        assignment.setEffectiveFromTimestamp(effectiveFrom);
        assignment.setEffectiveToTimestamp(effectiveTo);
        assignment.setAssignedByUserId(assignedByUserId);
        assignment.setAssignmentNotes(requestDTO.getAssignmentNotes());
        
        StudentPlanAssignment savedAssignment = assignmentRepository.save(assignment);
        return mapToAssignmentResponseDTO(savedAssignment, student, plan, assigningUser);
    }
    
    public List<StudentPlanAssignmentResponseDTO> getStudentPlanHistory(UUID studentId) {
        // Validate student exists
        studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        return assignmentRepository.findByStudentIdOrderByEffectiveFromTimestampDesc(studentId)
            .stream()
            .map(this::mapToAssignmentResponseDTO)
            .toList();
    }
    
    public StudentPlanAssignmentResponseDTO getCurrentStudentPlan(UUID studentId) {
        // Validate student exists
        studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        List<StudentPlanAssignment> current = assignmentRepository.findCurrentActiveAssignment(studentId);
        if (current.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "No active plan found for student");
        }
        return mapToAssignmentResponseDTO(current.get(0));
    }
    
    public List<StudentPlanAssignmentResponseDTO> getExpiringSoonAssignments(int days) {
        Instant futureInstant = Instant.now().plusSeconds(ChronoUnit.DAYS.getDuration().getSeconds() * days);
        return assignmentRepository.findExpiringSoon(futureInstant)
            .stream()
            .map(this::mapAssignmentWithEntities)
            .toList();
    }
    
    public List<StudentPlanAssignmentResponseDTO> getAllCurrentlyActiveAssignments() {
        return assignmentRepository.findAllCurrentlyActive()
            .stream()
            .map(this::mapAssignmentWithEntities)
            .toList();
    }
    
    // Mapping methods
    private StudentPlanResponseDTO mapToResponseDTO(StudentPlan plan) {
        StudentPlanResponseDTO dto = new StudentPlanResponseDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setMaxDays(plan.getMaxDays());
        dto.setDurationDays(plan.getDurationDays());
        dto.setDescription(plan.getDescription());
        dto.setActive(plan.isActive());
        dto.setCreatedAt(plan.getCreatedAt());
        return dto;
    }
    
    private StudentPlanAssignmentResponseDTO mapToAssignmentResponseDTO(StudentPlanAssignment assignment) {
        return mapToAssignmentResponseDTO(assignment, null, null, null);
    }
    
    private StudentPlanAssignmentResponseDTO mapToAssignmentResponseDTO(StudentPlanAssignment assignment,
                                                                       Student student,
                                                                       StudentPlan plan,
                                                                       User assigningUser) {
        StudentPlanAssignmentResponseDTO dto = new StudentPlanAssignmentResponseDTO();
        dto.setId(assignment.getId());
        dto.setStudentId(assignment.getStudentId());
        dto.setPlanId(assignment.getPlanId());
        dto.setEffectiveFromTimestamp(assignment.getEffectiveFromTimestamp());
        dto.setEffectiveToTimestamp(assignment.getEffectiveToTimestamp());
        dto.setAssignedByUserId(assignment.getAssignedByUserId());
        dto.setAssignmentNotes(assignment.getAssignmentNotes());
        dto.setCreatedAt(assignment.getCreatedAt());
        
        // Set convenience fields if entities are loaded
        if (student != null) {
            dto.setStudentName(student.getName() + " " + student.getSurname());
        }
        if (plan != null) {
            dto.setPlanName(plan.getName());
            dto.setPlanMaxDays(plan.getMaxDays());
            dto.setPlanDurationDays(plan.getDurationDays()); 
        }
        if (assigningUser != null) {
            dto.setAssignedByUserEmail(assigningUser.getEmail());
        }
        
        // Set computed fields
        dto.setActive(assignment.isActive());
        dto.setExpired(assignment.isExpired());
        dto.setExpiringSoon(assignment.isExpiringSoon(7));
        
        // Calculate days remaining (from today to effectiveTo when active) — use zone-aware LocalDate for correctness
        if (assignment.isActive()) {
            if (assignment.getEffectiveToTimestamp() == null) {
                // No explicit end -> treat as 0 remaining (or could use a sentinel)
                dto.setDaysRemaining(0);
            } else {
                LocalDate today = Instant.now().atZone(ZoneId.systemDefault()).toLocalDate();
                LocalDate endDate = assignment.getEffectiveToTimestamp().atZone(ZoneId.systemDefault()).toLocalDate();
                long daysBetween = ChronoUnit.DAYS.between(today, endDate);
                // Include the end date as a remaining day when endDate >= today
                int daysRemaining = (int) Math.max(0, daysBetween + 1);
                dto.setDaysRemaining(daysRemaining);
            }
        } else {
            dto.setDaysRemaining(0);
        }
        
        return dto;
    }

    private StudentPlanAssignmentResponseDTO mapAssignmentWithEntities(StudentPlanAssignment assignment) {
        // Attempt to load related entities to enrich the response
        Student student = null;
        StudentPlan plan = null;
        User assigningUser = null;
        try {
            if (assignment.getStudentId() != null) {
                student = studentRepository.findById(assignment.getStudentId()).orElse(null);
            }
            if (assignment.getPlanId() != null) {
                plan = studentPlanRepository.findById(assignment.getPlanId()).orElse(null);
            }
            if (assignment.getAssignedByUserId() != null) {
                assigningUser = userRepository.findById(assignment.getAssignedByUserId()).orElse(null);
            }
        } catch (Exception ignored) {
            // fall back to minimal mapping on any error
        }
        return mapToAssignmentResponseDTO(assignment, student, plan, assigningUser);
    }
}
