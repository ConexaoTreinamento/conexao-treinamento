package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.entity.*;
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
    
    private final List<TrainerSchedule> trainerSchedules = new ArrayList<>();
    private final Map<String, List<SessionParticipant>> sessionParticipants = new HashMap<>();
    private final Map<String, String> sessionNotes = new HashMap<>();
    
    public ScheduleService() {
        initializeMockData();
    }
    
    public List<ScheduledSession> getScheduledSessions(LocalDate startDate, LocalDate endDate) {
        List<ScheduledSession> sessions = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            
            // Find all trainer schedules for this day of week (convert to database format)
            int weekday = date.getDayOfWeek() == DayOfWeek.SUNDAY ? 0 : date.getDayOfWeek().getValue();
            List<TrainerSchedule> daySchedules = trainerSchedules.stream()
                .filter(schedule -> schedule.getWeekday() == weekday)
                .toList();
            
            // Create scheduled sessions for each schedule
            for (TrainerSchedule schedule : daySchedules) {
                String sessionId = generateSessionId(schedule, date);
                LocalDateTime startTime = LocalDateTime.of(date, schedule.getStartTime());
                LocalDateTime endTime = LocalDateTime.of(date, schedule.getEndTime());
                
                List<SessionParticipant> participants = sessionParticipants.getOrDefault(sessionId, new ArrayList<>());
                String notes = sessionNotes.get(sessionId);
                boolean hasOverrides = notes != null || !participants.isEmpty();
                
                ScheduledSession session = new ScheduledSession();
                session.setId(UUID.randomUUID());
                session.setSessionSeriesId(UUID.randomUUID()); // Would be from schedule series
                session.setSessionId(sessionId);
                session.setTrainerId(schedule.getTrainerId());
                session.setStartTime(startTime);
                session.setEndTime(endTime);
                session.setMaxParticipants(10); // Default value
                session.setSeriesName(schedule.getSeriesName());
                session.setNotes(notes);
                session.setInstanceOverride(hasOverrides);
                session.setEffectiveFromTimestamp(Instant.now());
                session.setParticipants(participants);
                
                sessions.add(session);
            }
        }
        
        return sessions.stream()
            .sorted(Comparator.comparing(ScheduledSession::getStartTime))
            .collect(Collectors.toList());
    }
    
    public void updateSessionParticipants(String sessionId, List<SessionParticipant> participants) {
        sessionParticipants.put(sessionId, participants);
    }
    
    public void updateSessionNotes(String sessionId, String notes) {
        sessionNotes.put(sessionId, notes);
    }
    
    private String generateSessionId(TrainerSchedule schedule, LocalDate date) {
        return String.format("%s-%s-%s", 
            schedule.getSeriesName().toLowerCase().replace(" ", "-"),
            date.toString(),
            schedule.getStartTime().toString()
        );
    }
    
    private void initializeMockData() {
        // Mock trainer IDs (you can replace with real trainer IDs from your database)
        UUID trainer1 = UUID.randomUUID();
        UUID trainer2 = UUID.randomUUID();
        UUID trainer3 = UUID.randomUUID();
        
        // Mock trainer schedules using the new entity structure
        TrainerSchedule yogaMonday = new TrainerSchedule();
        yogaMonday.setId(UUID.randomUUID());
        yogaMonday.setTrainerId(trainer1);
        yogaMonday.setWeekday(1); // Monday
        yogaMonday.setStartTime(LocalTime.of(9, 0));
        yogaMonday.setEndTime(LocalTime.of(10, 0));
        yogaMonday.setIntervalDuration(60);
        yogaMonday.setSeriesName("Yoga");
        yogaMonday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(yogaMonday);
        
        TrainerSchedule yogaWednesday = new TrainerSchedule();
        yogaWednesday.setId(UUID.randomUUID());
        yogaWednesday.setTrainerId(trainer1);
        yogaWednesday.setWeekday(3); // Wednesday
        yogaWednesday.setStartTime(LocalTime.of(9, 0));
        yogaWednesday.setEndTime(LocalTime.of(10, 0));
        yogaWednesday.setIntervalDuration(60);
        yogaWednesday.setSeriesName("Yoga");
        yogaWednesday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(yogaWednesday);
        
        TrainerSchedule yogaFriday = new TrainerSchedule();
        yogaFriday.setId(UUID.randomUUID());
        yogaFriday.setTrainerId(trainer1);
        yogaFriday.setWeekday(5); // Friday
        yogaFriday.setStartTime(LocalTime.of(9, 0));
        yogaFriday.setEndTime(LocalTime.of(10, 0));
        yogaFriday.setIntervalDuration(60);
        yogaFriday.setSeriesName("Yoga");
        yogaFriday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(yogaFriday);
        
        TrainerSchedule crossfitTuesday = new TrainerSchedule();
        crossfitTuesday.setId(UUID.randomUUID());
        crossfitTuesday.setTrainerId(trainer2);
        crossfitTuesday.setWeekday(2); // Tuesday
        crossfitTuesday.setStartTime(LocalTime.of(7, 0));
        crossfitTuesday.setEndTime(LocalTime.of(8, 0));
        crossfitTuesday.setIntervalDuration(60);
        crossfitTuesday.setSeriesName("CrossFit");
        crossfitTuesday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(crossfitTuesday);
        
        TrainerSchedule crossfitThursday = new TrainerSchedule();
        crossfitThursday.setId(UUID.randomUUID());
        crossfitThursday.setTrainerId(trainer2);
        crossfitThursday.setWeekday(4); // Thursday
        crossfitThursday.setStartTime(LocalTime.of(7, 0));
        crossfitThursday.setEndTime(LocalTime.of(8, 0));
        crossfitThursday.setIntervalDuration(60);
        crossfitThursday.setSeriesName("CrossFit");
        crossfitThursday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(crossfitThursday);
        
        TrainerSchedule pilatesMonday = new TrainerSchedule();
        pilatesMonday.setId(UUID.randomUUID());
        pilatesMonday.setTrainerId(trainer3);
        pilatesMonday.setWeekday(1); // Monday
        pilatesMonday.setStartTime(LocalTime.of(18, 0));
        pilatesMonday.setEndTime(LocalTime.of(19, 0));
        pilatesMonday.setIntervalDuration(60);
        pilatesMonday.setSeriesName("Pilates");
        pilatesMonday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(pilatesMonday);
        
        TrainerSchedule pilatesWednesday = new TrainerSchedule();
        pilatesWednesday.setId(UUID.randomUUID());
        pilatesWednesday.setTrainerId(trainer3);
        pilatesWednesday.setWeekday(3); // Wednesday
        pilatesWednesday.setStartTime(LocalTime.of(18, 0));
        pilatesWednesday.setEndTime(LocalTime.of(19, 0));
        pilatesWednesday.setIntervalDuration(60);
        pilatesWednesday.setSeriesName("Pilates");
        pilatesWednesday.setEffectiveFromTimestamp(Instant.now().minusSeconds(86400));
        trainerSchedules.add(pilatesWednesday);
        
        // Mock some session participants
        UUID student1 = UUID.randomUUID();
        UUID student2 = UUID.randomUUID();
        UUID exercise1 = UUID.randomUUID();
        UUID exercise2 = UUID.randomUUID();
        
        SessionParticipant participant1 = new SessionParticipant();
        participant1.setId(UUID.randomUUID());
        participant1.setStudentId(student1);
        participant1.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        participant1.setPresent(true);
        
        // Create mock exercises for participant1
        ParticipantExercise exercise1Progress = new ParticipantExercise();
        exercise1Progress.setId(UUID.randomUUID());
        exercise1Progress.setSessionParticipant(participant1);
        exercise1Progress.setExerciseId(exercise1);
        exercise1Progress.setSetsAssigned(3);
        exercise1Progress.setSetsCompleted(3);
        exercise1Progress.setRepsAssigned(10);
        exercise1Progress.setRepsCompleted(10);
        
        ParticipantExercise exercise2Progress = new ParticipantExercise();
        exercise2Progress.setId(UUID.randomUUID());
        exercise2Progress.setSessionParticipant(participant1);
        exercise2Progress.setExerciseId(exercise2);
        exercise2Progress.setSetsAssigned(2);
        exercise2Progress.setSetsCompleted(1);
        exercise2Progress.setRepsAssigned(15);
        exercise2Progress.setRepsCompleted(15);
        
        participant1.setExercises(Arrays.asList(exercise1Progress, exercise2Progress));
        
        SessionParticipant participant2 = new SessionParticipant();
        participant2.setId(UUID.randomUUID());
        participant2.setStudentId(student2);
        participant2.setParticipationType(SessionParticipant.ParticipationType.INCLUDED);
        participant2.setPresent(false);
        
        List<SessionParticipant> yogaParticipants = Arrays.asList(participant1, participant2);
        
        // Add participants to a specific yoga session (today's Monday session if it exists)
        LocalDate today = LocalDate.now();
        if (today.getDayOfWeek() == DayOfWeek.MONDAY) {
            String todayYogaSession = generateSessionId(yogaMonday, today);
            sessionParticipants.put(todayYogaSession, yogaParticipants);
            sessionNotes.put(todayYogaSession, "Focus on breathing techniques");
        }
    }
}
