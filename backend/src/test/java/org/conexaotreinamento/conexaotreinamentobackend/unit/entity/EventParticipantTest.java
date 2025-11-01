package org.conexaotreinamento.conexaotreinamentobackend.unit.entity;

import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("EventParticipant Entity Tests")
class EventParticipantTest {

    @Test
    @DisplayName("Should create event participant with constructor")
    void shouldCreateEventParticipantWithConstructor() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));

        // When
        EventParticipant participant = new EventParticipant(event, student);

        // Then
        assertThat(participant.getEvent()).isEqualTo(event);
        assertThat(participant.getStudent()).isEqualTo(student);
        assertThat(participant.getEnrolledAt()).isNotNull();
        assertThat(participant.getPresent()).isFalse();
        assertThat(participant.getCreatedAt()).isNull();
        assertThat(participant.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("Should set enrolledAt to current time in constructor")
    void shouldSetEnrolledAtToCurrentTimeInConstructor() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        Instant beforeCreation = Instant.now();

        // When
        EventParticipant participant = new EventParticipant(event, student);
        Instant afterCreation = Instant.now();

        // Then
        assertThat(participant.getEnrolledAt()).isNotNull();
        assertThat(participant.getEnrolledAt()).isBetween(beforeCreation, afterCreation);
    }

    @Test
    @DisplayName("Should set present to false in constructor")
    void shouldSetPresentToFalseInConstructor() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));

        // When
        EventParticipant participant = new EventParticipant(event, student);

        // Then
        assertThat(participant.getPresent()).isFalse();
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);
        
        Event newEvent = new Event("New Event", LocalDate.of(2024, 12, 26));
        Student newStudent = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        Instant enrolledAt = Instant.now().minusSeconds(3600);
        Boolean present = true;

        // When
        participant.setEvent(newEvent);
        participant.setStudent(newStudent);
        participant.setEnrolledAt(enrolledAt);
        participant.setPresent(present);

        // Then
        assertThat(participant.getEvent()).isEqualTo(newEvent);
        assertThat(participant.getStudent()).isEqualTo(newStudent);
        assertThat(participant.getEnrolledAt()).isEqualTo(enrolledAt);
        assertThat(participant.getPresent()).isEqualTo(present);
    }

    @Test
    @DisplayName("Should handle null values in setters")
    void shouldHandleNullValuesInSetters() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);

        // When
        participant.setEvent(null);
        participant.setStudent(null);
        participant.setEnrolledAt(null);
        participant.setPresent(null);

        // Then
        assertThat(participant.getEvent()).isNull();
        assertThat(participant.getStudent()).isNull();
        assertThat(participant.getEnrolledAt()).isNull();
        assertThat(participant.getPresent()).isNull();
    }

    @Test
    @DisplayName("Should handle different present values")
    void shouldHandleDifferentPresentValues() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);

        // When & Then
        participant.setPresent(true);
        assertThat(participant.getPresent()).isTrue();

        participant.setPresent(false);
        assertThat(participant.getPresent()).isFalse();

        participant.setPresent(null);
        assertThat(participant.getPresent()).isNull();
    }

    @Test
    @DisplayName("Should handle different enrolledAt values")
    void shouldHandleDifferentEnrolledAtValues() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);

        Instant now = Instant.now();
        Instant past = now.minusSeconds(3600);
        Instant future = now.plusSeconds(3600);

        // When & Then
        participant.setEnrolledAt(past);
        assertThat(participant.getEnrolledAt()).isEqualTo(past);

        participant.setEnrolledAt(now);
        assertThat(participant.getEnrolledAt()).isEqualTo(now);

        participant.setEnrolledAt(future);
        assertThat(participant.getEnrolledAt()).isEqualTo(future);
    }

    @Test
    @DisplayName("Should handle different students")
    void shouldHandleDifferentStudents() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student1 = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        Student student2 = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        Student student3 = new Student("charlie@example.com", "Charlie", "Brown", Student.Gender.M, LocalDate.of(1990, 10, 20));
        
        EventParticipant participant = new EventParticipant(event, student1);

        // When & Then
        participant.setStudent(student1);
        assertThat(participant.getStudent()).isEqualTo(student1);

        participant.setStudent(student2);
        assertThat(participant.getStudent()).isEqualTo(student2);

        participant.setStudent(student3);
        assertThat(participant.getStudent()).isEqualTo(student3);
    }

    @Test
    @DisplayName("Should handle different events")
    void shouldHandleDifferentEvents() {
        // Given
        Event event1 = new Event("Event 1", LocalDate.of(2024, 12, 25));
        Event event2 = new Event("Event 2", LocalDate.of(2024, 12, 26));
        Event event3 = new Event("Event 3", LocalDate.of(2024, 12, 27));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        
        EventParticipant participant = new EventParticipant(event1, student);

        // When & Then
        participant.setEvent(event1);
        assertThat(participant.getEvent()).isEqualTo(event1);

        participant.setEvent(event2);
        assertThat(participant.getEvent()).isEqualTo(event2);

        participant.setEvent(event3);
        assertThat(participant.getEvent()).isEqualTo(event3);
    }

    @Test
    @DisplayName("Should handle students with different genders")
    void shouldHandleStudentsWithDifferentGenders() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student femaleStudent = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        Student maleStudent = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        
        EventParticipant participant = new EventParticipant(event, femaleStudent);

        // When & Then
        participant.setStudent(femaleStudent);
        assertThat(participant.getStudent()).isEqualTo(femaleStudent);
        assertThat(participant.getStudent().getGender()).isEqualTo(Student.Gender.F);

        participant.setStudent(maleStudent);
        assertThat(participant.getStudent()).isEqualTo(maleStudent);
        assertThat(participant.getStudent().getGender()).isEqualTo(Student.Gender.M);
    }

    @Test
    @DisplayName("Should handle students with different birth dates")
    void shouldHandleStudentsWithDifferentBirthDates() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student youngStudent = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        Student oldStudent = new Student("bob@example.com", "Bob", "Smith", Student.Gender.M, LocalDate.of(1980, 5, 15));
        
        EventParticipant participant = new EventParticipant(event, youngStudent);

        // When & Then
        participant.setStudent(youngStudent);
        assertThat(participant.getStudent()).isEqualTo(youngStudent);
        assertThat(participant.getStudent().getBirthDate()).isEqualTo(LocalDate.of(2000, 1, 1));

        participant.setStudent(oldStudent);
        assertThat(participant.getStudent()).isEqualTo(oldStudent);
        assertThat(participant.getStudent().getBirthDate()).isEqualTo(LocalDate.of(1980, 5, 15));
    }

    @Test
    @DisplayName("Should handle students with different email formats")
    void shouldHandleStudentsWithDifferentEmailFormats() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student1 = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        Student student2 = new Student("bob.smith@company.co.uk", "Bob", "Smith", Student.Gender.M, LocalDate.of(1995, 5, 15));
        Student student3 = new Student("charlie+test@domain.org", "Charlie", "Brown", Student.Gender.M, LocalDate.of(1990, 10, 20));
        
        EventParticipant participant = new EventParticipant(event, student1);

        // When & Then
        participant.setStudent(student1);
        assertThat(participant.getStudent().getEmail()).isEqualTo("alice@example.com");

        participant.setStudent(student2);
        assertThat(participant.getStudent().getEmail()).isEqualTo("bob.smith@company.co.uk");

        participant.setStudent(student3);
        assertThat(participant.getStudent().getEmail()).isEqualTo("charlie+test@domain.org");
    }

    @Test
    @DisplayName("Should handle multiple setter calls")
    void shouldHandleMultipleSetterCalls() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);

        // When
        participant.setPresent(true);
        participant.setPresent(false);
        participant.setPresent(true);
        participant.setPresent(null);
        participant.setPresent(false);

        // Then
        assertThat(participant.getPresent()).isFalse();
    }

    @Test
    @DisplayName("Should maintain enrolledAt from constructor after setter calls")
    void shouldMaintainEnrolledAtFromConstructorAfterSetterCalls() {
        // Given
        Event event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        Student student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        EventParticipant participant = new EventParticipant(event, student);
        Instant originalEnrolledAt = participant.getEnrolledAt();

        // When
        participant.setEvent(event);
        participant.setStudent(student);
        participant.setPresent(true);

        // Then
        assertThat(participant.getEnrolledAt()).isEqualTo(originalEnrolledAt);
    }
}
