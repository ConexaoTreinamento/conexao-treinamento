package org.conexaotreinamento.conexaotreinamentobackend.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EventRequestDTO Tests")
class EventRequestDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        String name = "Pilates Class";
        LocalDate date = LocalDate.of(2024, 12, 25);
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(11, 0);
        String location = "Studio A";
        String description = "Morning pilates session";
        UUID trainerId = UUID.randomUUID();
        List<UUID> participantIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, startTime, endTime, location, description, trainerId, participantIds);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.date()).isEqualTo(date);
        assertThat(dto.startTime()).isEqualTo(startTime);
        assertThat(dto.endTime()).isEqualTo(endTime);
        assertThat(dto.location()).isEqualTo(location);
        assertThat(dto.description()).isEqualTo(description);
        assertThat(dto.trainerId()).isEqualTo(trainerId);
        assertThat(dto.participantIds()).isEqualTo(participantIds);
    }

    @Test
    @DisplayName("Should create DTO with minimal required fields")
    void shouldCreateDTOWithMinimalRequiredFields() {
        // Given
        String name = "Yoga Session";
        LocalDate date = LocalDate.of(2024, 12, 25);
        UUID trainerId = UUID.randomUUID();

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, null, null, null, null, trainerId, null);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.date()).isEqualTo(date);
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.trainerId()).isEqualTo(trainerId);
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with empty participant list")
    void shouldCreateDTOWithEmptyParticipantList() {
        // Given
        String name = "Fitness Class";
        LocalDate date = LocalDate.of(2024, 12, 25);
        UUID trainerId = UUID.randomUUID();
        List<UUID> emptyParticipantIds = Arrays.asList();

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, null, null, null, null, trainerId, emptyParticipantIds);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.date()).isEqualTo(date);
        assertThat(dto.trainerId()).isEqualTo(trainerId);
        assertThat(dto.participantIds()).isEqualTo(emptyParticipantIds);
        assertThat(dto.participantIds()).isEmpty();
    }

    @Test
    @DisplayName("Should create DTO with maximum length strings")
    void shouldCreateDTOWithMaximumLengthStrings() {
        // Given
        String name = "A".repeat(200); // Max length for name
        LocalDate date = LocalDate.of(2024, 12, 25);
        String location = "B".repeat(255); // Max length for location
        String description = "C".repeat(1000); // Long description
        UUID trainerId = UUID.randomUUID();

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, null, null, location, description, trainerId, null);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.name()).hasSize(200);
        assertThat(dto.location()).isEqualTo(location);
        assertThat(dto.location()).hasSize(255);
        assertThat(dto.description()).isEqualTo(description);
        assertThat(dto.description()).hasSize(1000);
    }

    @Test
    @DisplayName("Should create DTO with time values")
    void shouldCreateDTOWithTimeValues() {
        // Given
        String name = "Morning Workout";
        LocalDate date = LocalDate.of(2024, 12, 25);
        LocalTime startTime = LocalTime.of(8, 30);
        LocalTime endTime = LocalTime.of(9, 30);
        UUID trainerId = UUID.randomUUID();

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, startTime, endTime, null, null, trainerId, null);

        // Then
        assertThat(dto.startTime()).isEqualTo(startTime);
        assertThat(dto.endTime()).isEqualTo(endTime);
    }

    @Test
    @DisplayName("Should create DTO with multiple participants")
    void shouldCreateDTOWithMultipleParticipants() {
        // Given
        String name = "Group Training";
        LocalDate date = LocalDate.of(2024, 12, 25);
        UUID trainerId = UUID.randomUUID();
        List<UUID> participantIds = Arrays.asList(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, null, null, null, null, trainerId, participantIds);

        // Then
        assertThat(dto.participantIds()).hasSize(4);
        assertThat(dto.participantIds()).containsExactlyElementsOf(participantIds);
    }

    @Test
    @DisplayName("Should handle null values correctly")
    void shouldHandleNullValuesCorrectly() {
        // Given
        String name = "Test Event";
        LocalDate date = LocalDate.of(2024, 12, 25);
        UUID trainerId = UUID.randomUUID();

        // When
        EventRequestDTO dto = new EventRequestDTO(name, date, null, null, null, null, trainerId, null);

        // Then
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with different date values")
    void shouldCreateDTOWithDifferentDateValues() {
        // Given
        String name = "Test Event";
        LocalDate pastDate = LocalDate.of(2023, 1, 1);
        LocalDate futureDate = LocalDate.of(2025, 12, 31);
        LocalDate today = LocalDate.now();
        UUID trainerId = UUID.randomUUID();

        // When
        EventRequestDTO pastEvent = new EventRequestDTO(name, pastDate, null, null, null, null, trainerId, null);
        EventRequestDTO futureEvent = new EventRequestDTO(name, futureDate, null, null, null, null, trainerId, null);
        EventRequestDTO todayEvent = new EventRequestDTO(name, today, null, null, null, null, trainerId, null);

        // Then
        assertThat(pastEvent.date()).isEqualTo(pastDate);
        assertThat(futureEvent.date()).isEqualTo(futureDate);
        assertThat(todayEvent.date()).isEqualTo(today);
    }
}
