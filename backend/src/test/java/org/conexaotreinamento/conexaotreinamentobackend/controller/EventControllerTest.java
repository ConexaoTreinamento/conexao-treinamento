package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.EventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchEventRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.EventResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.EventService;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventController Unit Tests")
class EventControllerTest {

    @Mock
    private EventService eventService;

    @Mock
    private StudentService studentService;

    @Mock
    private TrainerService trainerService;

    @InjectMocks
    private EventController eventController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID eventId;
    private UUID trainerId;
    private UUID studentId;
    private EventRequestDTO eventRequestDTO;
    private PatchEventRequestDTO patchRequestDTO;
    private EventResponseDTO eventResponseDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);
        
        mockMvc = MockMvcBuilders.standaloneSetup(eventController)
                .setMessageConverters(converter)
                .build();

        eventId = UUID.randomUUID();
        trainerId = UUID.randomUUID();
        studentId = UUID.randomUUID();

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

        eventResponseDTO = new EventResponseDTO(
                eventId,
                "Test Event",
                LocalDate.of(2024, 12, 25),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Test Location",
                "Test Description",
                trainerId,
                "John Trainer",
                List.of(),
                Instant.now(),
                Instant.now(),
                null
        );

    }

    @Test
    @DisplayName("Should create event successfully")
    void shouldCreateEventSuccessfully() throws Exception {
        // Given
        when(eventService.createEvent(any(EventRequestDTO.class))).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"))
                .andExpect(jsonPath("$.date").value("2024-12-25"))
                .andExpect(jsonPath("$.startTime").value("10:00:00"))
                .andExpect(jsonPath("$.endTime").value("11:00:00"))
                .andExpect(jsonPath("$.location").value("Test Location"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.instructorId").value(trainerId.toString()))
                .andExpect(jsonPath("$.instructor").value("John Trainer"));
    }

    @Test
    @DisplayName("Should find event by ID successfully")
    void shouldFindEventByIdSuccessfully() throws Exception {
        // Given
        when(eventService.findEventById(eventId)).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(get("/events/{id}", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should find all events without parameters")
    void shouldFindAllEventsWithoutParameters() throws Exception {
        // Given
        List<EventResponseDTO> events = Arrays.asList(eventResponseDTO);
        when(eventService.findAllEvents(null, false)).thenReturn(events);

        // When & Then
        mockMvc.perform(get("/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(eventId.toString()))
                .andExpect(jsonPath("$[0].name").value("Test Event"));
    }

    @Test
    @DisplayName("Should find all events with search parameter")
    void shouldFindAllEventsWithSearchParameter() throws Exception {
        // Given
        List<EventResponseDTO> events = Arrays.asList(eventResponseDTO);
        when(eventService.findAllEvents("test", false)).thenReturn(events);

        // When & Then
        mockMvc.perform(get("/events")
                        .param("search", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(eventId.toString()));
    }

    @Test
    @DisplayName("Should find all events including inactive")
    void shouldFindAllEventsIncludingInactive() throws Exception {
        // Given
        List<EventResponseDTO> events = Arrays.asList(eventResponseDTO);
        when(eventService.findAllEvents(null, true)).thenReturn(events);

        // When & Then
        mockMvc.perform(get("/events")
                        .param("includeInactive", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(eventId.toString()));
    }

    @Test
    @DisplayName("Should update event successfully")
    void shouldUpdateEventSuccessfully() throws Exception {
        // Given
        when(eventService.updateEvent(eq(eventId), any(EventRequestDTO.class))).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(put("/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should patch event successfully")
    void shouldPatchEventSuccessfully() throws Exception {
        // Given
        when(eventService.patchEvent(eq(eventId), any(PatchEventRequestDTO.class))).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(patch("/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patchRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should delete event successfully")
    void shouldDeleteEventSuccessfully() throws Exception {
        // Given
        // No return value needed for void method

        // When & Then
        mockMvc.perform(delete("/events/{id}", eventId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should restore event successfully")
    void shouldRestoreEventSuccessfully() throws Exception {
        // Given
        when(eventService.restoreEvent(eventId)).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(patch("/events/{id}/restore", eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should add participant successfully")
    void shouldAddParticipantSuccessfully() throws Exception {
        // Given
        when(eventService.addParticipant(eventId, studentId)).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(post("/events/{id}/participants/{studentId}", eventId, studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should remove participant successfully")
    void shouldRemoveParticipantSuccessfully() throws Exception {
        // Given
        // No return value needed for void method

        // When & Then
        mockMvc.perform(delete("/events/{id}/participants/{studentId}", eventId, studentId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should toggle attendance successfully")
    void shouldToggleAttendanceSuccessfully() throws Exception {
        // Given
        when(eventService.toggleAttendance(eventId, studentId)).thenReturn(eventResponseDTO);

        // When & Then
        mockMvc.perform(patch("/events/{id}/participants/{studentId}/attendance", eventId, studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.name").value("Test Event"));
    }

    @Test
    @DisplayName("Should get students for lookup successfully")
    void shouldGetStudentsForLookupSuccessfully() throws Exception {
        // Given
        when(studentService.findAllActive()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/events/lookup/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should get trainers for lookup successfully")
    void shouldGetTrainersForLookupSuccessfully() throws Exception {
        // Given
        when(trainerService.findAll()).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/events/lookup/trainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Should validate request body for create event")
    void shouldValidateRequestBodyForCreateEvent() throws Exception {
        // Given
        EventRequestDTO invalidRequest = new EventRequestDTO(
                "", // Invalid: empty name
                null, // Invalid: null date
                null,
                null,
                null,
                null,
                null, // Invalid: null trainerId
                null
        );

        // When & Then
        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should validate request body for update event")
    void shouldValidateRequestBodyForUpdateEvent() throws Exception {
        // Given
        EventRequestDTO invalidRequest = new EventRequestDTO(
                "", // Invalid: empty name
                null, // Invalid: null date
                null,
                null,
                null,
                null,
                null, // Invalid: null trainerId
                null
        );

        // When & Then
        mockMvc.perform(put("/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should validate request body for patch event")
    void shouldValidateRequestBodyForPatchEvent() throws Exception {
        // Given
        PatchEventRequestDTO invalidRequest = new PatchEventRequestDTO(
                null,
                null,
                null,
                null,
                "x".repeat(256), // Invalid: location too long (max 255)
                null,
                null,
                null
        );

        // When & Then
        mockMvc.perform(patch("/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle malformed JSON")
    void shouldHandleMalformedJson() throws Exception {
        // When & Then
        mockMvc.perform(post("/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle missing content type")
    void shouldHandleMissingContentType() throws Exception {
        // When & Then
        mockMvc.perform(post("/events")
                        .content(objectMapper.writeValueAsString(eventRequestDTO)))
                .andExpect(status().isUnsupportedMediaType());
    }
}
