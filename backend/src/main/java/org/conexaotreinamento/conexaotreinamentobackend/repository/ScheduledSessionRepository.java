package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.ScheduledSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession, UUID> {
    
    Optional<ScheduledSession> findBySessionIdAndActiveTrue(String sessionId);
    
    List<ScheduledSession> findBySessionSeriesIdAndActiveTrue(UUID sessionSeriesId);
    
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.startTime >= :startTime AND ss.endTime <= :endTime AND ss.active = true ORDER BY ss.startTime")
    List<ScheduledSession> findByStartTimeBetweenAndActiveTrue(
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.trainerId = :trainerId AND ss.startTime >= :startTime AND ss.endTime <= :endTime AND ss.active = true ORDER BY ss.startTime")
    List<ScheduledSession> findByTrainerIdAndStartTimeBetweenAndActiveTrue(
        @Param("trainerId") UUID trainerId,
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime
    );
}
