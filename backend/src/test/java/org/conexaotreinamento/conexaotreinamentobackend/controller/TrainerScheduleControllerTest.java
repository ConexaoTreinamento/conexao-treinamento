package org.conexaotreinamento.conexaotreinamentobackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerScheduleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TrainerScheduleControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TrainerScheduleService trainerScheduleService;

    @InjectMocks
    private TrainerScheduleController trainerScheduleController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(trainerScheduleController).build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules(); // For Java 8 date/time types
    }

    @Test
    void getAllSchedules_ShouldReturnListOfSchedules() throws Exception {
        TrainerSchedule schedule1 = createTrainerSchedule(UUID.randomUUID(), "Series 1");
        TrainerSchedule schedule2 = createTrainerSchedule(UUID.randomUUID(), "Series 2");
        List<TrainerSchedule> schedules = Arrays.asList(schedule1, schedule2);

        when(trainerScheduleService.getAllActiveSchedules()).thenReturn(schedules);

        mockMvc.perform(get("/trainer-schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].seriesName").value("Series 1"))
                .andExpect(jsonPath("$[1].seriesName").value("Series 2"));
    }

    @Test
    void getSchedulesByTrainer_ShouldReturnSchedulesForTrainer() throws Exception {
        UUID trainerId = UUID.randomUUID();
        TrainerSchedule schedule1 = createTrainerSchedule(trainerId, "Series 1");
        List<TrainerSchedule> schedules = Arrays.asList(schedule1);

        when(trainerScheduleService.getSchedulesByTrainer(trainerId)).thenReturn(schedules);

        mockMvc.perform(get("/trainer-schedules/trainer/{trainerId}", trainerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].trainerId").value(trainerId.toString()));
    }

    @Test
    void getScheduleById_ShouldReturnSchedule() throws Exception {
        UUID scheduleId = UUID.randomUUID();
        TrainerSchedule schedule = createTrainerSchedule(UUID.randomUUID(), "Series 1");
        schedule.setId(scheduleId);

        when(trainerScheduleService.getScheduleById(scheduleId)).thenReturn(Optional.of(schedule));

        mockMvc.perform(get("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(scheduleId.toString()));
    }

    @Test
    void getScheduleById_ShouldReturnNotFound_WhenScheduleDoesNotExist() throws Exception {
        UUID scheduleId = UUID.randomUUID();

        when(trainerScheduleService.getScheduleById(scheduleId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createSchedule_ShouldReturnCreatedSchedule() throws Exception {
        UUID trainerId = UUID.randomUUID();
        TrainerScheduleRequestDTO requestDTO = new TrainerScheduleRequestDTO(
                trainerId, 1, LocalTime.of(10, 0), 60, "New Series"
        );
        TrainerSchedule createdSchedule = createTrainerSchedule(trainerId, "New Series");
        createdSchedule.setWeekday(1);
        createdSchedule.setStartTime(LocalTime.of(10, 0));

        when(trainerScheduleService.createSchedule(any(TrainerSchedule.class))).thenReturn(createdSchedule);

        mockMvc.perform(post("/trainer-schedules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.seriesName").value("New Series"));
    }

    @Test
    void updateSchedule_ShouldReturnUpdatedSchedule() throws Exception {
        UUID scheduleId = UUID.randomUUID();
        UUID trainerId = UUID.randomUUID();
        TrainerScheduleRequestDTO requestDTO = new TrainerScheduleRequestDTO(
                trainerId, 1, LocalTime.of(10, 0), 60, "Updated Series"
        );
        TrainerSchedule updatedSchedule = createTrainerSchedule(trainerId, "Updated Series");
        updatedSchedule.setId(scheduleId);

        when(trainerScheduleService.updateSchedule(eq(scheduleId), any(TrainerSchedule.class))).thenReturn(updatedSchedule);

        mockMvc.perform(put("/trainer-schedules/{id}", scheduleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.seriesName").value("Updated Series"));
    }

    @Test
    void updateSchedule_ShouldReturnNotFound_WhenServiceThrowsException() throws Exception {
        UUID scheduleId = UUID.randomUUID();
        UUID trainerId = UUID.randomUUID();
        TrainerScheduleRequestDTO requestDTO = new TrainerScheduleRequestDTO(
                trainerId, 1, LocalTime.of(10, 0), 60, "Updated Series"
        );

        when(trainerScheduleService.updateSchedule(eq(scheduleId), any(TrainerSchedule.class)))
                .thenThrow(new RuntimeException("Schedule not found"));

        mockMvc.perform(put("/trainer-schedules/{id}", scheduleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteSchedule_ShouldReturnNoContent() throws Exception {
        UUID scheduleId = UUID.randomUUID();

        mockMvc.perform(delete("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isNoContent());
    }

    private TrainerSchedule createTrainerSchedule(UUID trainerId, String seriesName) {
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setId(UUID.randomUUID());
        schedule.setTrainerId(trainerId);
        schedule.setWeekday(1);
        schedule.setStartTime(LocalTime.of(9, 0));
        schedule.setIntervalDuration(60);
        schedule.setSeriesName(seriesName);
        schedule.setEffectiveFromTimestamp(Instant.now());
        schedule.setCreatedAt(Instant.now());
        schedule.setUpdatedAt(Instant.now());
        schedule.setActive(true);
        return schedule;
    }
}
