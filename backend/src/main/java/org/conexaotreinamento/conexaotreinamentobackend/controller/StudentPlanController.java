package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/plans")
public class StudentPlanController {
    
    @Autowired
    private StudentPlanService studentPlanService;
    @Autowired
    private UserService userService;

    // Plan management endpoints
    @GetMapping
    public ResponseEntity<List<StudentPlanResponseDTO>> getAllPlans(
            @RequestParam(name = "status", defaultValue = "active") String status) {
        List<StudentPlanResponseDTO> plans = studentPlanService.getPlansByStatus(status);
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

    @PostMapping("/{planId}/restore")
    public ResponseEntity<StudentPlanResponseDTO> restorePlan(@PathVariable UUID planId) {
        StudentPlanResponseDTO restored = studentPlanService.restorePlan(planId);
        return ResponseEntity.ok(restored);
    }
    
    // Student plan assignment endpoints
    @PostMapping("/students/{studentId}/assign")
    public ResponseEntity<StudentPlanAssignmentResponseDTO> assignPlanToStudent(
            @PathVariable UUID studentId, 
            @Valid @RequestBody AssignPlanRequestDTO requestDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication != null ? authentication.getName() : null;
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<UserResponseDTO> userByEmail = userService.getUserByEmail(userEmail);
        if (userByEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID assignedByUserId = userByEmail.get().id();

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
