package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans")
public class StudentPlanController {
    
    @Autowired
    private StudentPlanService studentPlanService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Plan management endpoints
    @GetMapping
    public ResponseEntity<List<StudentPlanResponseDTO>> getAllPlans(
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive) {
        List<StudentPlanResponseDTO> plans = includeInactive
                ? studentPlanService.getAllPlans()
                : studentPlanService.getAllActivePlans();
        return ResponseEntity.ok(plans);
    }
    
    @GetMapping("/{planId}")
    public ResponseEntity<StudentPlanResponseDTO> getPlanById(@PathVariable UUID planId) {
        StudentPlanResponseDTO plan = studentPlanService.getPlanById(planId);
        return ResponseEntity.ok(plan);
    }
    
    @PostMapping
    public ResponseEntity<StudentPlanResponseDTO> createPlan(@Valid @RequestBody StudentPlanRequestDTO requestDTO) {
        StudentPlanResponseDTO createdPlan = studentPlanService.createPlan(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
    }
    
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable UUID planId) {
        studentPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{planId}/restore")
    public ResponseEntity<Void> restorePlan(@PathVariable UUID planId) {
        studentPlanService.restorePlan(planId);
        return ResponseEntity.noContent().build();
    }
    
    // Student plan assignment endpoints
    @PostMapping("/students/{studentId}/assign")
    public ResponseEntity<StudentPlanAssignmentResponseDTO> assignPlanToStudent(
            @PathVariable UUID studentId, 
            @Valid @RequestBody AssignPlanRequestDTO requestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID assignedByUserId = null;
        
        if (authentication != null && authentication.isAuthenticated()) {
            String name = authentication.getName();
            // Common when not authenticated in Spring Security
            if (name != null && !"anonymousUser".equalsIgnoreCase(name)) {
                // Try to parse as UUID first
                try {
                    assignedByUserId = UUID.fromString(name);
                } catch (IllegalArgumentException ex) {
                    // Fallback: try to resolve by email/username
                    var userOpt = userRepository.findByEmailAndDeletedAtIsNull(name);
                    if (userOpt.isPresent()) {
                        assignedByUserId = userOpt.get().getId();
                    }
                }
            }
        }

        // Final fallback for dev/local flows without auth: use first active user if available
        if (assignedByUserId == null) {
            Pageable p = PageRequest.of(0, 1);
            var firstActive = userRepository.findAllByDeletedAtIsNull(p).stream().findFirst();
            if (firstActive.isPresent()) {
                assignedByUserId = firstActive.get().getId();
            } else {
                // No user available to attribute the assignment
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        StudentPlanAssignmentResponseDTO assignedPlan = studentPlanService.assignPlanToStudent(
            studentId, requestDTO, assignedByUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignedPlan);
    }
    
    @GetMapping("/students/{studentId}/history")
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getStudentPlanHistory(@PathVariable UUID studentId) {
        List<StudentPlanAssignmentResponseDTO> history = studentPlanService.getStudentPlanHistory(studentId);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/students/{studentId}/current")
    public ResponseEntity<StudentPlanAssignmentResponseDTO> getCurrentStudentPlan(@PathVariable UUID studentId) {
        StudentPlanAssignmentResponseDTO currentPlan = studentPlanService.getCurrentStudentPlan(studentId);
        return ResponseEntity.ok(currentPlan);
    }
    
    // Utility endpoints
    @GetMapping("/assignments/expiring-soon")
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getExpiringSoonAssignments(
            @RequestParam(defaultValue = "7") int days) {
        List<StudentPlanAssignmentResponseDTO> expiring = studentPlanService.getExpiringSoonAssignments(days);
        return ResponseEntity.ok(expiring);
    }
    
    @GetMapping("/assignments/active")
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getAllActiveAssignments() {
        List<StudentPlanAssignmentResponseDTO> active = studentPlanService.getAllCurrentlyActiveAssignments();
        return ResponseEntity.ok(active);
    }
}
