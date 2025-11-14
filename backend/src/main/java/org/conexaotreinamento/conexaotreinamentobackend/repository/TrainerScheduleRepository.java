package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerScheduleRepository extends JpaRepository<TrainerSchedule, UUID> {
    
    List<TrainerSchedule> findByActiveTrue();
    
    List<TrainerSchedule> findByTrainerIdAndActiveTrue(UUID trainerId);
    
    @Query("SELECT ts FROM TrainerSchedule ts WHERE ts.trainerId = :trainerId AND ts.weekday = :weekday AND ts.active = true AND ts.effectiveFromTimestamp <= :timestamp ORDER BY ts.effectiveFromTimestamp DESC")
    List<TrainerSchedule> findByTrainerIdAndWeekdayAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
        @Param("trainerId") UUID trainerId, 
        @Param("weekday") int weekday, 
        @Param("timestamp") Instant timestamp
    );
    
    @Query("SELECT ts FROM TrainerSchedule ts WHERE ts.weekday = :weekday AND ts.active = true AND ts.effectiveFromTimestamp <= :timestamp")
    List<TrainerSchedule> findByWeekdayAndEffectiveFromTimestampLessThanEqual(
        @Param("weekday") int weekday, 
        @Param("timestamp") Instant timestamp
    );
}
