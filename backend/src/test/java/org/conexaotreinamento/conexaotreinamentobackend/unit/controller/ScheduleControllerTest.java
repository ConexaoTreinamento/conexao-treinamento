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
}
