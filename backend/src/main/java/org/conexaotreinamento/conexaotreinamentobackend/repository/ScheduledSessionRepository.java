package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.ScheduledSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession, UUID> {
    
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.sessionSeriesId = :seriesId AND ss.startTime = :startTime AND ss.active = true")
    Optional<ScheduledSession> findBySessionSeriesIdAndStartTime(
        @Param("seriesId") UUID seriesId,
        @Param("startTime") LocalDateTime startTime
    );
    
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.sessionId = :sessionId AND ss.active = true")
    Optional<ScheduledSession> findBySessionId(@Param("sessionId") String sessionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.sessionId = :sessionId AND ss.active = true")
    Optional<ScheduledSession> findBySessionIdForUpdate(@Param("sessionId") String sessionId);
    
    @Query("SELECT ss FROM ScheduledSession ss WHERE ss.sessionSeriesId = :seriesId AND ss.startTime >= :startTime AND ss.startTime < :endTime AND ss.active = true ORDER BY ss.startTime")
    List<ScheduledSession> findOverridesBySeriesIdAndDateRange(
        @Param("seriesId") UUID seriesId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // Count distinct scheduled sessions where the student is a participant within the given time range
    @Query("SELECT COUNT(DISTINCT ss) FROM ScheduledSession ss JOIN ss.participants p WHERE p.studentId = :studentId AND ss.startTime >= :start AND ss.startTime < :end AND ss.active = true AND p.active = true")
    long countSessionsWithParticipantInRange(@Param("studentId") UUID studentId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);
    
    // Calculate trainer hours worked based on sessions with at least one present participant  
    @Query(value = "SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (ss.end_time - ss.start_time))/3600), 0) " +
                  "FROM scheduled_sessions ss " +
                  "WHERE ss.trainer_id = :trainerId " +
                  "AND ss.active = true " +
                  "AND EXISTS (SELECT 1 FROM session_participants sp WHERE sp.scheduled_session_id = ss.id AND sp.is_present = true AND sp.active = true)", 
           nativeQuery = true)
    Integer calculateTrainerHoursWorked(@Param("trainerId") UUID trainerId);
}
