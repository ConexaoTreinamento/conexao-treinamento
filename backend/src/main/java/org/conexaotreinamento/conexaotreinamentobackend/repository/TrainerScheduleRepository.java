package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerScheduleRepository extends JpaRepository<TrainerSchedule, UUID> {
    
    @EntityGraph(attributePaths = {"trainer"})
    @Query("SELECT ts FROM TrainerSchedule ts WHERE ts.weekday = :weekday AND ts.effectiveFromTimestamp <= :timestamp AND (ts.effectiveToTimestamp IS NULL OR ts.effectiveToTimestamp > :timestamp) AND ts.active = :active")
    List<TrainerSchedule> findByWeekdayAndEffectiveFromTimestampBeforeAndActive(
        @Param("weekday") int weekday,
        @Param("timestamp") Instant timestamp,
        @Param("active") boolean active
    );

    @EntityGraph(attributePaths = {"trainer"})
    @Query("SELECT ts FROM TrainerSchedule ts WHERE ts.trainerId = :trainerId AND ts.weekday IN :weekdays AND ts.effectiveFromTimestamp <= :now AND (ts.effectiveToTimestamp IS NULL OR ts.effectiveToTimestamp > :now) AND ts.active = true")
    List<TrainerSchedule> findActiveSeriesByTrainerAndWeekdaysAt(
        @Param("trainerId") UUID trainerId,
        @Param("weekdays") List<Integer> weekdays,
        @Param("now") Instant now
    );

    @EntityGraph(attributePaths = {"trainer"})
    @Query("SELECT ts FROM TrainerSchedule ts WHERE (:trainerId IS NULL OR ts.trainerId = :trainerId) AND ts.effectiveFromTimestamp <= :now AND (ts.effectiveToTimestamp IS NULL OR :now < ts.effectiveToTimestamp) AND ts.active = true")
    List<TrainerSchedule> findActiveSeriesAt(
        @Param("trainerId") UUID trainerId,
        @Param("now") Instant now
    );
}
