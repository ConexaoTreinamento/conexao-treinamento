package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.conexaotreinamento.conexaotreinamentobackend.entity.EventParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventParticipantRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.EventService;
import org.conexaotreinamento.conexaotreinamentobackend.repository.EventRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventService Unit Tests")
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventParticipantRepository participantRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @InjectMocks
    private EventService eventService;

    private UUID eventId;
    private UUID trainerId;
    private UUID studentId;
    private Event event;
    private Trainer trainer;
    private Student student;
    private EventRequestDTO eventRequestDTO;
    private PatchEventRequestDTO patchRequestDTO;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        trainerId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        // Create trainer
        trainer = new Trainer();
        setIdViaReflection(trainer, trainerId);
        trainer.setName("John Trainer");
        trainer.setPhone("+1234567890");
        trainer.setAddress("123 Main St");
        trainer.setBirthDate(LocalDate.of(1990, 1, 1));
        trainer.setSpecialties(Arrays.asList("Strength Training", "Cardio"));

        // Create student
        student = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        setIdViaReflection(student, studentId);

        // Create event
        event = new Event("Test Event", LocalDate.of(2024, 12, 25));
        setIdViaReflection(event, eventId);
        event.setStartTime(LocalTime.of(10, 0));
        event.setEndTime(LocalTime.of(11, 0));
        event.setLocation("Test Location");
        event.setDescription("Test Description");
        event.setTrainer(trainer);

        // Create DTOs
        eventRequestDTO = new EventRequestDTO(
                "Test Event",
                LocalDate.of(2024, 12, 25),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Test Location",
                "Test Description",
                trainerId,
                Arrays.asList(studentId)
        );

        patchRequestDTO = new PatchEventRequestDTO(
                "Updated Event",
                null,
                null,
                null,
                "Updated Location",
                "Updated Description",
                null,
                null
        );
    }

    private void setIdViaReflection(Object entity, UUID id) {
        try {
            Field field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            fail("Failed to set ID via reflection: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Should create event successfully")
    void shouldCreateEventSuccessfully() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(false);

        // When
        EventResponseDTO result = eventService.createEvent(eventRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Test Event");
        assertThat(result.date()).isEqualTo(LocalDate.of(2024, 12, 25));
        assertThat(result.startTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(result.endTime()).isEqualTo(LocalTime.of(11, 0));
        assertThat(result.location()).isEqualTo("Test Location");
        assertThat(result.description()).isEqualTo("Test Description");
        assertThat(result.instructorId()).isEqualTo(trainerId);
        assertThat(result.instructor()).isEqualTo("John Trainer");

        verify(eventRepository).save(any(Event.class));
        verify(participantRepository).save(any(EventParticipant.class));
    }

    @Test
    @DisplayName("Should create event without participants")
    void shouldCreateEventWithoutParticipants() {
        // Given
        EventRequestDTO requestWithoutParticipants = new EventRequestDTO(
                "Test Event",
                LocalDate.of(2024, 12, 25),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Test Location",
                "Test Description",
                trainerId,
                null
        );

        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.createEvent(requestWithoutParticipants);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Test Event");

        verify(eventRepository).save(any(Event.class));
        verify(participantRepository, never()).save(any(EventParticipant.class));
    }

    @Test
    @DisplayName("Should throw exception when trainer not found")
    void shouldThrowExceptionWhenTrainerNotFound() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.createEvent(eventRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Trainer not found");
    }

    @Test
    @DisplayName("Should throw exception when trainer ID is null")
    void shouldThrowExceptionWhenTrainerIdIsNull() {
        // Given
        EventRequestDTO requestWithNullTrainer = new EventRequestDTO(
                "Test Event",
                LocalDate.of(2024, 12, 25),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Test Location",
                "Test Description",
                null,
                null
        );

        // When & Then
        assertThatThrownBy(() -> eventService.createEvent(requestWithNullTrainer))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Trainer is required");
    }

    @Test
    @DisplayName("Should throw exception when student not found")
    void shouldThrowExceptionWhenStudentNotFound() {
        // Given
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        // When & Then
        assertThatThrownBy(() -> eventService.createEvent(eventRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Student not found: " + studentId);
    }

    @Test
    @DisplayName("Should find event by ID successfully")
    void shouldFindEventByIdSuccessfully() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.findEventById(eventId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(eventId);
        assertThat(result.name()).isEqualTo("Test Event");

        verify(eventRepository).findByIdAndDeletedAtIsNull(eventId);
    }

    @Test
    @DisplayName("Should throw exception when event not found")
    void shouldThrowExceptionWhenEventNotFound() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.findEventById(eventId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Event not found");
    }

    @Test
    @DisplayName("Should find all events without search term")
    void shouldFindAllEventsWithoutSearchTerm() {
        // Given
        List<Event> events = Arrays.asList(event);
        when(eventRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()).thenReturn(events);

        // When
        List<EventResponseDTO> result = eventService.findAllEvents(null, false);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Test Event");

        verify(eventRepository).findByDeletedAtIsNullOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("Should find all events with search term")
    void shouldFindAllEventsWithSearchTerm() {
        // Given
        String searchTerm = "test";
        List<Event> events = Arrays.asList(event);
        when(eventRepository.findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc("%test%")).thenReturn(events);

        // When
        List<EventResponseDTO> result = eventService.findAllEvents(searchTerm, false);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Test Event");

        verify(eventRepository).findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc("%test%");
    }

    @Test
    @DisplayName("Should find all events including inactive")
    void shouldFindAllEventsIncludingInactive() {
        // Given
        List<Event> events = Arrays.asList(event);
        when(eventRepository.findAllByOrderByCreatedAtDesc()).thenReturn(events);

        // When
        List<EventResponseDTO> result = eventService.findAllEvents(null, true);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Test Event");

        verify(eventRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("Should update event successfully")
    void shouldUpdateEventSuccessfully() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(false);

        // When
        EventResponseDTO result = eventService.updateEvent(eventId, eventRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Test Event");

        verify(eventRepository).findByIdAndDeletedAtIsNull(eventId);
        verify(participantRepository).save(any(EventParticipant.class));
    }

    @Test
    @DisplayName("Should patch event successfully")
    void shouldPatchEventSuccessfully() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.patchEvent(eventId, patchRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Updated Event");
        assertThat(result.location()).isEqualTo("Updated Location");
        assertThat(result.description()).isEqualTo("Updated Description");

        verify(eventRepository).findByIdAndDeletedAtIsNull(eventId);
    }

    @Test
    @DisplayName("Should delete event successfully")
    void shouldDeleteEventSuccessfully() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));

        // When
        eventService.deleteEvent(eventId);

        // Then
        verify(eventRepository).findByIdAndDeletedAtIsNull(eventId);
        verify(eventRepository).save(event);
        assertThat(event.isInactive()).isTrue();
    }

    @Test
    @DisplayName("Should restore event successfully")
    void shouldRestoreEventSuccessfully() {
        // Given
        event.deactivate();
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.restoreEvent(eventId);

        // Then
        assertThat(result).isNotNull();
        assertThat(event.isActive()).isTrue();
        verify(eventRepository).save(event);
    }

    @Test
    @DisplayName("Should throw exception when restoring active event")
    void shouldThrowExceptionWhenRestoringActiveEvent() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // When & Then
        assertThatThrownBy(() -> eventService.restoreEvent(eventId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Event is already active");
    }

    @Test
    @DisplayName("Should add participant successfully")
    void shouldAddParticipantSuccessfully() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(false);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.addParticipant(eventId, studentId);

        // Then
        assertThat(result).isNotNull();
        verify(participantRepository).save(any(EventParticipant.class));
    }

    @Test
    @DisplayName("Should throw exception when adding existing participant")
    void shouldThrowExceptionWhenAddingExistingParticipant() {
        // Given
        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> eventService.addParticipant(eventId, studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("Student already enrolled in this event");
    }

    @Test
    @DisplayName("Should remove participant successfully")
    void shouldRemoveParticipantSuccessfully() {
        // Given
        when(eventRepository.existsByIdAndDeletedAtIsNull(eventId)).thenReturn(true);
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(true);

        // When
        eventService.removeParticipant(eventId, studentId);

        // Then
        verify(participantRepository).deleteByEventIdAndStudentId(eventId, studentId);
    }

    @Test
    @DisplayName("Should throw exception when removing participant from non-existent event")
    void shouldThrowExceptionWhenRemovingParticipantFromNonExistentEvent() {
        // Given
        when(eventRepository.existsByIdAndDeletedAtIsNull(eventId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> eventService.removeParticipant(eventId, studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Event not found");
    }

    @Test
    @DisplayName("Should throw exception when removing non-enrolled participant")
    void shouldThrowExceptionWhenRemovingNonEnrolledParticipant() {
        // Given
        when(eventRepository.existsByIdAndDeletedAtIsNull(eventId)).thenReturn(true);
        when(participantRepository.existsByEventIdAndStudentId(eventId, studentId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> eventService.removeParticipant(eventId, studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Student not enrolled in this event");
    }

    @Test
    @DisplayName("Should toggle attendance successfully")
    void shouldToggleAttendanceSuccessfully() {
        // Given
        EventParticipant participant = new EventParticipant(event, student);
        participant.setPresent(false);
        
        when(participantRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(participant));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // When
        EventResponseDTO result = eventService.toggleAttendance(eventId, studentId);

        // Then
        assertThat(result).isNotNull();
        assertThat(participant.getPresent()).isTrue();
        verify(participantRepository).save(participant);
    }

    @Test
    @DisplayName("Should throw exception when toggling attendance for non-existent participant")
    void shouldThrowExceptionWhenTogglingAttendanceForNonExistentParticipant() {
        // Given
        when(participantRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> eventService.toggleAttendance(eventId, studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("Participant not found");
    }

    @Test
    @DisplayName("Should find all events with search term including inactive")
    void shouldFindAllEventsWithSearchTermIncludingInactive() {
        // Given
        String searchTerm = "test";
        List<Event> events = Arrays.asList(event);
        when(eventRepository.findBySearchTermIncludingInactiveOrderByCreatedAtDesc("%test%")).thenReturn(events);

        // When
        List<EventResponseDTO> result = eventService.findAllEvents(searchTerm, true);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Test Event");

        verify(eventRepository).findBySearchTermIncludingInactiveOrderByCreatedAtDesc("%test%");
    }

    @Test
    @DisplayName("Should update event removing participants")
    void shouldUpdateEventRemovingParticipants() {
        // Given
        // Setup existing participant
        EventParticipant existingParticipant = new EventParticipant(event, student);
        List<EventParticipant> participants = new ArrayList<>();
        participants.add(existingParticipant);
        event.setParticipants(participants);

        // Request with NO participants (empty list)
        EventRequestDTO requestEmptyParticipants = new EventRequestDTO(
                "Updated Event",
                LocalDate.of(2024, 12, 26),
                LocalTime.of(12, 0),
                LocalTime.of(13, 0),
                "Updated Location",
                "Updated Description",
                trainerId,
                Collections.emptyList()
        );

        when(eventRepository.findByIdAndDeletedAtIsNull(eventId)).thenReturn(Optional.of(event));
        when(trainerRepository.findById(trainerId)).thenReturn(Optional.of(trainer));
        
        // When
        EventResponseDTO result = eventService.updateEvent(eventId, requestEmptyParticipants);

        // Then
        assertThat(result).isNotNull();
        // Verify delete was called
        verify(participantRepository).delete(existingParticipant);
        // Verify list is empty
        assertThat(event.getParticipants()).isEmpty();
    }
}
