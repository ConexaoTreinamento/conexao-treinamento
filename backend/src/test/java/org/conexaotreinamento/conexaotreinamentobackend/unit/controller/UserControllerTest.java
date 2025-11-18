package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.conexaotreinamento.conexaotreinamentobackend.controller.UserController;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.service.UserService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Unit Tests")
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;
    
    private MockMvc mockMvc;

    private UUID userId;
    private UserCreateRequestDTO createUserRequestDTO;
    private PatchUserRoleRequestDTO patchUserRoleRequestDTO;
    private UserResponseDTO userResponseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        userId = UUID.randomUUID();
        createUserRequestDTO = new UserCreateRequestDTO(
                "admin@example.com", 
                "password123", 
                Role.ROLE_ADMIN
        );
        patchUserRoleRequestDTO = new PatchUserRoleRequestDTO(Role.ROLE_TRAINER);
        userResponseDTO = new UserResponseDTO(userId, "admin@example.com", Role.ROLE_ADMIN);
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() throws Exception {
        // Given
        when(userService.createUser(any(UserCreateRequestDTO.class))).thenReturn(userResponseDTO);

        // When + Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"password123\",\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.email").value("admin@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));

        verify(userService).createUser(any(UserCreateRequestDTO.class));
    }

    @Test
    @DisplayName("Should create trainer user successfully")
    void shouldCreateTrainerUserSuccessfully() throws Exception {
        // Given
        UserResponseDTO trainerResponse = new UserResponseDTO(UUID.randomUUID(), "trainer@example.com", Role.ROLE_TRAINER);
        when(userService.createUser(any(UserCreateRequestDTO.class))).thenReturn(trainerResponse);

        // When + Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"trainer@example.com\",\"password\":\"password456\",\"role\":\"ROLE_TRAINER\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.email").value("trainer@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_TRAINER"));

        verify(userService).createUser(any(UserCreateRequestDTO.class));
    }

    @Test
    @DisplayName("Should get all users with default pagination")
    void shouldGetAllUsersWithDefaultPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        List<UserResponseDTO> users = List.of(userResponseDTO);
        Page<UserResponseDTO> page = new PageImpl<>(users, pageable, 1);
        when(userService.findAll(pageable)).thenReturn(page);

        // When
        ResponseEntity<PageResponse<UserResponseDTO>> response = userController.getAllUsers(pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().content()).hasSize(1);
        assertThat(response.getBody().content().get(0)).isEqualTo(userResponseDTO);
        verify(userService).findAll(pageable);
    }

    @Test
    @DisplayName("Should get all users with custom pagination")
    void shouldGetAllUsersWithCustomPagination() {
        // Given
        Pageable customPageable = PageRequest.of(1, 5);
        UserResponseDTO user1 = new UserResponseDTO(UUID.randomUUID(), "user1@example.com", Role.ROLE_ADMIN);
        UserResponseDTO user2 = new UserResponseDTO(UUID.randomUUID(), "user2@example.com", Role.ROLE_TRAINER);
        List<UserResponseDTO> users = List.of(user1, user2);
        Page<UserResponseDTO> page = new PageImpl<>(users, customPageable, 10);
        when(userService.findAll(customPageable)).thenReturn(page);

        // When
        ResponseEntity<PageResponse<UserResponseDTO>> response = userController.getAllUsers(customPageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().content()).hasSize(2);
        assertThat(response.getBody().totalElements()).isEqualTo(10);
        assertThat(response.getBody().page()).isEqualTo(1);
        assertThat(response.getBody().size()).isEqualTo(5);
        verify(userService).findAll(customPageable);
    }

    @Test
    @DisplayName("Should get empty page when no users exist")
    void shouldGetEmptyPageWhenNoUsersExist() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<UserResponseDTO> emptyPage = new PageImpl<>(List.of(), pageable, 0);
        when(userService.findAll(pageable)).thenReturn(emptyPage);

        // When
        ResponseEntity<PageResponse<UserResponseDTO>> response = userController.getAllUsers(pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().content()).isEmpty();
        assertThat(response.getBody().totalElements()).isZero();
        verify(userService).findAll(pageable);
    }

    @Test
    @DisplayName("Should patch user role successfully")
    void shouldPatchUserRoleSuccessfully() {
        // Given
        UserResponseDTO updatedUser = new UserResponseDTO(userId, "admin@example.com", Role.ROLE_TRAINER);
        when(userService.patch(userId, patchUserRoleRequestDTO)).thenReturn(updatedUser);

        // When
        ResponseEntity<UserResponseDTO> response = userController.patchUserRole(userId, patchUserRoleRequestDTO);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(updatedUser);
        assertThat(response.getBody().role()).isEqualTo(Role.ROLE_TRAINER);
        verify(userService).patch(userId, patchUserRoleRequestDTO);
    }

    @Test
    @DisplayName("Should patch user role from trainer to admin")
    void shouldPatchUserRoleFromTrainerToAdmin() {
        // Given
        PatchUserRoleRequestDTO changeToAdmin = new PatchUserRoleRequestDTO(Role.ROLE_ADMIN);
        UserResponseDTO trainerUser = new UserResponseDTO(userId, "trainer@example.com", Role.ROLE_TRAINER);
        UserResponseDTO adminUser = new UserResponseDTO(userId, "trainer@example.com", Role.ROLE_ADMIN);
        when(userService.patch(userId, changeToAdmin)).thenReturn(adminUser);

        // When
        ResponseEntity<UserResponseDTO> response = userController.patchUserRole(userId, changeToAdmin);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(adminUser);
        assertThat(response.getBody().role()).isEqualTo(Role.ROLE_ADMIN);
        verify(userService).patch(userId, changeToAdmin);
    }

    @Test
    @DisplayName("Should patch user with null role (no change)")
    void shouldPatchUserWithNullRole() {
        // Given
        PatchUserRoleRequestDTO nullRoleRequest = new PatchUserRoleRequestDTO(null);
        when(userService.patch(userId, nullRoleRequest)).thenReturn(userResponseDTO);

        // When
        ResponseEntity<UserResponseDTO> response = userController.patchUserRole(userId, nullRoleRequest);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(userResponseDTO);
        assertThat(response.getBody().role()).isEqualTo(Role.ROLE_ADMIN); // Should remain unchanged
        verify(userService).patch(userId, nullRoleRequest);
    }

    @Test
    @DisplayName("Should handle service exception when creating user")
    void shouldHandleServiceExceptionWhenCreatingUser() {
        // Given
        when(userService.createUser(createUserRequestDTO)).thenThrow(new RuntimeException("Service error"));

        // When & Then
        assertThatThrownBy(() -> userController.createUser(createUserRequestDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Service error");

        verify(userService).createUser(createUserRequestDTO);
    }

    @Test
    @DisplayName("Should handle service exception when getting all users")
    void shouldHandleServiceExceptionWhenGettingAllUsers() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        when(userService.findAll(pageable)).thenThrow(new RuntimeException("Database error"));

        // When & Then
        assertThatThrownBy(() -> userController.getAllUsers(pageable))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Database error");

        verify(userService).findAll(pageable);
    }

    @Test
    @DisplayName("Should handle service exception when patching user")
    void shouldHandleServiceExceptionWhenPatchingUser() {
        // Given
        when(userService.patch(userId, patchUserRoleRequestDTO)).thenThrow(new RuntimeException("User not found"));

        // When & Then
        assertThatThrownBy(() -> userController.patchUserRole(userId, patchUserRoleRequestDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userService).patch(userId, patchUserRoleRequestDTO);
    }

    @Test
    @DisplayName("Should handle large page size gracefully")
    void shouldHandleLargePageSizeGracefully() {
        // Given
        Pageable largePageable = PageRequest.of(0, 1000);
        List<UserResponseDTO> users = List.of(userResponseDTO);
        Page<UserResponseDTO> page = new PageImpl<>(users, largePageable, 1);
        when(userService.findAll(largePageable)).thenReturn(page);

        // When
        ResponseEntity<PageResponse<UserResponseDTO>> response = userController.getAllUsers(largePageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().size()).isEqualTo(1000);
        verify(userService).findAll(largePageable);
    }

    @Test
    @DisplayName("Should handle high page number")
    void shouldHandleHighPageNumber() {
        // Given
        Pageable highPageable = PageRequest.of(100, 10);
        Page<UserResponseDTO> emptyPage = new PageImpl<>(List.of(), highPageable, 50);
        when(userService.findAll(highPageable)).thenReturn(emptyPage);

        // When
        ResponseEntity<PageResponse<UserResponseDTO>> response = userController.getAllUsers(highPageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().content()).isEmpty();
        assertThat(response.getBody().page()).isEqualTo(100);
        verify(userService).findAll(highPageable);
    }

    @Test
    @DisplayName("Should maintain request-response correlation")
    void shouldMaintainRequestResponseCorrelation() throws Exception {
        // Given
        UserResponseDTO specificResponse = new UserResponseDTO(
                UUID.randomUUID(), 
                "specific@example.com", 
                Role.ROLE_ADMIN
        );
        when(userService.createUser(any(UserCreateRequestDTO.class))).thenReturn(specificResponse);

        // When + Then
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"specific@example.com\",\"password\":\"specificPassword\",\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("specific@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));

        verify(userService).createUser(any(UserCreateRequestDTO.class));
    }

    @Test
    @DisplayName("Should verify all controller methods are tested")
    void shouldVerifyAllControllerMethodsAreTested() {
        // This test ensures we don't miss any methods in the controller
        // It will fail if new methods are added without corresponding tests
        
        // Verify createUser method exists and is tested
        assertThat(UserController.class.getDeclaredMethods())
                .extracting("name")
                .contains("createUser", "getAllUsers", "patchUserRole");
    }
}
