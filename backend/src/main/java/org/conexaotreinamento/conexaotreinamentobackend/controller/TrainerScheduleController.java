package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.TrainerScheduleMapper;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
 * REST controller for managing trainer schedules.
 */
@RestController
@RequestMapping("/trainer-schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Trainer Schedules", description = "Trainer schedule management endpoints")
public class TrainerScheduleController {
    
    private final TrainerScheduleService trainerScheduleService;
    private final TrainerScheduleMapper scheduleMapper;
    
    @GetMapping
    @Operation(summary = "List all schedules", description = "Retrieves all active trainer schedules")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schedules retrieved successfully")
    })
    public ResponseEntity<List<TrainerScheduleResponseDTO>> getAllSchedules() {
        log.debug("Fetching all active trainer schedules");
        List<TrainerSchedule> schedules = trainerScheduleService.getAllActiveSchedules();
        List<TrainerScheduleResponseDTO> response = schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
        log.debug("Retrieved {} schedules", response.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/trainer/{trainerId}")
    @Operation(summary = "Get trainer schedules", description = "Retrieves all schedules for a specific trainer")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schedules retrieved successfully")
    })
    public ResponseEntity<List<TrainerScheduleResponseDTO>> getSchedulesByTrainer(
            @PathVariable @Parameter(description = "Trainer ID") UUID trainerId) {
        
        log.debug("Fetching schedules for trainer [ID: {}]", trainerId);
        List<TrainerSchedule> schedules = trainerScheduleService.getSchedulesByTrainer(trainerId);
        List<TrainerScheduleResponseDTO> response = schedules.stream()
                .map(scheduleMapper::toResponse)
                .toList();
        log.debug("Retrieved {} schedules for trainer", response.size());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get schedule by ID", description = "Retrieves a specific trainer schedule")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schedule found"),
        @ApiResponse(responseCode = "404", description = "Schedule not found")
    })
    public ResponseEntity<TrainerScheduleResponseDTO> getScheduleById(
            @PathVariable @Parameter(description = "Schedule ID") UUID id) {
        
        log.debug("Finding schedule by ID: {}", id);
        return trainerScheduleService.getScheduleById(id)
                .map(schedule -> ResponseEntity.ok(scheduleMapper.toResponse(schedule)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create schedule", description = "Creates a new trainer schedule")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Schedule created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TrainerScheduleResponseDTO> createSchedule(
            @Valid @RequestBody @Parameter(description = "Schedule creation request") TrainerScheduleRequestDTO request) {
        
        log.info("Creating trainer schedule for trainer [ID: {}]", request.trainerId());
        TrainerSchedule schedule = scheduleMapper.toEntity(request);
        TrainerSchedule created = trainerScheduleService.createSchedule(schedule);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        
        log.info("Schedule created successfully [ID: {}]", created.getId());
        return ResponseEntity.created(location).body(scheduleMapper.toResponse(created));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update schedule", description = "Updates an existing trainer schedule")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schedule updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Schedule not found")
    })
    public ResponseEntity<TrainerScheduleResponseDTO> updateSchedule(
            @PathVariable @Parameter(description = "Schedule ID") UUID id,
            @Valid @RequestBody @Parameter(description = "Schedule update request") TrainerScheduleRequestDTO request) {
        
        log.info("Updating trainer schedule [ID: {}]", id);
        try {
            TrainerSchedule updatedSchedule = scheduleMapper.toEntity(request);
            TrainerSchedule result = trainerScheduleService.updateSchedule(id, updatedSchedule);
            log.info("Schedule updated successfully [ID: {}]", id);
            return ResponseEntity.ok(scheduleMapper.toResponse(result));
        } catch (RuntimeException e) {
            log.warn("Schedule not found for update [ID: {}]", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete schedule", description = "Soft deletes a trainer schedule")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Schedule deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Schedule not found")
    })
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable @Parameter(description = "Schedule ID") UUID id) {
        
        log.info("Deleting trainer schedule [ID: {}]", id);
        trainerScheduleService.deleteSchedule(id);
        log.info("Schedule deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }
}
