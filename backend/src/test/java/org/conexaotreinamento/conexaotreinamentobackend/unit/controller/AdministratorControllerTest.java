package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import org.conexaotreinamento.conexaotreinamentobackend.controller.AdministratorController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.AdministratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@ExtendWith(MockitoExtension.class)
class AdministratorControllerTest {

    @Mock
    private AdministratorService administratorService;

    @InjectMocks
    private AdministratorController administratorController;

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(administratorController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    void createAdministratorAndUser_returnsCreated() throws Exception {
        String body = "{ \"firstName\": \"Admin\", \"lastName\": \"User\", \"email\": \"admin@example.com\", \"password\": \"password123\" }";
        AdministratorListItemResponseDTO response = new AdministratorListItemResponseDTO(UUID.randomUUID(), "Admin", "User", "admin@example.com", "Admin User", true, null);
        
        when(administratorService.create(any(AdministratorCreateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/administrators")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Admin"));
    }

    @Test
    void findAdministratorById_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        AdministratorListItemResponseDTO response = new AdministratorListItemResponseDTO(id, "Admin", "User", "admin@example.com", "Admin User", true, null);
        
        when(administratorService.findById(id)).thenReturn(response);

        mockMvc.perform(get("/administrators/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void findAdministratorByUserId_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();
        AdministratorListItemResponseDTO response = new AdministratorListItemResponseDTO(UUID.randomUUID(), "Admin", "User", "admin@example.com", "Admin User", true, null);
        
        when(administratorService.findByUserId(userId)).thenReturn(response);

        mockMvc.perform(get("/administrators/user-profile/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Admin"));
    }

    @Test
    void findAllAdministrators_returnsOk() throws Exception {
        AdministratorListItemResponseDTO response = new AdministratorListItemResponseDTO(UUID.randomUUID(), "Admin", "User", "admin@example.com", "Admin User", true, null);
        
        when(administratorService.findAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/administrators"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Admin"));
    }

    @Test
    void test_returnsOk() throws Exception {
        mockMvc.perform(get("/administrators/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Endpoint funcionando sem autenticação!"));
    }

    @Test
    void findAllPaginated_returnsOk() throws Exception {
        AdministratorListItemResponseDTO response = new AdministratorListItemResponseDTO(UUID.randomUUID(), "Admin", "User", "admin@example.com", "Admin User", true, null);
        Page<AdministratorListItemResponseDTO> page = new PageImpl<>(new ArrayList<>(List.of(response)), PageRequest.of(0, 10), 1);
        
        when(administratorService.findAll(any(), any(Pageable.class), anyBoolean())).thenReturn(page);

        mockMvc.perform(get("/administrators/paginated"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].firstName").value("Admin"));
    }

    @Test
    void updateAdministratorAndUser_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        String body = "{ \"firstName\": \"Admin Updated\", \"lastName\": \"User\", \"email\": \"admin@example.com\", \"password\": \"password123\" }";
        AdministratorResponseDTO response = new AdministratorResponseDTO(id, "Admin", "Updated", "admin@example.com", "Admin Updated", true, null, null);
        
        when(administratorService.put(eq(id), any(AdministratorCreateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/administrators/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Admin"));
    }

    @Test
    void patchAdministrator_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        String body = "{ \"firstName\": \"Admin Patched\" }";
        AdministratorResponseDTO response = new AdministratorResponseDTO(id, "Admin", "Patched", "admin@example.com", "Admin Patched", true, null, null);
        
        when(administratorService.patch(eq(id), any(PatchAdministratorRequestDTO.class))).thenReturn(response);

        mockMvc.perform(patch("/administrators/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Admin"));
    }

    @Test
    void softDeleteAdministratorUser_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();
        
        doNothing().when(administratorService).delete(id);

        mockMvc.perform(delete("/administrators/{id}", id))
                .andExpect(status().isNoContent());
        
        verify(administratorService).delete(id);
    }

    @Test
    void restoreAdministrator_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        AdministratorResponseDTO response = new AdministratorResponseDTO(id, "Admin", "User", "admin@example.com", "Admin User", true, null, null);
        
        when(administratorService.restore(id)).thenReturn(response);

        mockMvc.perform(patch("/administrators/{id}/restore", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Admin"));
    }
}
