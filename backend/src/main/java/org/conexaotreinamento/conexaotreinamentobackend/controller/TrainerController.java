package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerPasswordResetRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
 * REST Controller for managing Trainers.
 */
@RestController
@RequestMapping("/trainers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Trainers", description = "Endpoints for managing trainers and their accounts")
public class TrainerController {
    
    private final TrainerService trainerService;

    @PostMapping
    @Operation(summary = "Create new trainer", description = "Creates a new trainer with an associated user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Trainer created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerListItemResponseDTO> createTrainerAndUser(
            @RequestBody @Valid TrainerCreateRequestDTO request) {
        
        log.info("Creating new trainer - Name: {}, Email: {}", request.name(), request.email());
        TrainerListItemResponseDTO response = trainerService.create(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Trainer created successfully [ID: {}] - Name: {}", response.id(), response.name());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get trainer by ID", description = "Retrieves a trainer by their unique identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainer found"),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerListItemResponseDTO> findTrainerById(
            @PathVariable @Parameter(description = "Trainer ID") UUID id) {
        
        log.debug("Fetching trainer by ID: {}", id);
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @GetMapping("/user-profile/{id}")
    @Operation(summary = "Get trainer by user ID", description = "Retrieves a trainer by their associated user ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainer found"),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerListItemResponseDTO> findTrainerByUserId(
            @PathVariable @Parameter(description = "User ID") UUID id) {
        
        log.debug("Fetching trainer by user ID: {}", id);
        return ResponseEntity.ok(trainerService.findByUserId(id));
    }

    @GetMapping
    @Operation(summary = "List all trainers", description = "Retrieves all active trainers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainers retrieved successfully")
    })
    public ResponseEntity<List<TrainerListItemResponseDTO>> findAllTrainers() {
        log.debug("Fetching all trainers");
        List<TrainerListItemResponseDTO> response = trainerService.findAll();
        log.debug("Retrieved {} trainers", response.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update trainer", description = "Updates an existing trainer and their user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainer updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerResponseDTO> updateTrainerAndUser(
            @PathVariable @Parameter(description = "Trainer ID") UUID id,
            @RequestBody @Valid TrainerCreateRequestDTO request) {
        
        log.info("Updating trainer [ID: {}] - Name: {}", id, request.name());
        TrainerResponseDTO response = trainerService.update(id, request);
        log.info("Trainer updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete trainer", description = "Soft deletes a trainer and their user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Trainer deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> softDeleteTrainerUser(
            @PathVariable @Parameter(description = "Trainer ID") UUID id) {
        
        log.info("Deleting trainer [ID: {}]", id);
        trainerService.delete(id);
        log.info("Trainer deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore trainer", description = "Restores a soft-deleted trainer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trainer restored successfully"),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerListItemResponseDTO> restoreTrainer(
            @PathVariable @Parameter(description = "Trainer ID") UUID id) {
        
        log.info("Restoring trainer [ID: {}]", id);
        TrainerListItemResponseDTO response = trainerService.restore(id);
        log.info("Trainer restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reset-password")
    @Operation(summary = "Reset trainer password", description = "Resets the password for a trainer's user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Trainer not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> resetPassword(
            @PathVariable @Parameter(description = "Trainer ID") UUID id,
            @RequestBody @Valid TrainerPasswordResetRequestDTO request) {
        
        log.info("Resetting password for trainer [ID: {}]", id);
        trainerService.resetPassword(id, request.newPassword());
        log.info("Password reset successfully for trainer [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }
}
