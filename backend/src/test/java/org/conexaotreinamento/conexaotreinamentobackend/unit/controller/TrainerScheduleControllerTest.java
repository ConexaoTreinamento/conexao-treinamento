package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.controller.TrainerScheduleController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerScheduleResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.TrainerScheduleMapper;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class TrainerScheduleControllerTest {

    @Mock
    private TrainerScheduleService trainerScheduleService;

    @Mock
    private TrainerScheduleMapper scheduleMapper;

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

    private TrainerSchedule schedule(UUID id, UUID trainerId, int weekday, String start, int interval, String seriesName) {
        TrainerSchedule ts = new TrainerSchedule();
        ts.setId(id);
        ts.setTrainerId(trainerId);
        ts.setWeekday(weekday);
        ts.setStartTime(LocalTime.parse(start));
        ts.setIntervalDuration(interval);
        ts.setSeriesName(seriesName);
        ts.setEffectiveFromTimestamp(Instant.now());
        ts.setActive(true);
        return ts;
    }

    @Test
    void getSchedulesByTrainer_returnsOk_andMapsList() throws Exception {
        // Arrange
        TrainerSchedule ts = schedule(UUID.randomUUID(), trainerId, 1, "08:00:00", 45, "Pilates");
        TrainerScheduleResponseDTO responseDTO = new TrainerScheduleResponseDTO(
                ts.getId(), ts.getTrainerId(), ts.getWeekday(), ts.getStartTime(),
                ts.getIntervalDuration(), ts.getSeriesName(), ts.getEffectiveFromTimestamp(),
                Instant.now(), Instant.now(), ts.isActive()
        );
        when(trainerScheduleService.getSchedulesByTrainer(trainerId)).thenReturn(List.of(ts));
        when(scheduleMapper.toResponse(ts)).thenReturn(responseDTO);

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
        TrainerSchedule ts = schedule(scheduleId, trainerId, 4, "11:00:00", 30, "Strength");
        TrainerScheduleResponseDTO responseDTO = new TrainerScheduleResponseDTO(
                ts.getId(), ts.getTrainerId(), ts.getWeekday(), ts.getStartTime(),
                ts.getIntervalDuration(), ts.getSeriesName(), ts.getEffectiveFromTimestamp(),
                Instant.now(), Instant.now(), ts.isActive()
        );
        when(trainerScheduleService.getScheduleById(scheduleId)).thenReturn(Optional.of(ts));
        when(scheduleMapper.toResponse(ts)).thenReturn(responseDTO);

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
    void deleteSchedule_returns204_andInvokesService() throws Exception {
        // Act + Assert
        mockMvc.perform(delete("/trainer-schedules/{id}", scheduleId))
                .andExpect(status().isNoContent());

        verify(trainerScheduleService).deleteSchedule(scheduleId);
    }
}
