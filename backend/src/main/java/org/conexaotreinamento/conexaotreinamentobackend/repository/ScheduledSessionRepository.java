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

    /*
    * Generate trainer performance reports with database-level aggregation.
    * Includes BOTH scheduled sessions AND events.
    * ONLY counts materialized sessions (sessions with at least one participant).
    * Returns Object[] that needs to be mapped to TrainerReportDTO in the service.
    * 
    * PostgreSQL arrays are returned as String[] and need conversion to List<String>.
    */
   @Query(value = """
       WITH materialized_sessions AS (
           -- Only sessions that have at least one participant and have already ended
           SELECT DISTINCT
               ss.id,
               ss.trainer_id,
               ss.start_time,
               ss.end_time
           FROM scheduled_sessions ss
           INNER JOIN session_participants sp ON ss.id = sp.scheduled_session_id
           WHERE ss.start_time >= :startDate 
               AND ss.end_time <= :endDate 
               AND ss.end_time <= NOW()
               AND ss.active = true
               AND ss.deleted_at IS NULL
               AND ss.canceled = false
               AND sp.participation_type = 'INCLUDED'
               AND sp.active = true
               AND sp.deleted_at IS NULL
       ),
       materialized_events AS (
           -- Only events that have at least one participant and have already ended
           SELECT DISTINCT
               e.event_id as id,
               e.trainer_id,
               (e.event_date + e.start_time)::timestamp as start_time,
               (e.event_date + e.end_time)::timestamp as end_time
           FROM events e
           INNER JOIN event_participants ep ON e.event_id = ep.event_id
           WHERE (e.event_date + e.start_time)::timestamp >= :startDate
               AND (e.event_date + e.end_time)::timestamp <= :endDate
               AND (e.event_date + e.end_time)::timestamp <= NOW()
               AND e.deleted_at IS NULL
               AND e.start_time IS NOT NULL
               AND e.end_time IS NOT NULL
       ),
       combined_activities AS (
           SELECT * FROM materialized_sessions
           UNION ALL
           SELECT * FROM materialized_events
       ),
       activity_participants AS (
           -- Session participants (only from materialized sessions)
           SELECT 
               ms.trainer_id,
               sp.student_id
           FROM materialized_sessions ms
           INNER JOIN session_participants sp ON ms.id = sp.scheduled_session_id
           WHERE sp.participation_type = 'INCLUDED'
               AND sp.active = true
               AND sp.deleted_at IS NULL
           
           UNION
           
           -- Event participants (only from materialized events)
           SELECT 
               me.trainer_id,
               ep.student_id
           FROM materialized_events me
           INNER JOIN event_participants ep ON me.id = ep.event_id
       )
       SELECT 
           t.id,
           t.name,
           COALESCE(ROUND(CAST(SUM(EXTRACT(EPOCH FROM (ca.end_time - ca.start_time)) / 3600.0) AS numeric), 2), 0.0) as hours_worked,
           COALESCE(CAST(COUNT(DISTINCT ca.id) AS integer), 0) as total_activities,
           COALESCE(CAST(COUNT(DISTINCT ap.student_id) AS integer), 0) as unique_students,
           t.compensation_type,
           t.specialties
       FROM trainers t
       LEFT JOIN combined_activities ca ON t.id = ca.trainer_id
       LEFT JOIN activity_participants ap ON t.id = ap.trainer_id
       WHERE (:trainerId IS NULL OR t.id = CAST(:trainerId AS uuid))
       GROUP BY t.id, t.name, t.compensation_type, t.specialties
       ORDER BY t.name
       """, nativeQuery = true)
   List<Object[]> findTrainerReportsRaw(
       @Param("startDate") LocalDateTime startDate,
       @Param("endDate") LocalDateTime endDate,
       @Param("trainerId") UUID trainerId);
}