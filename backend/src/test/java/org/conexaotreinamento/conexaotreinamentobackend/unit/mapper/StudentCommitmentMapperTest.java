package org.conexaotreinamento.conexaotreinamentobackend.unit.mapper;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.CommitmentDetailResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CommitmentStatus;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentCommitmentMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.assertj.core.api.Assertions.assertThat;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentCommitmentMapper Unit Tests")
class StudentCommitmentMapperTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TrainerScheduleRepository scheduleRepository;

    @InjectMocks
    private StudentCommitmentMapper mapper;

    private UUID studentId;
    private UUID seriesId;
    private UUID commitmentId;
    private StudentCommitment commitment;
    private Student student;
    private TrainerSchedule schedule;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        seriesId = UUID.randomUUID();
        commitmentId = UUID.randomUUID();

        student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, java.time.LocalDate.of(2000, 1, 1));
        schedule = new TrainerSchedule();
        schedule.setSeriesName("Yoga Basics");

        commitment = new StudentCommitment();
        commitment.setId(commitmentId);
        commitment.setStudentId(studentId);
        commitment.setSessionSeriesId(seriesId);
        commitment.setCommitmentStatus(CommitmentStatus.ATTENDING);
        commitment.setEffectiveFromTimestamp(Instant.parse("2025-09-01T00:00:00Z"));
        commitment.setCreatedAt(Instant.parse("2025-08-15T10:00:00Z"));
    }

    @Test
    @DisplayName("Should map commitment to detail response with student and schedule names")
    void shouldMapCommitmentToDetailResponseWithNames() {
        // Given
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(scheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule));

        // When
        CommitmentDetailResponseDTO result = mapper.toDetailResponse(commitment);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(commitmentId);
        assertThat(result.studentId()).isEqualTo(studentId);
        assertThat(result.studentName()).isEqualTo("Alice");
        assertThat(result.sessionSeriesId()).isEqualTo(seriesId);
        assertThat(result.seriesName()).isEqualTo("Yoga Basics");
        assertThat(result.commitmentStatus()).isEqualTo(CommitmentStatus.ATTENDING);
        assertThat(result.effectiveFromTimestamp()).isEqualTo(commitment.getEffectiveFromTimestamp());
        assertThat(result.createdAt()).isEqualTo(commitment.getCreatedAt());
    }

    @Test
    @DisplayName("Should map commitment with null student name when student not found")
    void shouldMapCommitmentWithNullStudentNameWhenStudentNotFound() {
        // Given
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());
        when(scheduleRepository.findById(seriesId)).thenReturn(Optional.of(schedule));

        // When
        CommitmentDetailResponseDTO result = mapper.toDetailResponse(commitment);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.studentName()).isNull();
        assertThat(result.seriesName()).isEqualTo("Yoga Basics");
    }

    @Test
    @DisplayName("Should map commitment with null series name when schedule not found")
    void shouldMapCommitmentWithNullSeriesNameWhenScheduleNotFound() {
        // Given
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(scheduleRepository.findById(seriesId)).thenReturn(Optional.empty());

        // When
        CommitmentDetailResponseDTO result = mapper.toDetailResponse(commitment);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.studentName()).isEqualTo("Alice");
        assertThat(result.seriesName()).isNull();
    }

    @Test
    @DisplayName("Should map commitment with both names null when neither found")
    void shouldMapCommitmentWithBothNamesNullWhenNeitherFound() {
        // Given
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());
        when(scheduleRepository.findById(seriesId)).thenReturn(Optional.empty());

        // When
        CommitmentDetailResponseDTO result = mapper.toDetailResponse(commitment);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.studentName()).isNull();
        assertThat(result.seriesName()).isNull();
        assertThat(result.commitmentStatus()).isEqualTo(CommitmentStatus.ATTENDING);
    }
}

