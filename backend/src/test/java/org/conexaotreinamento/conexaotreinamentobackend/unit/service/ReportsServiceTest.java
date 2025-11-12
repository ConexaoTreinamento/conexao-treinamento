package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AgeDistributionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentCommitmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.ReportsService;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportsServiceTest {

    @Mock
    private ScheduleService scheduleService;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ReportsService reportsService;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UUID trainerId;

    @BeforeEach
    void setUp() {
        startDate = LocalDateTime.of(2025, 10, 1, 0, 0);
        endDate = LocalDateTime.of(2025, 10, 31, 23, 59);
        trainerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Aggregates sessions and events, including non-materialized schedule sessions")
    void shouldAggregateSessionsAndEventsIncludingNonMaterializedSessions() {
        Trainer trainer = createTrainer(trainerId, "Prof. Ana", CompensationType.HOURLY, List.of("Pilates"));

        SessionResponseDTO sessionWithParticipants = buildSession(
                trainerId,
                LocalDateTime.of(2025, 10, 10, 10, 0),
                LocalDateTime.of(2025, 10, 10, 11, 0),
                false,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        SessionResponseDTO sessionWithoutParticipants = buildSession(
                trainerId,
                LocalDateTime.of(2025, 10, 11, 10, 0),
                LocalDateTime.of(2025, 10, 11, 11, 0),
                false
        );

        UUID studentShared = sessionWithParticipants.students().get(0).studentId();
        UUID studentExclusive = UUID.randomUUID();

        Event event = buildEvent(
                trainer,
                LocalDateTime.of(2025, 10, 12, 9, 0),
                LocalDateTime.of(2025, 10, 12, 10, 30),
                new UUID[]{studentShared, studentExclusive},
                new boolean[]{true, true}
        );

        when(trainerRepository.findAll()).thenReturn(List.of(trainer));
        when(scheduleService.getScheduledSessions(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(List.of(sessionWithParticipants, sessionWithoutParticipants));
        when(eventRepository.findActiveWithinDateRangeWithParticipants(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(List.of(event));
        when(studentRepository.findAllBirthDates()).thenReturn(Collections.emptyList());

        ReportsResponseDTO response = reportsService.generateReports(startDate, endDate, null);

        assertThat(response.trainerReports()).hasSize(1);
        assertThat(response.ageDistribution()).hasSize(4);

        var report = response.trainerReports().get(0);
        assertThat(report.id()).isEqualTo(trainerId);
        assertThat(report.name()).isEqualTo("Prof. Ana");
        assertThat(report.compensation()).isEqualTo(CompensationType.HOURLY);
        assertThat(report.specialties()).containsExactly("Pilates");
        assertThat(report.classesGiven()).isEqualTo(2);
        assertThat(report.studentsManaged()).isEqualTo(3);
        assertThat(report.hoursWorked()).isEqualTo(2.5);
    }

    @Test
    @DisplayName("Filters aggregation when trainerId is provided")
    void shouldFilterReportByTrainerId() {
        UUID otherTrainerId = UUID.randomUUID();
        Trainer targetTrainer = createTrainer(trainerId, "Target Trainer", CompensationType.MONTHLY, List.of());

        SessionResponseDTO targetSession = buildSession(
                trainerId,
                LocalDateTime.of(2025, 10, 5, 8, 0),
                LocalDateTime.of(2025, 10, 5, 9, 0),
                false,
                UUID.randomUUID()
        );
        SessionResponseDTO otherSession = buildSession(
                otherTrainerId,
                LocalDateTime.of(2025, 10, 6, 8, 0),
                LocalDateTime.of(2025, 10, 6, 9, 0),
                false,
                UUID.randomUUID()
        );

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(targetTrainer));
        when(scheduleService.getScheduledSessions(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(List.of(targetSession, otherSession));
        when(eventRepository.findActiveWithinDateRangeWithParticipants(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates()).thenReturn(Collections.emptyList());

        ReportsResponseDTO response = reportsService.generateReports(startDate, endDate, trainerId);

        assertThat(response.trainerReports()).hasSize(1);
        var report = response.trainerReports().get(0);
        assertThat(report.id()).isEqualTo(trainerId);
        assertThat(report.classesGiven()).isEqualTo(1);
        assertThat(report.hoursWorked()).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Returns zero metrics when trainer has no qualifying activities")
    void shouldReturnZeroMetricsForTrainerWithoutActivities() {
        Trainer trainer = createTrainer(trainerId, "Inactive Trainer", CompensationType.HOURLY, List.of());

        when(trainerRepository.findAll()).thenReturn(List.of(trainer));
        when(scheduleService.getScheduledSessions(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());
        when(eventRepository.findActiveWithinDateRangeWithParticipants(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates()).thenReturn(Collections.emptyList());

        ReportsResponseDTO response = reportsService.generateReports(startDate, endDate, null);

        assertThat(response.trainerReports()).hasSize(1);
        var report = response.trainerReports().get(0);
        assertThat(report.hoursWorked()).isEqualTo(0.0);
        assertThat(report.classesGiven()).isEqualTo(0);
        assertThat(report.studentsManaged()).isEqualTo(0);
    }

    @Test
    @DisplayName("Excludes sessions where all participants are marked absent")
    void shouldExcludeSessionsWhenAllParticipantsAreAbsent() {
        Trainer trainer = createTrainer(trainerId, "Prof. Ausente", CompensationType.HOURLY, List.of());
        UUID absentStudentId = UUID.randomUUID();

        SessionResponseDTO absentSession = new SessionResponseDTO(
                "session__" + trainerId + "__absent",
                trainerId,
                "Prof. Ausente",
                LocalDateTime.of(2025, 10, 15, 14, 0),
                LocalDateTime.of(2025, 10, 15, 15, 0),
                "Series",
                null,
                false,
                List.of(createParticipant(absentStudentId, false)),
                false,
                0
        );

        when(trainerRepository.findAll()).thenReturn(List.of(trainer));
        when(scheduleService.getScheduledSessions(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(List.of(absentSession));
        when(eventRepository.findActiveWithinDateRangeWithParticipants(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates()).thenReturn(Collections.emptyList());

        ReportsResponseDTO response = reportsService.generateReports(startDate, endDate, null);

        assertThat(response.trainerReports()).hasSize(1);
        var report = response.trainerReports().get(0);
        assertThat(report.hoursWorked()).isEqualTo(0.0);
        assertThat(report.classesGiven()).isEqualTo(0);
        assertThat(report.studentsManaged()).isEqualTo(0);
    }

    @Test
    @DisplayName("Calculates age distribution percentages")
    void shouldCalculateAgeDistribution() {
        Trainer trainer = createTrainer(trainerId, "Any Trainer", CompensationType.HOURLY, List.of());
        when(trainerRepository.findAll()).thenReturn(List.of(trainer));
        when(scheduleService.getScheduledSessions(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());
        when(eventRepository.findActiveWithinDateRangeWithParticipants(startDate.toLocalDate(), endDate.toLocalDate()))
                .thenReturn(Collections.emptyList());

        List<LocalDate> birthDates = Arrays.asList(
                LocalDate.now().minusYears(20),
                LocalDate.now().minusYears(30),
                LocalDate.now().minusYears(40),
                LocalDate.now().minusYears(50)
        );
        when(studentRepository.findAllBirthDates()).thenReturn(birthDates);

        ReportsResponseDTO response = reportsService.generateReports(startDate, endDate, null);
        List<AgeDistributionResponseDTO> distribution = response.ageDistribution();

        assertThat(distribution).hasSize(4);
        assertThat(distribution.get(0).count()).isEqualTo(1);
        assertThat(distribution.get(1).count()).isEqualTo(1);
        assertThat(distribution.get(2).count()).isEqualTo(1);
        assertThat(distribution.get(3).count()).isEqualTo(1);
    }

    private Trainer createTrainer(UUID id, String name, CompensationType compensationType, List<String> specialties) {
        Trainer trainer = new Trainer();
        ReflectionTestUtils.setField(trainer, "id", id);
        trainer.setName(name);
        trainer.setCompensationType(compensationType);
        trainer.setSpecialties(specialties);
        return trainer;
    }

    private SessionResponseDTO buildSession(UUID trainerId,
                                            LocalDateTime start,
                                            LocalDateTime end,
                                            boolean canceled,
                                            UUID... studentIds) {
        List<StudentCommitmentResponseDTO> participants = new ArrayList<>();
        for (UUID studentId : studentIds) {
                        participants.add(createParticipant(studentId, true));
        }
        return new SessionResponseDTO(
                "session__" + trainerId + "__" + start,
                trainerId,
                "Trainer",
                start,
                end,
                "Series",
                null,
                false,
                participants,
                canceled,
                participants.size()
        );
    }

        private StudentCommitmentResponseDTO createParticipant(UUID studentId, boolean present) {
                return new StudentCommitmentResponseDTO(
                                studentId,
                                "Student " + studentId.toString().substring(0, 5),
                                CommitmentStatus.ATTENDING,
                                Collections.emptyList(),
                                Collections.emptyList(),
                                present,
                                null
                );
        }

    private Event buildEvent(Trainer trainer,
                             LocalDateTime start,
                             LocalDateTime end,
                             UUID[] participantIds,
                             boolean[] attendanceFlags) {
        Event event = new TestEvent();
        event.setTrainer(trainer);
        event.setName("Evento Teste");
        event.setDate(start.toLocalDate());
        event.setStartTime(start.toLocalTime());
        event.setEndTime(end.toLocalTime());

        List<EventParticipant> participants = new ArrayList<>();
        for (int i = 0; i < participantIds.length; i++) {
            EventParticipant participant = new TestEventParticipant();
            participant.setEvent(event);
            participant.setIsPresent(attendanceFlags[i]);
            Student student = mock(Student.class);
            when(student.getId()).thenReturn(participantIds[i]);
            participant.setStudent(student);
            participants.add(participant);
        }

        ReflectionTestUtils.setField(event, "participants", participants);
        return event;
    }

        private static final class TestEvent extends Event {
                TestEvent() {
                        super();
                }
        }

        private static final class TestEventParticipant extends EventParticipant {
                TestEventParticipant() {
                        super();
                }
        }
}
