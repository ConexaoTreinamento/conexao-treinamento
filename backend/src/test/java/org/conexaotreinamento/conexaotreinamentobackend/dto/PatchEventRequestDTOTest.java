package org.conexaotreinamento.conexaotreinamentobackend.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("PatchEventRequestDTO Tests")
class PatchEventRequestDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        String name = "Updated Pilates Class";
        LocalDate date = LocalDate.of(2024, 12, 26);
        LocalTime startTime = LocalTime.of(11, 0);
        LocalTime endTime = LocalTime.of(12, 0);
        String location = "Studio B";
        String description = "Updated morning pilates session";
        UUID trainerId = UUID.randomUUID();
        List<UUID> participantIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(name, date, startTime, endTime, location, description, trainerId, participantIds);

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
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, null, null, null, null, null, null);

        // Then
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.trainerId()).isNull();
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with partial updates")
    void shouldCreateDTOWithPartialUpdates() {
        // Given
        String name = "Updated Name";
        String location = "New Location";
        // Other fields are null for partial update

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(name, null, null, null, location, null, null, null);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.location()).isEqualTo(location);
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.trainerId()).isNull();
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with only time updates")
    void shouldCreateDTOWithOnlyTimeUpdates() {
        // Given
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(10, 0);

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, startTime, endTime, null, null, null, null);

        // Then
        assertThat(dto.startTime()).isEqualTo(startTime);
        assertThat(dto.endTime()).isEqualTo(endTime);
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.trainerId()).isNull();
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with only participant updates")
    void shouldCreateDTOWithOnlyParticipantUpdates() {
        // Given
        List<UUID> participantIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, null, null, null, null, null, participantIds);

        // Then
        assertThat(dto.participantIds()).isEqualTo(participantIds);
        assertThat(dto.participantIds()).hasSize(3);
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.trainerId()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with maximum length strings")
    void shouldCreateDTOWithMaximumLengthStrings() {
        // Given
        String name = "A".repeat(200); // Max length for name
        String location = "B".repeat(255); // Max length for location
        String description = "C".repeat(1000); // Long description

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(name, null, null, null, location, description, null, null);

        // Then
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.name()).hasSize(200);
        assertThat(dto.location()).isEqualTo(location);
        assertThat(dto.location()).hasSize(255);
        assertThat(dto.description()).isEqualTo(description);
        assertThat(dto.description()).hasSize(1000);
    }

    @Test
    @DisplayName("Should create DTO with empty participant list")
    void shouldCreateDTOWithEmptyParticipantList() {
        // Given
        List<UUID> emptyParticipantIds = Arrays.asList();

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, null, null, null, null, null, emptyParticipantIds);

        // Then
        assertThat(dto.participantIds()).isEqualTo(emptyParticipantIds);
        assertThat(dto.participantIds()).isEmpty();
    }

    @Test
    @DisplayName("Should create DTO with only trainer update")
    void shouldCreateDTOWithOnlyTrainerUpdate() {
        // Given
        UUID trainerId = UUID.randomUUID();

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, null, null, null, null, trainerId, null);

        // Then
        assertThat(dto.trainerId()).isEqualTo(trainerId);
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.participantIds()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with only description update")
    void shouldCreateDTOWithOnlyDescriptionUpdate() {
        // Given
        String description = "Updated event description with more details";

        // When
        PatchEventRequestDTO dto = new PatchEventRequestDTO(null, null, null, null, null, description, null, null);

        // Then
        assertThat(dto.description()).isEqualTo(description);
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.trainerId()).isNull();
        assertThat(dto.participantIds()).isNull();
    }
}
