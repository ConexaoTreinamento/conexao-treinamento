package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
import org.conexaotreinamento.conexaotreinamentobackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {
    
    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;
    
    @Autowired
    private ScheduledSessionRepository scheduledSessionRepository;
    
    @Autowired
    private SessionParticipantRepository sessionParticipantRepository;
    
    public List<ScheduledSession> getScheduledSessions(LocalDate startDate, LocalDate endDate) {
        List<ScheduledSession> sessions = new ArrayList<>();
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // First, check for existing scheduled session instances
        List<ScheduledSession> existingSessions = scheduledSessionRepository
            .findByStartTimeBetweenAndActiveTrue(startDateTime, endDateTime);
        
        // Create a map to track which dates/schedules already have instances
        Set<String> existingSessionIds = existingSessions.stream()
            .map(ScheduledSession::getSessionId)
            .collect(Collectors.toSet());
        
        sessions.addAll(existingSessions);
        
        // Generate sessions from trainer schedules for dates that don't have instances
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            Instant dateInstant = date.atStartOfDay().toInstant(java.time.ZoneOffset.UTC);
            
            // Get all active schedules for this weekday
            List<TrainerSchedule> daySchedules = trainerScheduleRepository
                .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, dateInstant);
            
            for (TrainerSchedule schedule : daySchedules) {
                String sessionId = generateSessionId(schedule, date);
                
                // Only generate if no instance exists (lazy creation)
                if (!existingSessionIds.contains(sessionId)) {
                    ScheduledSession session = generateSessionFromSchedule(schedule, date);
                    sessions.add(session);
                }
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(ScheduledSession::getStartTime))
            .collect(Collectors.toList());
    }
    
    public void updateSessionParticipants(String sessionId, List<SessionParticipant> participants) {
        // Create or update scheduled session instance
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        
        // Clear existing participants
        List<SessionParticipant> existing = sessionParticipantRepository
            .findByScheduledSession_IdAndActiveTrue(session.getId());
        existing.forEach(p -> {
            p.softDelete();
            sessionParticipantRepository.save(p);
        });
        
        // Add new participants
        for (SessionParticipant participant : participants) {
            participant.setScheduledSession(session);
            sessionParticipantRepository.save(participant);
        }
        
        // Mark session as having overrides
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }
    
    public void updateSessionNotes(String sessionId, String notes) {
        ScheduledSession session = getOrCreateSessionInstance(sessionId);
        session.setNotes(notes);
        session.setInstanceOverride(true);
        scheduledSessionRepository.save(session);
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        return String.format("%s-%s-%s", 
            schedule.getSeriesName().toLowerCase().replace(" ", "-"),
            date.toString(),
            schedule.getStartTime().toString()
        );
    }
    
    private ScheduledSession generateSessionFromSchedule(TrainerSchedule schedule, LocalDate date) {
        ScheduledSession session = new ScheduledSession();
        session.setId(UUID.randomUUID());
        session.setSessionSeriesId(schedule.getId());
        session.setSessionId(generateSessionId(schedule, date));
        session.setTrainerId(schedule.getTrainerId());
        session.setStartTime(LocalDateTime.of(date, schedule.getStartTime()));
        session.setEndTime(LocalDateTime.of(date, schedule.getEndTime()));
        session.setMaxParticipants(10); // Default value
        session.setSeriesName(schedule.getSeriesName());
        session.setInstanceOverride(false); // Generated from schedule, no overrides
        session.setEffectiveFromTimestamp(Instant.now());
        return session;
    }
    
    private ScheduledSession getOrCreateSessionInstance(String sessionId) {
        return scheduledSessionRepository.findBySessionIdAndActiveTrue(sessionId)
            .orElseGet(() -> {
                // Parse sessionId to extract date and find the schedule
                String[] parts = sessionId.split("-");
                if (parts.length >= 4) {
                    try {
                        LocalDate date = LocalDate.parse(parts[1] + "-" + parts[2] + "-" + parts[3]);
                        LocalTime time = LocalTime.parse(parts[4]);
                        int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
                        
                        // Find the schedule that matches
                        List<TrainerSchedule> schedules = trainerScheduleRepository
                            .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, date.atStartOfDay().toInstant(java.time.ZoneOffset.UTC));
                        
                        for (TrainerSchedule schedule : schedules) {
                            if (schedule.getStartTime().equals(time) && generateSessionId(schedule, date).equals(sessionId)) {
                                ScheduledSession session = generateSessionFromSchedule(schedule, date);
                                return scheduledSessionRepository.save(session);
                            }
                        }
                    } catch (Exception e) {
                        // If parsing fails, create a basic session
                    }
                }
                throw new RuntimeException("Could not create session instance for sessionId: " + sessionId);
            });
    }
    
}
