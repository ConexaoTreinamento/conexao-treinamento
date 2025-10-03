package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TrainerScheduleControllerTest {

    @Mock
    private TrainerScheduleService trainerScheduleService;

    @InjectMocks
    private TrainerScheduleController trainerScheduleController;

    private MockMvc mockMvc;

    private UUID trainerId;
    private UUID scheduleId;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(trainerScheduleController).build();
        trainerId = UUID.randomUUID();
        scheduleId = UUID.randomUUID();
    }

    private TrainerSchedule schedule(UUID id, UUID trainerId, int weekday, String start, String end, int interval, String seriesName) {
        TrainerSchedule ts = new TrainerSchedule();
        ts.setId(id);
        ts.setTrainerId(trainerId);
        ts.setWeekday(weekday);
        ts.setStartTime(LocalTime.parse(start));
        ts.setEndTime(LocalTime.parse(end));
        ts.setIntervalDuration(interval);
        ts.setSeriesName(seriesName);
        ts.setEffectiveFromTimestamp(Instant.now());
        ts.setActive(true);
        return ts;
    }

    @Test
    void getSchedulesByTrainer_returnsOk_andMapsList() throws Exception {
        // Arrange
        TrainerSchedule ts = schedule(UUID.randomUUID(), trainerId, 1, "08:00:00", "09:00:00", 45, "Pilates");
        when(trainerScheduleService.getSchedulesByTrainer(trainerId)).thenReturn(List.of(ts));

        // Act + Assert
        mockMvc.perform(get("/trainer-schedules/trainer/{trainerId}", trainerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].trainerId").value(trainerId.toString()))
                .andExpect(jsonPath("$[0].seriesName").value("Pilates"));

        verify(trainerScheduleService).getSchedulesByTrainer(trainerId);
    }

    @Test
    void getScheduleById_found_returnsOk() throws Exception {
        // Arrange
        TrainerSchedule ts = schedule(scheduleId, trainerId, 4, "11:00:00", "12:00:00", 30, "Strength");
        when(trainerScheduleService.getScheduleById(scheduleId)).thenReturn(Optional.of(ts));

        // Act + Assert
        mockMvc.perform(get("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(scheduleId.toString()))
                .andExpect(jsonPath("$.seriesName").value("Strength"));
    }

    @Test
    void getScheduleById_notFound_returns404() throws Exception {
        when(trainerScheduleService.getScheduleById(scheduleId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateSchedule_notFound_returns404() throws Exception {
        // Arrange
        String body = "{"
                + "\"trainerId\":\"" + trainerId + "\","
                + "\"weekday\":1,"
                + "\"startTime\":\"07:00:00\","
                + "\"endTime\":\"08:00:00\","
                + "\"intervalDuration\":60,"
                + "\"seriesName\":\"Morning Strength\""
                + "}";

        when(trainerScheduleService.updateSchedule(eq(scheduleId), org.mockito.ArgumentMatchers.any(TrainerSchedule.class)))
                .thenThrow(new RuntimeException("TrainerSchedule not found"));

        // Act + Assert
        mockMvc.perform(put("/trainer-schedules/{id}", scheduleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteSchedule_returns204_andInvokesService() throws Exception {
        // Act + Assert
        mockMvc.perform(delete("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isNoContent());

        verify(trainerScheduleService).deleteSchedule(scheduleId);
    }
}
