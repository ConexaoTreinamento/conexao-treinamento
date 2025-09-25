package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/trainer-schedules")
public class TrainerScheduleController {
    
    @Autowired
    private TrainerScheduleService trainerScheduleService;
    
    @GetMapping
    public ResponseEntity<List<TrainerScheduleResponseDTO>> getAllSchedules() {
        List<TrainerSchedule> schedules = trainerScheduleService.getAllActiveSchedules();
        List<TrainerScheduleResponseDTO> response = schedules.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<TrainerScheduleResponseDTO>> getSchedulesByTrainer(@PathVariable UUID trainerId) {
        List<TrainerSchedule> schedules = trainerScheduleService.getSchedulesByTrainer(trainerId);
        List<TrainerScheduleResponseDTO> response = schedules.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TrainerScheduleResponseDTO> getScheduleById(@PathVariable UUID id) {
        return trainerScheduleService.getScheduleById(id)
            .map(schedule -> ResponseEntity.ok(convertToResponseDTO(schedule)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<TrainerScheduleResponseDTO> createSchedule(@Valid @RequestBody TrainerScheduleRequestDTO request) {
        TrainerSchedule schedule = convertToEntity(request);
        TrainerSchedule created = trainerScheduleService.createSchedule(schedule);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponseDTO(created));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TrainerScheduleResponseDTO> updateSchedule(
            @PathVariable UUID id, 
            @Valid @RequestBody TrainerScheduleRequestDTO request) {
        try {
            TrainerSchedule updatedSchedule = convertToEntity(request);
            TrainerSchedule result = trainerScheduleService.updateSchedule(id, updatedSchedule);
            return ResponseEntity.ok(convertToResponseDTO(result));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID id) {
        trainerScheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
    
    private TrainerSchedule convertToEntity(TrainerScheduleRequestDTO dto) {
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setTrainerId(dto.getTrainerId());
        schedule.setWeekday(dto.getWeekday());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setIntervalDuration(dto.getIntervalDuration());
        schedule.setSeriesName(dto.getSeriesName());
        return schedule;
    }
    
    private TrainerScheduleResponseDTO convertToResponseDTO(TrainerSchedule schedule) {
        TrainerScheduleResponseDTO dto = new TrainerScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setTrainerId(schedule.getTrainerId());
        dto.setWeekday(schedule.getWeekday());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setIntervalDuration(schedule.getIntervalDuration());
        dto.setSeriesName(schedule.getSeriesName());
        dto.setEffectiveFromTimestamp(schedule.getEffectiveFromTimestamp());
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        dto.setActive(schedule.isActive());
        return dto;
    }
}
