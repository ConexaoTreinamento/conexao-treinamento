package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerPasswordResetRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.springframework.http.HttpStatus;
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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/trainers")
@RequiredArgsConstructor
@Slf4j
public class TrainerController {
    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<TrainerListItemResponseDTO> createTrainerAndUser(@RequestBody @Valid TrainerCreateRequestDTO request) {
        log.info("Creating new trainer - Name: {}, Email: {}", request.name(), request.email());
        TrainerListItemResponseDTO response = trainerService.create(request);
        log.info("Trainer created successfully [ID: {}] - Name: {}", response.id(), response.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerListItemResponseDTO> findTrainerById(@PathVariable UUID id) {
        log.debug("Fetching trainer by ID: {}", id);
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @GetMapping("/user-profile/{id}")
    public ResponseEntity<TrainerListItemResponseDTO> findTrainerByUserId(@PathVariable UUID id) {
        log.debug("Fetching trainer by user ID: {}", id);
        return ResponseEntity.ok(trainerService.findByUserId(id));
    }

    @GetMapping
    public ResponseEntity<List<TrainerListItemResponseDTO>> findAllTrainers() {
        log.debug("Fetching all trainers");
        List<TrainerListItemResponseDTO> response = trainerService.findAll();
        log.debug("Retrieved {} trainers", response.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> updateTrainerAndUser(@PathVariable UUID id, @RequestBody @Valid TrainerCreateRequestDTO request) {
        log.info("Updating trainer [ID: {}] - Name: {}", id, request.name());
        TrainerResponseDTO response = trainerService.put(id, request);
        log.info("Trainer updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteTrainerUser(@PathVariable UUID id) {
        log.info("Deleting trainer [ID: {}]", id);
        trainerService.delete(id);
        log.info("Trainer deleted successfully [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<TrainerListItemResponseDTO> restoreTrainer(@PathVariable UUID id) {
        log.info("Restoring trainer [ID: {}]", id);
        TrainerListItemResponseDTO response = trainerService.restore(id);
        log.info("Trainer restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @RequestBody @Valid TrainerPasswordResetRequestDTO request
    ) {
        log.info("Resetting password for trainer [ID: {}]", id);
        trainerService.resetPassword(id, request.newPassword());
        log.info("Password reset successfully for trainer [ID: {}]", id);
        return ResponseEntity.noContent().build();
    }
}
