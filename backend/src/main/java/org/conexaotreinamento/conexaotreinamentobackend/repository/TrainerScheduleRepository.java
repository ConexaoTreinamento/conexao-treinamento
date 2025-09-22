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
    
    @Query("SELECT ts FROM TrainerSchedule ts WHERE ts.weekday = :weekday AND ts.effectiveFromTimestamp <= :timestamp AND (ts.effectiveToTimestamp IS NULL OR ts.effectiveToTimestamp > :timestamp) AND ts.active = :active")
    List<TrainerSchedule> findByWeekdayAndEffectiveFromTimestampBeforeAndActive(
        @Param("weekday") int weekday,
        @Param("timestamp") Instant timestamp,
        @Param("active") boolean active
    );
}
