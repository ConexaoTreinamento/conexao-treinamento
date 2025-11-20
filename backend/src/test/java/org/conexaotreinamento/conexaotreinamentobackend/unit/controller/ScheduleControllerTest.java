package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.SessionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;
import org.conexaotreinamento.conexaotreinamentobackend.service.ScheduleService;
import org.conexaotreinamento.conexaotreinamentobackend.controller.ScheduleController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerTest {

    @Mock
    private ScheduleService scheduleService;

    @InjectMocks
    private ScheduleController scheduleController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(scheduleController).build();
    }

    @Test
    void getSchedule_returnsOk_andWrapsSessions() throws Exception {
        // Arrange
        List<SessionResponseDTO> sessions = new ArrayList<>();
        // minimal DTO instance; controller does not dereference fields, just wraps list
        sessions.add(new SessionResponseDTO(
                "session",
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                List.of(),
                false,
                0
        ));
        when(scheduleService.getScheduledSessions(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(sessions);

        // Act + Assert
        mockMvc.perform(get("/schedule")
                .param("startDate", "2025-09-26")
                .param("endDate", "2025-09-26"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.sessions").isArray())
                .andExpect(jsonPath("$.sessions.length()").value(1));

        verify(scheduleService).getScheduledSessions(LocalDate.parse("2025-09-26"), LocalDate.parse("2025-09-26"));
    }

    @Test
    void updateSession_withNotesOnly_callsUpdateNotes() throws Exception {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        String body = "{ \"notes\": \"Bring water\" }";

        // Act
        mockMvc.perform(post("/schedule/sessions/{sessionId}", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Session updated successfully"));

        // Assert
        verify(scheduleService, times(1)).updateSessionNotes(eq(sessionId), eq("Bring water"));
        verify(scheduleService, never()).updateSessionParticipants(anyString(), anyList());
    }

    @Test
    void updateSession_withParticipantsOnly_callsUpdateParticipants() throws Exception {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        UUID studentId = UUID.randomUUID();
        String body = "{ \"participants\": [ { \"studentId\": \"" + studentId + "\", \"participationType\": \"INCLUDED\", \"present\": true } ] }";

        // Act
        mockMvc.perform(post("/schedule/sessions/{sessionId}", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Session updated successfully"));

        // Assert
        verify(scheduleService, times(1)).updateSessionParticipants(eq(sessionId), argThat(list -> {
            // basic validation on participants mapping
            return list != null && list.size() == 1 && list.get(0) instanceof SessionParticipant;
        }));
        verify(scheduleService, never()).updateSessionNotes(anyString(), anyString());
    }

    @Test
    void updateSession_withNotesAndParticipants_callsBoth() throws Exception {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        UUID studentId = UUID.randomUUID();
        String body = "{ \"notes\": \"Bring towel\", \"participants\": [ { \"studentId\": \"" + studentId + "\", \"participationType\": \"INCLUDED\", \"present\": false } ] }";

        // Act
        mockMvc.perform(post("/schedule/sessions/{sessionId}", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Session updated successfully"));

        // Assert
        verify(scheduleService, times(1)).updateSessionNotes(eq(sessionId), eq("Bring towel"));
        verify(scheduleService, times(1)).updateSessionParticipants(eq(sessionId), anyList());
    }

    @Test
    void updateSession_withEmptyPayload_callsNeitherServiceMethod() throws Exception {
        // Arrange
        String sessionId = "yoga-basics__2025-09-26__09:00";
        String body = "{}";

        // Act
        mockMvc.perform(post("/schedule/sessions/{sessionId}", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Session updated successfully"));

        // Assert
        verify(scheduleService, never()).updateSessionNotes(anyString(), anyString());
        verify(scheduleService, never()).updateSessionParticipants(anyString(), anyList());
    }

    @Test
    void getSession_returnsSession() throws Exception {
        String sessionId = "session-1";
        SessionResponseDTO session = new SessionResponseDTO(sessionId, null, null, null, null, null, null, false, List.of(), false, 0);
        when(scheduleService.getSessionById(sessionId, null)).thenReturn(session);

        mockMvc.perform(get("/schedule/sessions/{sessionId}", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionId));
    }

    @Test
    void updateSessionTrainer_callsService() throws Exception {
        String sessionId = "session-1";
        UUID trainerId = UUID.randomUUID();
        String body = "{ \"trainerId\": \"" + trainerId + "\" }";

        mockMvc.perform(post("/schedule/sessions/{sessionId}/trainer", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Trainer updated"));

        verify(scheduleService).updateSessionTrainer(sessionId, trainerId);
    }

    @Test
    void cancelOrRestoreSession_callsService() throws Exception {
        String sessionId = "session-1";
        String body = "{ \"cancel\": true }";

        mockMvc.perform(post("/schedule/sessions/{sessionId}/cancel", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Session status updated"));

        verify(scheduleService).cancelOrRestoreSession(sessionId, true);
    }

    @Test
    void addSessionParticipant_callsService() throws Exception {
        String sessionId = "session-1";
        UUID studentId = UUID.randomUUID();
        String body = "{ \"studentId\": \"" + studentId + "\" }";

        mockMvc.perform(post("/schedule/sessions/{sessionId}/participants", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Participant added"));

        verify(scheduleService).addParticipant(sessionId, studentId);
    }

    @Test
    void removeSessionParticipant_callsService() throws Exception {
        String sessionId = "session-1";
        UUID studentId = UUID.randomUUID();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/schedule/sessions/{sessionId}/participants/{studentId}", sessionId, studentId))
                .andExpect(status().isOk())
                .andExpect(content().string("Participant removed"));

        verify(scheduleService).removeParticipant(sessionId, studentId);
    }

    @Test
    void updatePresence_callsService() throws Exception {
        String sessionId = "session-1";
        UUID studentId = UUID.randomUUID();
        String body = "{ \"present\": true, \"notes\": \"On time\" }";

        mockMvc.perform(post("/schedule/sessions/{sessionId}/participants/{studentId}/presence", sessionId, studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Presence updated"));

        verify(scheduleService).updateParticipantPresence(sessionId, studentId, true, "On time");
    }

    @Test
    void addRegisteredParticipantExercise_callsService() throws Exception {
        String sessionId = "session-1";
        UUID studentId = UUID.randomUUID();
        UUID exerciseId = UUID.randomUUID();
        String body = "{ \"exerciseId\": \"" + exerciseId + "\", \"setsCompleted\": 3 }";
        
        org.conexaotreinamento.conexaotreinamentobackend.entity.ParticipantExercise pe = new org.conexaotreinamento.conexaotreinamentobackend.entity.ParticipantExercise();
        pe.setId(UUID.randomUUID());
        
        when(scheduleService.addParticipantExercise(eq(sessionId), eq(studentId), any(org.conexaotreinamento.conexaotreinamentobackend.dto.request.ParticipantExerciseCreateRequestDTO.class)))
            .thenReturn(pe);

        mockMvc.perform(post("/schedule/sessions/{sessionId}/participants/{studentId}/exercises", sessionId, studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("\"" + pe.getId().toString() + "\""));
    }

    @Test
    void updateRegisteredParticipantExercise_callsService() throws Exception {
        UUID exerciseRecordId = UUID.randomUUID();
        String body = "{ \"setsCompleted\": 4 }";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/schedule/sessions/participants/exercises/{exerciseRecordId}", exerciseRecordId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Exercise updated"));

        verify(scheduleService).updateParticipantExercise(eq(exerciseRecordId), any(org.conexaotreinamento.conexaotreinamentobackend.dto.request.ParticipantExerciseUpdateRequestDTO.class));
    }

    @Test
    void removeRegisteredParticipantExercise_callsService() throws Exception {
        UUID exerciseRecordId = UUID.randomUUID();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/schedule/sessions/participants/exercises/{exerciseRecordId}", exerciseRecordId))
                .andExpect(status().isOk())
                .andExpect(content().string("Exercise removed"));

        verify(scheduleService).removeParticipantExercise(exerciseRecordId);
    }

    @Test
    void createOneOffSession_callsService() throws Exception {
        String body = "{ \"seriesName\": \"Workshop\", \"startTime\": \"2025-10-01T14:00:00\", \"endTime\": \"2025-10-01T15:00:00\" }";
        SessionResponseDTO session = new SessionResponseDTO("oneoff", null, null, null, null, null, null, true, List.of(), false, 0);
        
        when(scheduleService.createOneOffSession(any(org.conexaotreinamento.conexaotreinamentobackend.dto.request.OneOffSessionCreateRequestDTO.class)))
            .thenReturn(session);

        mockMvc.perform(post("/schedule/sessions/one-off")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value("oneoff"));
    }
}
