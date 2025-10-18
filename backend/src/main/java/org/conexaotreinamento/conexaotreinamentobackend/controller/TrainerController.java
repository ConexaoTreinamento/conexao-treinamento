package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.ResetTrainerPasswordDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
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

@RestController
@RequestMapping("/trainers")
@RequiredArgsConstructor
public class TrainerController {
    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<ListTrainersDTO> createTrainerAndUser(@RequestBody @Valid CreateTrainerDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainerService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListTrainersDTO> findTrainerById(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @GetMapping("/userId/{id}")
    public ResponseEntity<ListTrainersDTO> findTrainerByUserId(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerService.findByUserId(id));
    }

    @GetMapping
    public ResponseEntity<List<ListTrainersDTO>> findAllTrainers() {
        return ResponseEntity.ok(trainerService.findAll());
    }


    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> updateTrainerAndUser(@PathVariable UUID id, @RequestBody @Valid CreateTrainerDTO request) {
        return ResponseEntity.ok(trainerService.put(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteTrainerUser(@PathVariable UUID id) {
        trainerService.delete(id);
        return ResponseEntity.noContent().build();
    }

        @PatchMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable UUID id,
            @RequestBody @Valid ResetTrainerPasswordDTO request
    ) {
        trainerService.resetPassword(id, request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
