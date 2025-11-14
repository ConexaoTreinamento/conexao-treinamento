package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchExerciseRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ExerciseResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ExerciseService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
 * REST Controller for managing Exercises.
 */
@RestController
@RequestMapping("/exercises")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Exercises", description = "Endpoints for managing exercises")
public class ExerciseController {
    
    private final ExerciseService exerciseService;

    @PostMapping
    @Operation(summary = "Create new exercise", description = "Creates a new exercise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Exercise created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Exercise name already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ExerciseResponseDTO> createExercise(
            @RequestBody @Valid ExerciseRequestDTO request) {
        
        log.info("Creating new exercise: {}", request.name());
        ExerciseResponseDTO response = exerciseService.create(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Exercise created successfully [ID: {}]", response.id());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exercise by ID", description = "Retrieves an exercise by its unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exercise found"),
        @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ExerciseResponseDTO> findExerciseById(
            @PathVariable @Parameter(description = "Exercise ID") UUID id) {
        
        log.debug("Fetching exercise by ID: {}", id);
        return ResponseEntity.ok(exerciseService.findById(id));
    }

    @GetMapping
    @Operation(summary = "List all exercises", description = "Retrieves a paginated list of exercises with optional search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exercises retrieved successfully")
    })
    public ResponseEntity<PageResponse<ExerciseResponseDTO>> findAllExercises(
            @RequestParam(required = false) 
            @Parameter(description = "Search term for name/description") 
            String search,
            
            @RequestParam(required = false, defaultValue = "false")
            @Parameter(description = "Include soft-deleted exercises") 
            boolean includeInactive,
            
            @PageableDefault(size = 20) 
            @Parameter(hidden = true) 
            Pageable pageable) {
        
        log.debug("Fetching all exercises - search: {}", search);
        PageResponse<ExerciseResponseDTO> response = exerciseService.findAll(search, pageable, includeInactive);
        log.debug("Retrieved {} exercises", response.totalElements());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update exercise", description = "Updates an existing exercise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exercise updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Exercise name already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ExerciseResponseDTO> updateExercise(
            @PathVariable @Parameter(description = "Exercise ID") UUID id,
            @RequestBody @Valid ExerciseRequestDTO request) {
        
        log.info("Updating exercise [ID: {}]", id);
        ExerciseResponseDTO response = exerciseService.update(id, request);
        log.info("Exercise updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partially update exercise", description = "Partially updates an exercise with only provided fields")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exercise patched successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Exercise name already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ExerciseResponseDTO> patchExercise(
            @PathVariable @Parameter(description = "Exercise ID") UUID id,
            @RequestBody @Valid PatchExerciseRequestDTO request) {
        
        log.info("Patching exercise [ID: {}]", id);
        ExerciseResponseDTO response = exerciseService.patch(id, request);
        log.info("Exercise patched successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete exercise", description = "Soft deletes an exercise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Exercise deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteExercise(
            @PathVariable @Parameter(description = "Exercise ID") UUID id) {
        
        log.info("Deleting exercise [ID: {}]", id);
        exerciseService.delete(id);
        log.info("Exercise deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore exercise", description = "Restores a soft-deleted exercise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Exercise restored successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot restore exercise", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ExerciseResponseDTO> restoreExercise(
            @PathVariable @Parameter(description = "Exercise ID") UUID id) {
        
        log.info("Restoring exercise [ID: {}]", id);
        ExerciseResponseDTO response = exerciseService.restore(id);
        log.info("Exercise restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }
}
