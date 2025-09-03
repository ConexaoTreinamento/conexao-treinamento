package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateTrainerDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ListTrainersDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/trainers")
@RequiredArgsConstructor
public class TrainerController {
    private final TrainerService trainerService;

    @PostMapping
    public ResponseEntity<TrainerResponseDTO> createTrainerAndUser(@RequestBody @Valid CreateTrainerDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainerService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListTrainersDTO> findTrainerById(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerService.findById(id));
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
}
