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

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentPlanService {
    
    private final StudentPlanRepository studentPlanRepository;
    private final StudentPlanAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentCommitmentService studentCommitmentService;
    
    @Transactional
    public StudentPlanResponseDTO createPlan(StudentPlanRequestDTO requestDTO) {
        // Check if plan with same name already exists
        if (studentPlanRepository.existsByNameAndActiveTrue(requestDTO.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Plan with name '" + requestDTO.getName() + "' already exists");
        }
        
    StudentPlan plan = new StudentPlan(); // Leave id null so @GeneratedValue treats as new
        plan.setName(requestDTO.getName());
        plan.setMaxDays(requestDTO.getMaxDays());
        plan.setDurationDays(requestDTO.getDurationDays());
        plan.setDescription(requestDTO.getDescription());
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
    
    @Transactional(readOnly = true)
    public List<StudentPlanResponseDTO> getAllActivePlans() {
        return studentPlanRepository.findByActiveTrueOrderByNameAsc()
            .stream()
            .map(this::mapToResponseDTO)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public StudentPlanResponseDTO getPlanById(UUID planId) {
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(planId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Plan not found or inactive"));
        
        return mapToResponseDTO(plan);
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
//        User assigningUser = userRepository.findById(assignedByUserId)
//            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigning user not found"));
        
        LocalDate startDate = requestDTO.getStartDate();
        int durationDays = plan.getDurationDays();
        StudentPlanAssignment currentAssignment = null;
        StudentPlan oldPlan = null;

        Optional<StudentPlanAssignment> currentAssignmentOpt = assignmentRepository.findCurrentActiveAssignment(studentId);
        if (currentAssignmentOpt.isPresent()) {
            currentAssignment = currentAssignmentOpt.get();
            oldPlan = studentPlanRepository.findById(currentAssignment.getPlanId()).orElse(null);

            long baselineDuration = currentAssignment.getDurationDays() != null
                ? currentAssignment.getDurationDays()
                : (oldPlan != null ? oldPlan.getDurationDays() : plan.getDurationDays());

            long daysConsumed = ChronoUnit.DAYS.between(currentAssignment.getStartDate(), startDate);
            if (daysConsumed < 0) {
                daysConsumed = 0;
            }
            long remainingDays = Math.max(0, baselineDuration - daysConsumed);
            if (remainingDays > 0) {
                durationDays = (int) remainingDays;
            }

            int consumed = (int) Math.min(baselineDuration, daysConsumed);
            currentAssignment.setDurationDays(Math.max(0, consumed));
            assignmentRepository.save(currentAssignment);
        }

        LocalDate endExclusive = startDate.plusDays(Math.max(0, durationDays));

        List<StudentPlanAssignment> overlapping = assignmentRepository.findOverlappingAssignments(
            studentId, startDate, endExclusive);
        if (currentAssignment != null) {
            UUID currentAssignmentId = currentAssignment.getId();
            overlapping.removeIf(existing -> existing.getId().equals(currentAssignmentId));
        }
        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "O aluno já possui um plano atribuído que se sobrepõe ao período indicado.");
        }

        StudentPlanAssignment assignment = new StudentPlanAssignment();
        assignment.setStudentId(studentId);
        assignment.setPlanId(requestDTO.getPlanId());
        assignment.setStartDate(startDate);
        assignment.setDurationDays(durationDays);
        assignment.setAssignedByUserId(assignedByUserId);
        assignment.setAssignmentNotes(requestDTO.getAssignmentNotes());

        StudentPlanAssignment savedAssignment = assignmentRepository.save(assignment);

        // Ensure student's schedule respects the new plan limits
        studentCommitmentService.resetScheduleIfExceedsPlan(studentId, plan.getMaxDays());

        return mapToAssignmentResponseDTO(savedAssignment, student, plan, null);
    }
    
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getStudentPlanHistory(UUID studentId) {
        // Validate student exists
        studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        return assignmentRepository.findByStudentIdOrderByStartDateDesc(studentId)
            .stream()
            .map(this::mapToAssignmentResponseDTO)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public StudentPlanAssignmentResponseDTO getCurrentStudentPlan(UUID studentId) {
        // Validate student exists
        studentRepository.findById(studentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        return assignmentRepository.findCurrentActiveAssignment(studentId)
            .map(this::mapToAssignmentResponseDTO)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "No active plan found for student"));
    }
    
    // Helper method for internal service use
    @Transactional(readOnly = true)
    public java.util.Optional<StudentPlanAssignment> getCurrentAssignment(UUID studentId) {
        return assignmentRepository.findCurrentActiveAssignment(studentId);
    }
    
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getExpiringSoonAssignments(int days) {
        LocalDate futureDate = LocalDate.now().plusDays(days);
        return assignmentRepository.findExpiringSoon(futureDate)
            .stream()
            .map(this::mapToAssignmentResponseDTO)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getAllCurrentlyActiveAssignments() {
        return assignmentRepository.findAllCurrentlyActive()
            .stream()
            .map(this::mapToAssignmentResponseDTO)
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
        return mapToAssignmentResponseDTO(assignment, assignment.getStudent(), assignment.getPlan(), assignment.getAssignedByUser());
    }
    
    private StudentPlanAssignmentResponseDTO mapToAssignmentResponseDTO(StudentPlanAssignment assignment,
                                                                       Student student,
                                                                       StudentPlan plan,
                                                                       User assigningUser) {
        StudentPlanAssignmentResponseDTO dto = new StudentPlanAssignmentResponseDTO();
        dto.setId(assignment.getId());
        dto.setStudentId(assignment.getStudentId());
        dto.setPlanId(assignment.getPlanId());
        dto.setStartDate(assignment.getStartDate());
    dto.setDurationDays(assignment.getDurationDays());
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
        
        // Calculate days remaining
        if (assignment.isActive()) {
            dto.setDaysRemaining(ChronoUnit.DAYS.between(LocalDate.now(), assignment.getEndDateExclusive()));
        } else {
            dto.setDaysRemaining(0);
        }
        
        return dto;
    }
}
