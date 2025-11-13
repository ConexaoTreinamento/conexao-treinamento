package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TrainerScheduleService {
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    public List<TrainerSchedule> getAllActiveSchedules() {
        return trainerScheduleRepository.findByIsActiveTrue();
    }
    
    public List<TrainerSchedule> getSchedulesByTrainer(UUID trainerId) {
        return trainerScheduleRepository.findByTrainerIdAndIsActiveTrue(trainerId);
    }
    
    public Optional<TrainerSchedule> getScheduleById(UUID id) {
        return trainerScheduleRepository.findById(id);
    }
    
    public TrainerSchedule createSchedule(TrainerSchedule schedule) {
        TrainerSchedule freshSchedule = new TrainerSchedule();
        freshSchedule.setTrainerId(schedule.getTrainerId());
        freshSchedule.setWeekday(schedule.getWeekday());
        freshSchedule.setStartTime(schedule.getStartTime());
        freshSchedule.setIntervalDuration(schedule.getIntervalDuration());
        freshSchedule.setSeriesName(schedule.getSeriesName());
        freshSchedule.setEffectiveFromTimestamp(Instant.now());
        freshSchedule.setActive(true);
        freshSchedule.setDeletedAt(null);
        return trainerScheduleRepository.save(freshSchedule);
    }
    
    public TrainerSchedule updateSchedule(UUID id, TrainerSchedule updatedSchedule) {
        return trainerScheduleRepository.findById(id)
            .map(schedule -> {
                schedule.setWeekday(updatedSchedule.getWeekday());
                schedule.setStartTime(updatedSchedule.getStartTime());
                schedule.setIntervalDuration(updatedSchedule.getIntervalDuration());
                schedule.setSeriesName(updatedSchedule.getSeriesName());
                schedule.updateTimestamp();
                return trainerScheduleRepository.save(schedule);
            })
            .orElseThrow(() -> new RuntimeException("TrainerSchedule not found with id: " + id));
    }
    
    public void deleteSchedule(UUID id) {
        trainerScheduleRepository.findById(id)
            .ifPresent(schedule -> {
                schedule.softDelete();
                trainerScheduleRepository.save(schedule);
            });
    }
    
    // Temporal query: Get schedule active at specific time
    public Optional<TrainerSchedule> getScheduleAtTime(UUID trainerId, int weekday, Instant timestamp) {
        List<TrainerSchedule> schedules = trainerScheduleRepository
            .findByTrainerIdAndWeekdayAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                trainerId, weekday, timestamp);
        return schedules.isEmpty() ? Optional.empty() : Optional.of(schedules.get(0));
    }
    
    // Get all schedules for a specific weekday at specific time
    public List<TrainerSchedule> getSchedulesForWeekdayAtTime(int weekday, Instant timestamp) {
        return trainerScheduleRepository.findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, timestamp);
    }
}
