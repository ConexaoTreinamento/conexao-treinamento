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
    public ResponseEntity<TrainerResponseDTO> create(@RequestBody @Valid CreateTrainerDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trainerService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListTrainersDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ListTrainersDTO>> findAll() {
        return ResponseEntity.ok(trainerService.findAll());
    }


    @PatchMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> patch(@PathVariable UUID id, @RequestBody @Valid CreateTrainerDTO request) {
        return ResponseEntity.ok(trainerService.patch(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trainerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
