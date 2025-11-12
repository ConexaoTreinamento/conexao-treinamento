package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AssignPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentPlanRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanAssignmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentPlanResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentPlanService;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for managing student plans and their assignments.
 */
@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Student Plans", description = "Student plan management and assignments")
public class StudentPlanController {
    
    private final StudentPlanService studentPlanService;
    private final UserService userService;

    // Plan management endpoints
    @GetMapping
    @Operation(summary = "List plans", description = "Retrieves all student plans filtered by status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plans retrieved successfully")
    })
    public ResponseEntity<List<StudentPlanResponseDTO>> getAllPlans(
            @RequestParam(name = "status", defaultValue = "active")
            @Parameter(description = "Status filter (active, inactive, all)") 
            String status) {
        
        log.debug("Fetching plans with status: {}", status);
        List<StudentPlanResponseDTO> plans = studentPlanService.getPlansByStatus(status);
        log.debug("Retrieved {} plans", plans.size());
        return ResponseEntity.ok(plans);
    }
    
    @GetMapping("/{planId}")
    @Operation(summary = "Get plan by ID", description = "Retrieves a specific student plan")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plan found"),
        @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentPlanResponseDTO> getPlanById(
            @PathVariable @Parameter(description = "Plan ID") UUID planId) {
        
        log.debug("Finding plan by ID: {}", planId);
        StudentPlanResponseDTO plan = studentPlanService.getPlanById(planId);
        return ResponseEntity.ok(plan);
    }
    
    @PostMapping
    @Operation(summary = "Create plan", description = "Creates a new student plan")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Plan created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Plan name already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentPlanResponseDTO> createPlan(
            @Valid @RequestBody @Parameter(description = "Plan creation request") StudentPlanRequestDTO requestDTO) {
        
        log.info("Creating plan: {}", requestDTO.name());
        StudentPlanResponseDTO createdPlan = studentPlanService.createPlan(requestDTO);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdPlan.id())
                .toUri();
        
        log.info("Plan created successfully [ID: {}]", createdPlan.id());
        return ResponseEntity.created(location).body(createdPlan);
    }
    
    @DeleteMapping("/{planId}")
    @Operation(summary = "Delete plan", description = "Soft deletes a student plan")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Plan deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deletePlan(
            @PathVariable @Parameter(description = "Plan ID") UUID planId) {
        
        log.info("Deleting plan [ID: {}]", planId);
        studentPlanService.deletePlan(planId);
        log.info("Plan deleted successfully [ID: {}]", planId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{planId}/restore")
    @Operation(summary = "Restore plan", description = "Restores a soft-deleted student plan")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Plan restored successfully"),
        @ApiResponse(responseCode = "404", description = "Plan not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Plan already active", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentPlanResponseDTO> restorePlan(
            @PathVariable @Parameter(description = "Plan ID") UUID planId) {
        
        log.info("Restoring plan [ID: {}]", planId);
        StudentPlanResponseDTO restored = studentPlanService.restorePlan(planId);
        log.info("Plan restored successfully [ID: {}]", planId);
        return ResponseEntity.ok(restored);
    }
    
    // Student plan assignment endpoints
    @PostMapping("/students/{studentId}/assign")
    @Operation(summary = "Assign plan to student", description = "Assigns a plan to a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Plan assigned successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Student or plan not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Overlapping plan assignment", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentPlanAssignmentResponseDTO> assignPlanToStudent(
            @PathVariable @Parameter(description = "Student ID") UUID studentId, 
            @Valid @RequestBody @Parameter(description = "Plan assignment request") AssignPlanRequestDTO requestDTO) {
        
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

        log.info("Assigning plan to student [ID: {}]", studentId);
        StudentPlanAssignmentResponseDTO assignedPlan = studentPlanService.assignPlanToStudent(
                studentId, requestDTO, assignedByUserId);
        log.info("Plan assigned successfully to student [ID: {}]", studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignedPlan);
    }
    
    @GetMapping("/students/{studentId}/history")
    @Operation(summary = "Get student plan history", description = "Retrieves all plan assignments for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "History retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getStudentPlanHistory(
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.debug("Finding plan history for student [ID: {}]", studentId);
        List<StudentPlanAssignmentResponseDTO> history = studentPlanService.getStudentPlanHistory(studentId);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/students/{studentId}/current")
    @Operation(summary = "Get current student plan", description = "Retrieves the current active plan for a student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Current plan retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Student or plan not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentPlanAssignmentResponseDTO> getCurrentStudentPlan(
            @PathVariable @Parameter(description = "Student ID") UUID studentId) {
        
        log.debug("Finding current plan for student [ID: {}]", studentId);
        StudentPlanAssignmentResponseDTO currentPlan = studentPlanService.getCurrentStudentPlan(studentId);
        return ResponseEntity.ok(currentPlan);
    }
    
    // Utility endpoints
    @GetMapping("/assignments/expiring-soon")
    @Operation(summary = "Get expiring assignments", description = "Retrieves plan assignments expiring soon")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully")
    })
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getExpiringSoonAssignments(
            @RequestParam(defaultValue = "7") 
            @Parameter(description = "Number of days to look ahead") 
            int days) {
        
        log.debug("Finding assignments expiring within {} days", days);
        List<StudentPlanAssignmentResponseDTO> expiring = studentPlanService.getExpiringSoonAssignments(days);
        return ResponseEntity.ok(expiring);
    }
    
    @GetMapping("/assignments/active")
    @Operation(summary = "Get active assignments", description = "Retrieves all currently active plan assignments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Assignments retrieved successfully")
    })
    public ResponseEntity<List<StudentPlanAssignmentResponseDTO>> getAllActiveAssignments() {
        log.debug("Finding all active assignments");
        List<StudentPlanAssignmentResponseDTO> active = studentPlanService.getAllCurrentlyActiveAssignments();
        return ResponseEntity.ok(active);
    }
}
