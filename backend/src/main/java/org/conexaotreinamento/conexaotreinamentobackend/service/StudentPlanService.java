package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlan;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentPlanAssignment;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentPlanMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanAssignmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentPlanRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing student plans and assignments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentPlanService {
    
    private final StudentPlanRepository studentPlanRepository;
    private final StudentPlanAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final StudentCommitmentService studentCommitmentService;
    private final StudentPlanMapper planMapper;
    
    /**
     * Creates a new student plan.
     * 
     * @param requestDTO Plan creation request
     * @return Created plan
     * @throws BusinessException if plan name already exists
     */
    public StudentPlanResponseDTO createPlan(StudentPlanRequestDTO requestDTO) {
        log.info("Creating student plan: {}", requestDTO.name());
        
        // Check if plan with same name already exists
        if (studentPlanRepository.existsByName(requestDTO.name())) {
            throw new BusinessException(
                    "Plan with name '" + requestDTO.name() + "' already exists",
                    "PLAN_NAME_EXISTS"
            );
        }
        
        StudentPlan plan = planMapper.toEntity(requestDTO);
        StudentPlan savedPlan = studentPlanRepository.save(plan);
        
        log.info("Student plan created successfully [ID: {}]", savedPlan.getId());
        return planMapper.toResponse(savedPlan);
    }
    
    /**
     * Soft deletes a student plan.
     * 
     * @param planId Plan ID
     * @throws ResourceNotFoundException if plan not found or inactive
     */
    public void deletePlan(UUID planId) {
        log.info("Deleting student plan [ID: {}]", planId);
        
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(planId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentPlan", planId));

        plan.softDelete();
        studentPlanRepository.save(plan);
        
        log.info("Student plan deleted successfully [ID: {}]", planId);
    }

    /**
     * Restores a soft-deleted student plan.
     * 
     * @param planId Plan ID
     * @return Restored plan
     * @throws ResourceNotFoundException if plan not found
     * @throws BusinessException if plan is already active
     */
    public StudentPlanResponseDTO restorePlan(UUID planId) {
        log.info("Restoring student plan [ID: {}]", planId);
        
        StudentPlan plan = studentPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentPlan", planId));

        if (plan.isActive()) {
            throw new BusinessException("Plan is already active", "PLAN_ALREADY_ACTIVE");
        }

        plan.restore();
        StudentPlan saved = studentPlanRepository.save(plan);
        
        log.info("Student plan restored successfully [ID: {}]", planId);
        return planMapper.toResponse(saved);
    }
    
    /**
     * Retrieves all active student plans.
     * 
     * @return List of active plans
     */
    @Transactional(readOnly = true)
    public List<StudentPlanResponseDTO> getAllActivePlans() {
        log.debug("Finding all active student plans");
        List<StudentPlanResponseDTO> plans = studentPlanRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(planMapper::toResponse)
                .toList();
        log.debug("Found {} active plans", plans.size());
        return plans;
    }

    /**
     * Retrieves student plans by status.
     * 
     * @param status Status filter ("active", "inactive", "all")
     * @return List of plans matching the status
     */
    @Transactional(readOnly = true)
    public List<StudentPlanResponseDTO> getPlansByStatus(String status) {
        String normalized = status == null ? "active" : status.trim().toLowerCase();
        log.debug("Finding student plans by status: {}", normalized);
        
        List<StudentPlan> plans;
        switch (normalized) {
            case "all":
                plans = studentPlanRepository.findAllByOrderByNameAsc();
                break;
            case "inactive":
                plans = studentPlanRepository.findByActiveFalseOrderByNameAsc();
                break;
            case "active":
            default:
                plans = studentPlanRepository.findByActiveTrueOrderByNameAsc();
        }
        
        log.debug("Found {} plans with status: {}", plans.size(), normalized);
        return plans.stream().map(planMapper::toResponse).toList();
    }
    
    /**
     * Retrieves a student plan by ID.
     * 
     * @param planId Plan ID
     * @return Student plan
     * @throws ResourceNotFoundException if plan not found or inactive
     */
    @Transactional(readOnly = true)
    public StudentPlanResponseDTO getPlanById(UUID planId) {
        log.debug("Finding student plan by ID: {}", planId);
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(planId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentPlan", planId));
        
        return planMapper.toResponse(plan);
    }
    
    /**
     * Assigns a student plan to a student.
     * 
     * @param studentId Student ID
     * @param requestDTO Assignment request
     * @param assignedByUserId ID of user making the assignment
     * @return Plan assignment details
     * @throws ResourceNotFoundException if student or plan not found
     * @throws BusinessException if assignment overlaps with existing active assignment
     */
    @Transactional
    public StudentPlanAssignmentResponseDTO assignPlanToStudent(UUID studentId, 
                                                               AssignPlanRequestDTO requestDTO, 
                                                               UUID assignedByUserId) {
        log.info("Assigning plan [ID: {}] to student [ID: {}]", requestDTO.planId(), studentId);
        
        // Validate student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        
        // Validate plan exists and is active
        StudentPlan plan = studentPlanRepository.findByIdAndActiveTrue(requestDTO.planId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentPlan", requestDTO.planId()));
        
        // Validate assigning user exists
//        User assigningUser = userRepository.findById(assignedByUserId)
//            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigning user not found"));
        
        LocalDate startDate = requestDTO.startDate();
        int durationDays = plan.getDurationDays();
        StudentPlanAssignment currentAssignment = null;
        StudentPlan oldPlan = null;

        Optional<StudentPlanAssignment> currentAssignmentOpt = assignmentRepository.findCurrentActiveAssignment(studentId);
        if (currentAssignmentOpt.isPresent()) {
            currentAssignment = currentAssignmentOpt.get();
            oldPlan = studentPlanRepository.findById(currentAssignment.getPlanId()).orElse(null);

            Long derivedBaseline = null;
            if (currentAssignment.getDurationDays() != null) {
                derivedBaseline = Long.valueOf(currentAssignment.getDurationDays());
            } else if (oldPlan != null) {
                derivedBaseline = Long.valueOf(oldPlan.getDurationDays());
            }

            if (derivedBaseline != null && derivedBaseline > 0) {
                long baselineDuration = derivedBaseline;
                LocalDate currentAssignmentEndExclusive = currentAssignment.getStartDate().plusDays(Math.max(0, baselineDuration));

                long daysConsumed = ChronoUnit.DAYS.between(currentAssignment.getStartDate(), startDate);
                if (daysConsumed < 0) {
                    daysConsumed = 0;
                }

                boolean overlaps = startDate.isBefore(currentAssignmentEndExclusive);
                long remainingDays = Math.max(0, baselineDuration - daysConsumed);
                if (overlaps && remainingDays > 0) {
                    durationDays = (int) remainingDays;
                }

                int consumed = (int) Math.min(baselineDuration, daysConsumed);
                currentAssignment.setDurationDays(Math.max(0, consumed));
                assignmentRepository.save(currentAssignment);
            }
        }

        LocalDate endExclusive = startDate.plusDays(Math.max(0, durationDays));

        List<StudentPlanAssignment> overlapping = assignmentRepository.findOverlappingAssignments(
            studentId, startDate, endExclusive);
        if (currentAssignment != null) {
            UUID currentAssignmentId = currentAssignment.getId();
            overlapping.removeIf(existing -> existing.getId().equals(currentAssignmentId));
        }
        if (!overlapping.isEmpty()) {
            throw new BusinessException(
                    "O aluno já possui um plano atribuído que se sobrepõe ao período indicado",
                    "OVERLAPPING_PLAN_ASSIGNMENT"
            );
        }

        StudentPlanAssignment assignment = new StudentPlanAssignment();
        assignment.setStudentId(studentId);
        assignment.setPlanId(requestDTO.planId());
        assignment.setStartDate(startDate);
        assignment.setDurationDays(durationDays);
        assignment.setAssignedByUserId(assignedByUserId);
        assignment.setAssignmentNotes(requestDTO.assignmentNotes());

        StudentPlanAssignment savedAssignment = assignmentRepository.save(assignment);

        // Ensure student's schedule respects the new plan limits
        studentCommitmentService.resetScheduleIfExceedsPlan(studentId, plan.getMaxDays());

        log.info("Plan assigned successfully to student [ID: {}] - Assignment [ID: {}]", 
                studentId, savedAssignment.getId());
        return planMapper.toAssignmentResponse(savedAssignment, student, plan, null);
    }
    
    /**
     * Retrieves plan assignment history for a student.
     * 
     * @param studentId Student ID
     * @return List of plan assignments (ordered by start date descending)
     * @throws ResourceNotFoundException if student not found
     */
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getStudentPlanHistory(UUID studentId) {
        log.debug("Finding plan history for student [ID: {}]", studentId);
        
        // Validate student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        
        List<StudentPlanAssignmentResponseDTO> history = assignmentRepository.findByStudentIdOrderByStartDateDesc(studentId)
                .stream()
                .map(planMapper::toAssignmentResponse)
                .toList();
        
        log.debug("Found {} plan assignments for student [ID: {}]", history.size(), studentId);
        return history;
    }
    
    /**
     * Retrieves the current active plan for a student.
     * 
     * @param studentId Student ID
     * @return Current active plan assignment
     * @throws ResourceNotFoundException if student not found or no active plan
     */
    @Transactional(readOnly = true)
    public StudentPlanAssignmentResponseDTO getCurrentStudentPlan(UUID studentId) {
        log.debug("Finding current plan for student [ID: {}]", studentId);
        
        // Validate student exists
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        
        return assignmentRepository.findCurrentActiveAssignment(studentId)
                .map(planMapper::toAssignmentResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active plan found for student with ID: " + studentId
                ));
    }
    
    /**
     * Helper method for internal service use.
     * Retrieves the current assignment for a student without validation.
     * 
     * @param studentId Student ID
     * @return Optional containing current assignment if exists
     */
    @Transactional(readOnly = true)
    public Optional<StudentPlanAssignment> getCurrentAssignment(UUID studentId) {
        return assignmentRepository.findCurrentActiveAssignment(studentId);
    }
    
    /**
     * Retrieves plan assignments expiring soon.
     * 
     * @param days Number of days to look ahead
     * @return List of assignments expiring within the specified days
     */
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getExpiringSoonAssignments(int days) {
        log.debug("Finding plan assignments expiring within {} days", days);
        LocalDate futureDate = LocalDate.now().plusDays(days);
        List<StudentPlanAssignmentResponseDTO> expiring = assignmentRepository.findExpiringSoon(futureDate)
                .stream()
                .map(planMapper::toAssignmentResponse)
                .toList();
        log.debug("Found {} expiring assignments", expiring.size());
        return expiring;
    }
    
    /**
     * Retrieves all currently active plan assignments.
     * 
     * @return List of all active assignments
     */
    @Transactional(readOnly = true)
    public List<StudentPlanAssignmentResponseDTO> getAllCurrentlyActiveAssignments() {
        log.debug("Finding all currently active plan assignments");
        List<StudentPlanAssignmentResponseDTO> active = assignmentRepository.findAllCurrentlyActive()
                .stream()
                .map(planMapper::toAssignmentResponse)
                .toList();
        log.debug("Found {} active assignments", active.size());
        return active;
    }
}
