package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AgeDistributionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentCommitmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerReportResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final ScheduleService scheduleService;
    private final EventRepository eventRepository;
    private final TrainerRepository trainerRepository;
    private final StudentRepository studentRepository;

    public ReportsResponseDTO generateReports(LocalDateTime startDate, LocalDateTime endDate, UUID trainerId) {
        List<TrainerReportResponseDTO> trainerReports = generateTrainerReports(startDate, endDate, trainerId);
        List<AgeDistributionResponseDTO> ageDistribution = calculateAgeDistribution();
        return new ReportsResponseDTO(trainerReports, ageDistribution);
    }
    
    private List<TrainerReportResponseDTO> generateTrainerReports(LocalDateTime startDate, LocalDateTime endDate, UUID trainerId) {
        List<Trainer> trainers = resolveTrainers(trainerId);
        if (trainers.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, TrainerAggregate> aggregates = new LinkedHashMap<>();
        for (Trainer trainer : trainers) {
            aggregates.put(trainer.getId(), new TrainerAggregate(trainer));
        }

        List<SessionResponseDTO> sessions = scheduleService.getScheduledSessions(
                startDate.toLocalDate(),
                endDate.toLocalDate());

        for (SessionResponseDTO session : sessions) {
            if (session == null || session.trainerId() == null) {
                continue;
            }
            if (!aggregates.containsKey(session.trainerId())) {
                continue;
            }
            if (session.canceled()) {
                continue;
            }
            LocalDateTime sessionStart = session.startTime();
            LocalDateTime sessionEnd = session.endTime();
            if (sessionStart == null || sessionEnd == null) {
                continue;
            }
            if (sessionEnd.isBefore(startDate) || sessionStart.isAfter(endDate)) {
                continue;
            }

            List<StudentCommitmentResponseDTO> participants = session.students();
            if (participants == null) {
                continue;
            }
        List<StudentCommitmentResponseDTO> attending = participants.stream()
            .filter(p -> Boolean.TRUE.equals(p.present()))
            .collect(Collectors.toList());
            if (attending.isEmpty()) {
                continue;
            }

            aggregates.get(session.trainerId()).addSession(sessionStart, sessionEnd, attending);
        }

        List<Event> events = eventRepository.findActiveWithinDateRangeWithParticipants(
                startDate.toLocalDate(),
                endDate.toLocalDate());

        for (Event event : events) {
            if (event.getTrainer() == null || event.getTrainer().getId() == null) {
                continue;
            }
            if (!aggregates.containsKey(event.getTrainer().getId())) {
                continue;
            }

            LocalTime startTime = event.getStartTime() != null ? event.getStartTime() : LocalTime.MIN;
            LocalTime endTime = event.getEndTime() != null ? event.getEndTime() : startTime;
            LocalDateTime eventStart = LocalDateTime.of(event.getDate(), startTime);
            LocalDateTime eventEnd = LocalDateTime.of(event.getDate(), endTime);

            if (eventEnd.isBefore(startDate) || eventStart.isAfter(endDate)) {
                continue;
            }

            List<EventParticipant> participants = event.getParticipants();
            if (participants == null) {
                continue;
            }

            List<EventParticipant> presentParticipants = participants.stream()
                    .filter(ep -> Boolean.TRUE.equals(ep.getPresent()))
                    .collect(Collectors.toList());

            if (presentParticipants.isEmpty()) {
                continue;
            }

            aggregates.get(event.getTrainer().getId()).addEvent(eventStart, eventEnd, presentParticipants);
        }

        return aggregates.values().stream()
                .map(TrainerAggregate::toDto)
                .sorted((a, b) -> {
                    if (a.name() == null && b.name() == null) {
                        return 0;
                    }
                    if (a.name() == null) {
                        return 1;
                    }
                    if (b.name() == null) {
                        return -1;
                    }
                    return a.name().compareToIgnoreCase(b.name());
                })
                .collect(Collectors.toList());
    }
    
    private List<AgeDistributionResponseDTO> calculateAgeDistribution() {
        List<LocalDate> birthDates = studentRepository.findAllBirthDates();
        
        Map<String, Integer> ageGroups = new LinkedHashMap<>();
        ageGroups.put("18-25", 0);
        ageGroups.put("26-35", 0);
        ageGroups.put("36-45", 0);
        ageGroups.put("46+", 0);
        
        LocalDate today = LocalDate.now();
        for (LocalDate birthDate : birthDates) {
            int age = Period.between(birthDate, today).getYears();
            
            if (age >= 18 && age <= 25) {
                ageGroups.merge("18-25", 1, Integer::sum);
            } else if (age >= 26 && age <= 35) {
                ageGroups.merge("26-35", 1, Integer::sum);
            } else if (age >= 36 && age <= 45) {
                ageGroups.merge("36-45", 1, Integer::sum);
            } else if (age >= 46) {
                ageGroups.merge("46+", 1, Integer::sum);
            }
        }
        
        int totalStudents = birthDates.size();
        
        return ageGroups.entrySet().stream()
                .map(entry -> {
                    double percentage = totalStudents > 0 ? 
                            (entry.getValue() * 100.0 / totalStudents) : 0.0;
                    return new AgeDistributionResponseDTO(
                            entry.getKey(),
                            entry.getValue(),
                            Math.round(percentage * 100.0) / 100.0
                    );
                })
                .collect(Collectors.toList());
    }

    private List<Trainer> resolveTrainers(UUID trainerId) {
        if (trainerId == null) {
            return trainerRepository.findAll();
        }
        return trainerRepository.findById(trainerId)
                .map(List::of)
                .orElseGet(Collections::emptyList);
    }

    private static class TrainerAggregate {
        private final UUID trainerId;
        private final String name;
        private final CompensationType compensationType;
        private final List<String> specialties;
        private double totalHours = 0.0;
        private int totalActivities = 0;
        private final Set<UUID> uniqueStudents = new HashSet<>();

        private TrainerAggregate(Trainer trainer) {
            this.trainerId = trainer.getId();
            this.name = trainer.getName();
            this.compensationType = trainer.getCompensationType();
            this.specialties = trainer.getSpecialties() != null
                    ? new ArrayList<>(trainer.getSpecialties())
                    : new ArrayList<>();
        }

        void addSession(LocalDateTime start, LocalDateTime end, List<StudentCommitmentResponseDTO> participants) {
            double hours = calculateHours(start, end);
            if (hours <= 0) {
                return;
            }
            totalHours += hours;
            totalActivities += 1;
            participants.stream()
                    .map(StudentCommitmentResponseDTO::studentId)
                    .filter(Objects::nonNull)
                    .forEach(uniqueStudents::add);
        }

        void addEvent(LocalDateTime start, LocalDateTime end, List<EventParticipant> participants) {
            double hours = calculateHours(start, end);
            if (hours <= 0) {
                return;
            }
            totalHours += hours;
            totalActivities += 1;
            participants.stream()
                    .map(EventParticipant::getStudent)
                    .filter(Objects::nonNull)
                    .map(student -> student.getId())
                    .filter(Objects::nonNull)
                    .forEach(uniqueStudents::add);
        }

        TrainerReportResponseDTO toDto() {
            double roundedHours = Math.round(totalHours * 100.0) / 100.0;
            return new TrainerReportResponseDTO(
                    trainerId,
                    name,
                    roundedHours,
                    totalActivities,
                    uniqueStudents.size(),
                    compensationType,
                    Collections.unmodifiableList(new ArrayList<>(specialties))
            );
        }

        private double calculateHours(LocalDateTime start, LocalDateTime end) {
            if (start == null || end == null) {
                return 0.0;
            }
            long minutes = Duration.between(start, end).toMinutes();
            if (minutes <= 0) {
                return 0.0;
            }
            return minutes / 60.0;
        }
    }
}