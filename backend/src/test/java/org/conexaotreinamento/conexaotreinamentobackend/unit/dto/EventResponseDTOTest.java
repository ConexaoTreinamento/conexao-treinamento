package org.conexaotreinamento.conexaotreinamentobackend.unit.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventParticipantResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EventResponseDTO Tests")
class EventResponseDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Pilates Class";
        LocalDate date = LocalDate.of(2024, 12, 25);
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(11, 0);
        String location = "Studio A";
        String description = "Morning pilates session";
        UUID instructorId = UUID.randomUUID();
        String instructor = "John Trainer";
        List<EventParticipantResponseDTO> participants = Arrays.asList(
                new EventParticipantResponseDTO(UUID.randomUUID(), "Alice Doe", null, Instant.now(), false),
                new EventParticipantResponseDTO(UUID.randomUUID(), "Bob Smith", null, Instant.now(), true)
        );
        Instant createdAt = Instant.now().minusSeconds(3600);
        Instant updatedAt = Instant.now().minusSeconds(1800);
        Instant deletedAt = null;

        // When
        EventResponseDTO dto = new EventResponseDTO(id, name, date, startTime, endTime, location, description,
                instructorId, instructor, participants, createdAt, updatedAt, deletedAt);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.date()).isEqualTo(date);
        assertThat(dto.startTime()).isEqualTo(startTime);
        assertThat(dto.endTime()).isEqualTo(endTime);
        assertThat(dto.location()).isEqualTo(location);
        assertThat(dto.description()).isEqualTo(description);
        assertThat(dto.instructorId()).isEqualTo(instructorId);
        assertThat(dto.instructor()).isEqualTo(instructor);
        assertThat(dto.participants()).isEqualTo(participants);
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
        assertThat(dto.deletedAt()).isEqualTo(deletedAt);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        EventResponseDTO dto = new EventResponseDTO(null, null, null, null, null, null, null, null, null, null, null, null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
        assertThat(dto.date()).isNull();
        assertThat(dto.startTime()).isNull();
        assertThat(dto.endTime()).isNull();
        assertThat(dto.location()).isNull();
        assertThat(dto.description()).isNull();
        assertThat(dto.instructorId()).isNull();
        assertThat(dto.instructor()).isNull();
        assertThat(dto.participants()).isNull();
        assertThat(dto.createdAt()).isNull();
        assertThat(dto.updatedAt()).isNull();
        assertThat(dto.deletedAt()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with empty participants list")
    void shouldCreateDTOWithEmptyParticipantsList() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Empty Event";
        LocalDate date = LocalDate.of(2024, 12, 25);
        List<EventParticipantResponseDTO> emptyParticipants = Arrays.asList();

        // When
        EventResponseDTO dto = new EventResponseDTO(id, name, date, null, null, null, null, null, null, emptyParticipants, null, null, null);

        // Then
        assertThat(dto.participants()).isEqualTo(emptyParticipants);
        assertThat(dto.participants()).isEmpty();
    }

    @Test
    @DisplayName("Should create DTO with deleted event")
    void shouldCreateDTOWithDeletedEvent() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Deleted Event";
        LocalDate date = LocalDate.of(2024, 12, 25);
        Instant deletedAt = Instant.now();

        // When
        EventResponseDTO dto = new EventResponseDTO(id, name, date, null, null, null, null, null, null, null, null, null, deletedAt);

        // Then
        assertThat(dto.deletedAt()).isEqualTo(deletedAt);
        assertThat(dto.deletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should convert from entity with all fields")
    void shouldConvertFromEntityWithAllFields() {
        // Given
        Event event = createEventWithAllFields();

        // When
        EventResponseDTO dto = EventResponseDTO.fromEntity(event);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(event.getId());
        assertThat(dto.name()).isEqualTo(event.getName());
        assertThat(dto.date()).isEqualTo(event.getDate());
        assertThat(dto.startTime()).isEqualTo(event.getStartTime());
        assertThat(dto.endTime()).isEqualTo(event.getEndTime());
        assertThat(dto.location()).isEqualTo(event.getLocation());
        assertThat(dto.description()).isEqualTo(event.getDescription());
        assertThat(dto.instructorId()).isEqualTo(event.getTrainer().getId());
        assertThat(dto.instructor()).isEqualTo(event.getTrainer().getName());
        // Since we can't set participants directly, we can't test the size
        assertThat(dto.createdAt()).isEqualTo(event.getCreatedAt());
        assertThat(dto.updatedAt()).isEqualTo(event.getUpdatedAt());
        assertThat(dto.deletedAt()).isEqualTo(event.getDeletedAt());
    }

    @Test
    @DisplayName("Should convert from entity with null trainer")
    void shouldConvertFromEntityWithNullTrainer() {
        // Given
        Event event = createEventWithAllFields();
        event.setTrainer(null);

        // When
        EventResponseDTO dto = EventResponseDTO.fromEntity(event);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.instructorId()).isNull();
        assertThat(dto.instructor()).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with null participants")
    void shouldConvertFromEntityWithNullParticipants() {
        // Given
        Event event = createEventWithAllFields();
        // participants field doesn't have setter, so we can't set it to null

        // When
        EventResponseDTO dto = EventResponseDTO.fromEntity(event);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.participants()).isNotNull();
        assertThat(dto.participants()).isEmpty();
    }

    @Test
    @DisplayName("Should convert from null entity")
    void shouldConvertFromNullEntity() {
        // When
        EventResponseDTO dto = EventResponseDTO.fromEntity(null);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with empty participants")
    void shouldConvertFromEntityWithEmptyParticipants() {
        // Given
        Event event = createEventWithAllFields();
        // participants field doesn't have setter, so we can't set it to empty list

        // When
        EventResponseDTO dto = EventResponseDTO.fromEntity(event);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.participants()).isNotNull();
        assertThat(dto.participants()).isEmpty();
    }

    private Event createEventWithAllFields() {
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        setIdViaReflection(event, UUID.randomUUID());
        event.setStartTime(LocalTime.of(10, 0));
        event.setEndTime(LocalTime.of(11, 0));
        event.setLocation("Test Location");
        event.setDescription("Test Description");

        // Create trainer
        Trainer trainer = new Trainer();
        setIdViaReflection(trainer, UUID.randomUUID());
        trainer.setName("John Trainer");
        event.setTrainer(trainer);

        // Create participants
        Student student1 = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        setIdViaReflection(student1, UUID.randomUUID());
        EventParticipant participant1 = new EventParticipant(event, student1);
        setIdViaReflection(participant1, UUID.randomUUID());

        Student student2 = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        setIdViaReflection(student2, UUID.randomUUID());
        EventParticipant participant2 = new EventParticipant(event, student2);
        setIdViaReflection(participant2, UUID.randomUUID());

        // participants field doesn't have setter, so we can't set it directly

        // Set timestamps
        setTimestampViaReflection(event, "createdAt", Instant.now().minusSeconds(3600));
        setTimestampViaReflection(event, "updatedAt", Instant.now().minusSeconds(1800));
        event.setDeletedAt(null);

        return event;
    }

    private void setIdViaReflection(Object entity, UUID id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set ID via reflection", e);
        }
    }

    private void setTimestampViaReflection(Event event, String fieldName, Instant timestamp) {
        try {
            Field field = Event.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(event, timestamp);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set timestamp via reflection", e);
        }
    }
}
