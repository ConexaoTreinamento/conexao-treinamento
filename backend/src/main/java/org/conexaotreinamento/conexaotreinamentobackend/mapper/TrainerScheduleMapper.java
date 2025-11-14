package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between TrainerSchedule entities and DTOs.
 */
@Component
public class TrainerScheduleMapper {

    /**
     * Maps TrainerSchedule entity to TrainerScheduleResponseDTO.
     */
    public TrainerScheduleResponseDTO toResponse(TrainerSchedule entity) {
        return new TrainerScheduleResponseDTO(
                entity.getId(),
                entity.getTrainerId(),
                entity.getWeekday(),
                entity.getStartTime(),
                entity.getIntervalDuration(),
                entity.getSeriesName(),
                entity.getEffectiveFromTimestamp(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isActive()
        );
    }

    /**
     * Maps TrainerScheduleRequestDTO to a new TrainerSchedule entity.
     */
    public TrainerSchedule toEntity(TrainerScheduleRequestDTO request) {
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setTrainerId(request.trainerId());
        schedule.setWeekday(request.weekday());
        schedule.setStartTime(request.startTime());
        schedule.setIntervalDuration(request.intervalDuration());
        schedule.setSeriesName(request.seriesName());
        return schedule;
    }

    /**
     * Updates an existing TrainerSchedule entity with data from TrainerScheduleRequestDTO.
     */
    public void updateEntity(TrainerScheduleRequestDTO request, TrainerSchedule entity) {
        entity.setTrainerId(request.trainerId());
        entity.setWeekday(request.weekday());
        entity.setStartTime(request.startTime());
        entity.setIntervalDuration(request.intervalDuration());
        entity.setSeriesName(request.seriesName());
    }
}

