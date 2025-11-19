package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import org.conexaotreinamento.conexaotreinamentobackend.controller.TrainerController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.TrainerPasswordResetRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.service.TrainerService;
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
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TrainerControllerTest {

    @Mock
    private TrainerService trainerService;

    @InjectMocks
    private TrainerController trainerController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(trainerController).build();
    }

    @Test
    void createTrainerAndUser_returnsCreated() throws Exception {
        String body = "{ \"name\": \"Trainer\", \"email\": \"trainer@example.com\", \"password\": \"pass\", \"phone\": \"123\", \"birthDate\": \"1990-01-01\", \"specialties\": [\"Yoga\"], \"compensationType\": \"MONTHLY\" }";
        TrainerListItemResponseDTO response = new TrainerListItemResponseDTO(UUID.randomUUID(), "Trainer", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, true, Instant.now());
        
        when(trainerService.create(any(TrainerCreateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/trainers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Trainer"));
    }

    @Test
    void findTrainerById_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        TrainerListItemResponseDTO response = new TrainerListItemResponseDTO(id, "Trainer", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, true, Instant.now());
        
        when(trainerService.findById(id)).thenReturn(response);

        mockMvc.perform(get("/trainers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void findTrainerByUserId_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();
        TrainerListItemResponseDTO response = new TrainerListItemResponseDTO(UUID.randomUUID(), "Trainer", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, true, Instant.now());
        
        when(trainerService.findByUserId(userId)).thenReturn(response);

        mockMvc.perform(get("/trainers/user-profile/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Trainer"));
    }

    @Test
    void findAllTrainers_returnsOk() throws Exception {
        TrainerListItemResponseDTO response = new TrainerListItemResponseDTO(UUID.randomUUID(), "Trainer", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, true, Instant.now());
        
        when(trainerService.findAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/trainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Trainer"));
    }

    @Test
    void updateTrainerAndUser_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        String body = "{ \"name\": \"Trainer Updated\", \"email\": \"trainer@example.com\", \"password\": \"pass\", \"phone\": \"123\", \"birthDate\": \"1990-01-01\", \"specialties\": [\"Yoga\"], \"compensationType\": \"MONTHLY\" }";
        TrainerResponseDTO response = new TrainerResponseDTO(id, "Trainer Updated", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, Instant.now());
        
        when(trainerService.put(eq(id), any(TrainerCreateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/trainers/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Trainer Updated"));
    }

    @Test
    void softDeleteTrainerUser_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();
        
        doNothing().when(trainerService).delete(id);

        mockMvc.perform(delete("/trainers/{id}", id))
                .andExpect(status().isNoContent());
        
        verify(trainerService).delete(id);
    }

    @Test
    void restoreTrainer_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        TrainerListItemResponseDTO response = new TrainerListItemResponseDTO(id, "Trainer", "trainer@example.com", "123", "Address", LocalDate.of(1990, 1, 1), List.of("Yoga"), CompensationType.MONTHLY, true, Instant.now());
        
        when(trainerService.restore(id)).thenReturn(response);

        mockMvc.perform(patch("/trainers/{id}/restore", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Trainer"));
    }

    @Test
    void resetPassword_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();
        String body = "{ \"newPassword\": \"newPass\" }";
        
        doNothing().when(trainerService).resetPassword(id, "newPass");

        mockMvc.perform(patch("/trainers/{id}/reset-password", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isNoContent());
        
        verify(trainerService).resetPassword(id, "newPass");
    }
}
