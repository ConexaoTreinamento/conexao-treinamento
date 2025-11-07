package org.conexaotreinamento.conexaotreinamentobackend.unit.dto;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventParticipantResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EventParticipantResponseDTO Tests")
class EventParticipantResponseDTOTest {

    @Test
    @DisplayName("Should create DTO with all fields")
    void shouldCreateDTOWithAllFields() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Alice Doe";
        String avatar = "avatar.jpg";
        Instant enrolledAt = Instant.now().minusSeconds(3600);
        Boolean present = true;

        // When
        EventParticipantResponseDTO dto = new EventParticipantResponseDTO(id, name, avatar, enrolledAt, present);

        // Then
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
        assertThat(dto.avatar()).isEqualTo(avatar);
        assertThat(dto.enrolledAt()).isEqualTo(enrolledAt);
        assertThat(dto.present()).isEqualTo(present);
    }

    @Test
    @DisplayName("Should create DTO with null values")
    void shouldCreateDTOWithNullValues() {
        // When
        EventParticipantResponseDTO dto = new EventParticipantResponseDTO(null, null, null, null, null);

        // Then
        assertThat(dto.id()).isNull();
        assertThat(dto.name()).isNull();
        assertThat(dto.avatar()).isNull();
        assertThat(dto.enrolledAt()).isNull();
        assertThat(dto.present()).isNull();
    }

    @Test
    @DisplayName("Should create DTO with present false")
    void shouldCreateDTOWithPresentFalse() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Bob Smith";
        Boolean present = false;

        // When
        EventParticipantResponseDTO dto = new EventParticipantResponseDTO(id, name, null, null, present);

        // Then
        assertThat(dto.present()).isFalse();
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
    }

    @Test
    @DisplayName("Should create DTO with present true")
    void shouldCreateDTOWithPresentTrue() {
        // Given
        UUID id = UUID.randomUUID();
        String name = "Charlie Brown";
        Boolean present = true;

        // When
        EventParticipantResponseDTO dto = new EventParticipantResponseDTO(id, name, null, null, present);

        // Then
        assertThat(dto.present()).isTrue();
        assertThat(dto.id()).isEqualTo(id);
        assertThat(dto.name()).isEqualTo(name);
    }

    @Test
    @DisplayName("Should convert from entity with all fields")
    void shouldConvertFromEntityWithAllFields() {
        // Given
        EventParticipant participant = createEventParticipantWithAllFields();

        // When
        EventParticipantResponseDTO dto = EventParticipantResponseDTO.fromEntity(participant);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(participant.getStudent().getId());
        assertThat(dto.name()).isEqualTo("Alice Doe");
        assertThat(dto.avatar()).isNull(); // Avatar not implemented yet
        assertThat(dto.enrolledAt()).isEqualTo(participant.getEnrolledAt());
        assertThat(dto.present()).isEqualTo(participant.getPresent());
    }

    @Test
    @DisplayName("Should convert from entity with null student")
    void shouldConvertFromEntityWithNullStudent() {
        // Given
        EventParticipant participant = new EventParticipant(new Event("Test", LocalDate.now()), new Student("test@example.com", "Test", "User", Student.Gender.F, LocalDate.now()));
        participant.setStudent(null);

        // When
        EventParticipantResponseDTO dto = EventParticipantResponseDTO.fromEntity(participant);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Should convert from null entity")
    void shouldConvertFromNullEntity() {
        // When
        EventParticipantResponseDTO dto = EventParticipantResponseDTO.fromEntity(null);

        // Then
        assertThat(dto).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with different name formats")
    void shouldConvertFromEntityWithDifferentNameFormats() {
        // Given
        Student student1 = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        setIdViaReflection(student1, UUID.randomUUID());
        EventParticipant participant1 = new EventParticipant(new Event("Test", LocalDate.now()), student1);

        Student student2 = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        setIdViaReflection(student2, UUID.randomUUID());
        EventParticipant participant2 = new EventParticipant(new Event("Test", LocalDate.now()), student2);

        Student student3 = new Student("charlie@example.com", "Charlie", "Brown", Student.Gender.M, LocalDate.of(1990, 10, 20));
        setIdViaReflection(student3, UUID.randomUUID());
        EventParticipant participant3 = new EventParticipant(new Event("Test", LocalDate.now()), student3);

        // When
        EventParticipantResponseDTO dto1 = EventParticipantResponseDTO.fromEntity(participant1);
        EventParticipantResponseDTO dto2 = EventParticipantResponseDTO.fromEntity(participant2);
        EventParticipantResponseDTO dto3 = EventParticipantResponseDTO.fromEntity(participant3);

        // Then
        assertThat(dto1.name()).isEqualTo("Alice Doe");
        assertThat(dto2.name()).isEqualTo("Bob Smith");
        assertThat(dto3.name()).isEqualTo("Charlie Brown");
    }

    @Test
    @DisplayName("Should convert from entity with different present values")
    void shouldConvertFromEntityWithDifferentPresentValues() {
        // Given
        EventParticipant participantPresent = createEventParticipantWithAllFields();
        participantPresent.setPresent(true);

        EventParticipant participantAbsent = createEventParticipantWithAllFields();
        participantAbsent.setPresent(false);

        EventParticipant participantNull = createEventParticipantWithAllFields();
        participantNull.setPresent(null);

        // When
        EventParticipantResponseDTO dtoPresent = EventParticipantResponseDTO.fromEntity(participantPresent);
        EventParticipantResponseDTO dtoAbsent = EventParticipantResponseDTO.fromEntity(participantAbsent);
        EventParticipantResponseDTO dtoNull = EventParticipantResponseDTO.fromEntity(participantNull);

        // Then
        assertThat(dtoPresent.present()).isTrue();
        assertThat(dtoAbsent.present()).isFalse();
        assertThat(dtoNull.present()).isNull();
    }

    @Test
    @DisplayName("Should convert from entity with different enrolled times")
    void shouldConvertFromEntityWithDifferentEnrolledTimes() {
        // Given
        Instant now = Instant.now();
        Instant past = now.minusSeconds(3600);
        Instant future = now.plusSeconds(3600);

        EventParticipant participantNow = createEventParticipantWithAllFields();
        participantNow.setEnrolledAt(now);

        EventParticipant participantPast = createEventParticipantWithAllFields();
        participantPast.setEnrolledAt(past);

        EventParticipant participantFuture = createEventParticipantWithAllFields();
        participantFuture.setEnrolledAt(future);

        // When
        EventParticipantResponseDTO dtoNow = EventParticipantResponseDTO.fromEntity(participantNow);
        EventParticipantResponseDTO dtoPast = EventParticipantResponseDTO.fromEntity(participantPast);
        EventParticipantResponseDTO dtoFuture = EventParticipantResponseDTO.fromEntity(participantFuture);

        // Then
        assertThat(dtoNow.enrolledAt()).isEqualTo(now);
        assertThat(dtoPast.enrolledAt()).isEqualTo(past);
        assertThat(dtoFuture.enrolledAt()).isEqualTo(future);
    }

    private EventParticipant createEventParticipantWithAllFields() {
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        setIdViaReflection(event, UUID.randomUUID());

        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        setIdViaReflection(student, UUID.randomUUID());

        EventParticipant participant = new EventParticipant(event, student);
        setIdViaReflection(participant, UUID.randomUUID());
        participant.setPresent(false);
        participant.setEnrolledAt(Instant.now());

        return participant;
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
}
