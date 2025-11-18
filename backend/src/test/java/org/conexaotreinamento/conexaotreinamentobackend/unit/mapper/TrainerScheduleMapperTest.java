package org.conexaotreinamento.conexaotreinamentobackend.unit.mapper;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.TrainerScheduleMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("TrainerScheduleMapper Unit Tests")
class TrainerScheduleMapperTest {

    private TrainerScheduleMapper mapper;

    private UUID trainerId;
    private UUID scheduleId;
    private TrainerSchedule schedule;
    private TrainerScheduleRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        mapper = new TrainerScheduleMapper();
        trainerId = UUID.randomUUID();
        scheduleId = UUID.randomUUID();

        schedule = new TrainerSchedule();
        schedule.setId(scheduleId);
        schedule.setTrainerId(trainerId);
        schedule.setWeekday(1); // Monday (0=Sunday, 1=Monday, etc.)
        schedule.setStartTime(LocalTime.of(9, 0));
        schedule.setIntervalDuration(60);
        schedule.setSeriesName("Morning Yoga");
        schedule.setEffectiveFromTimestamp(Instant.parse("2025-01-01T00:00:00Z"));
        schedule.setCreatedAt(Instant.parse("2024-12-01T10:00:00Z"));
        schedule.setUpdatedAt(Instant.parse("2024-12-15T14:00:00Z"));
        schedule.setActive(true);

        requestDTO = new TrainerScheduleRequestDTO(
                trainerId,
                1, // Monday
                LocalTime.of(9, 0),
                60,
                "Morning Yoga"
        );
    }

    @Test
    @DisplayName("Should map entity to response DTO")
    void shouldMapEntityToResponseDTO() {
        // When
        TrainerScheduleResponseDTO result = mapper.toResponse(schedule);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(scheduleId);
        assertThat(result.trainerId()).isEqualTo(trainerId);
        assertThat(result.weekday()).isEqualTo(1); // Monday
        assertThat(result.startTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(result.intervalDuration()).isEqualTo(60);
        assertThat(result.seriesName()).isEqualTo("Morning Yoga");
        assertThat(result.effectiveFromTimestamp()).isEqualTo(schedule.getEffectiveFromTimestamp());
        assertThat(result.createdAt()).isEqualTo(schedule.getCreatedAt());
        assertThat(result.updatedAt()).isEqualTo(schedule.getUpdatedAt());
        assertThat(result.active()).isTrue();
    }

    @Test
    @DisplayName("Should map request DTO to entity")
    void shouldMapRequestDTOToEntity() {
        // When
        TrainerSchedule result = mapper.toEntity(requestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTrainerId()).isEqualTo(trainerId);
        assertThat(result.getWeekday()).isEqualTo(1); // Monday
        assertThat(result.getStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(result.getIntervalDuration()).isEqualTo(60);
        assertThat(result.getSeriesName()).isEqualTo("Morning Yoga");
    }

    @Test
    @DisplayName("Should update entity with request DTO")
    void shouldUpdateEntityWithRequestDTO() {
        // Given
        TrainerScheduleRequestDTO updateDTO = new TrainerScheduleRequestDTO(
                trainerId,
                2, // Tuesday
                LocalTime.of(14, 30),
                90,
                "Afternoon Strength"
        );

        // When
        mapper.updateEntity(updateDTO, schedule);

        // Then
        assertThat(schedule.getTrainerId()).isEqualTo(trainerId);
        assertThat(schedule.getWeekday()).isEqualTo(2); // Tuesday
        assertThat(schedule.getStartTime()).isEqualTo(LocalTime.of(14, 30));
        assertThat(schedule.getIntervalDuration()).isEqualTo(90);
        assertThat(schedule.getSeriesName()).isEqualTo("Afternoon Strength");
    }

    @Test
    @DisplayName("Should map inactive schedule correctly")
    void shouldMapInactiveScheduleCorrectly() {
        // Given
        schedule.setActive(false);

        // When
        TrainerScheduleResponseDTO result = mapper.toResponse(schedule);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.active()).isFalse();
    }
}

