package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.CreateUserRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchUserRoleRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private UUID userId;
    private CreateUserRequestDTO createUserRequestDTO;
    private PatchUserRoleRequestDTO patchUserRoleRequestDTO;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("john@example.com", "encodedPassword", Role.ROLE_ADMIN);
        setIdViaReflection(user, userId);

        createUserRequestDTO = new CreateUserRequestDTO("john@example.com", "password123", Role.ROLE_ADMIN);
        patchUserRoleRequestDTO = new PatchUserRoleRequestDTO(Role.ROLE_TRAINER);
    }

    private void setIdViaReflection(User user, UUID id) {
        try {
            var field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (Exception e) {
            fail("Failed to set User.id via reflection: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() {
        // Given
        when(userRepository.findByEmail(createUserRequestDTO.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(createUserRequestDTO.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        UserResponseDTO result = userService.createUser(createUserRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("john@example.com");
        assertThat(result.role()).isEqualTo(Role.ROLE_ADMIN);
        assertThat(result.id()).isEqualTo(userId);

        verify(userRepository).findByEmail("john@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw bad request when email already exists")
    void shouldThrowBadRequestWhenEmailAlreadyExists() {
        // Given
        when(userRepository.findByEmail(createUserRequestDTO.email())).thenReturn(Optional.of(user));

        // When & Then
        assertThatThrownBy(() -> userService.createUser(createUserRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Email já está em uso");

        verify(userRepository).findByEmail("john@example.com");
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Should find all users with pagination")
    void shouldFindAllUsersWithPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<User> users = List.of(user);
        Page<User> page = new PageImpl<>(users, pageable, 1);

        when(userRepository.findAllByDeletedAtIsNull(pageable)).thenReturn(page);

        // When
        Page<UserResponseDTO> result = userService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).email()).isEqualTo("john@example.com");
        assertThat(result.getContent().get(0).role()).isEqualTo(Role.ROLE_ADMIN);

        verify(userRepository).findAllByDeletedAtIsNull(pageable);
    }

    @Test
    @DisplayName("Should get user by email when user exists")
    void shouldGetUserByEmailWhenUserExists() {
        // Given
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        // When
        Optional<UserResponseDTO> result = userService.getUserByEmail("john@example.com");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().email()).isEqualTo("john@example.com");
        assertThat(result.get().role()).isEqualTo(Role.ROLE_ADMIN);

        verify(userRepository).findByEmail("john@example.com");
    }

    @Test
    @DisplayName("Should return empty optional when user does not exist")
    void shouldReturnEmptyOptionalWhenUserDoesNotExist() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When
        Optional<UserResponseDTO> result = userService.getUserByEmail("nonexistent@example.com");

        // Then
        assertThat(result).isEmpty();

        verify(userRepository).findByEmail("nonexistent@example.com");
    }

    @Test
    @DisplayName("Should delete user successfully (soft delete)")
    void shouldDeleteUserSuccessfully() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        userService.delete(userId);

        // Then
        assertThat(user.getDeletedAt()).isNotNull();
        assertThat(user.isInactive()).isTrue();

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should throw not found when deleting non-existent user")
    void shouldThrowNotFoundWhenDeletingNonExistentUser() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.delete(userId))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("User not found");

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should patch user role successfully")
    void shouldPatchUserRoleSuccessfully() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        UserResponseDTO result = userService.patch(userId, patchUserRoleRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.role()).isEqualTo(Role.ROLE_TRAINER);
        assertThat(user.getRole()).isEqualTo(Role.ROLE_TRAINER);

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should not change role when patch role is null")
    void shouldNotChangeRoleWhenPatchRoleIsNull() {
        // Given
        PatchUserRoleRequestDTO patchWithNullRole = new PatchUserRoleRequestDTO(null);
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));

        // When
        UserResponseDTO result = userService.patch(userId, patchWithNullRole);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.role()).isEqualTo(Role.ROLE_ADMIN); // Should remain unchanged
        assertThat(user.getRole()).isEqualTo(Role.ROLE_ADMIN);

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should throw not found when patching non-existent user")
    void shouldThrowNotFoundWhenPatchingNonExistentUser() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.patch(userId, patchUserRoleRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("User not found");

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should update user email successfully")
    void shouldUpdateUserEmailSuccessfully() {
        // Given
        String newEmail = "newemail@example.com";
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByEmailAndDeletedAtIsNull(newEmail)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        UserResponseDTO result = userService.updateUserEmail(userId, newEmail);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(newEmail);
        assertThat(user.getEmail()).isEqualTo(newEmail);

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
        verify(userRepository).findByEmailAndDeletedAtIsNull(newEmail);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should not update email when same email is provided")
    void shouldNotUpdateEmailWhenSameEmailIsProvided() {
        // Given
        String sameEmail = "john@example.com";
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        UserResponseDTO result = userService.updateUserEmail(userId, sameEmail);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(sameEmail);

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
        verify(userRepository, never()).findByEmailAndDeletedAtIsNull(any());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should throw bad request when email is null or empty")
    void shouldThrowBadRequestWhenEmailIsNullOrEmpty() {
        // When & Then - null email
        assertThatThrownBy(() -> userService.updateUserEmail(userId, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Email is required");

        // When & Then - empty email
        assertThatThrownBy(() -> userService.updateUserEmail(userId, "   "))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Email is required");

        verify(userRepository, never()).findByIdAndDeletedAtIsNull(any());
    }

    @Test
    @DisplayName("Should throw not found when updating email for non-existent user")
    void shouldThrowNotFoundWhenUpdatingEmailForNonExistentUser() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.updateUserEmail(userId, "newemail@example.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("User not found");

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
    }

    @Test
    @DisplayName("Should throw conflict when new email already exists")
    void shouldThrowConflictWhenNewEmailAlreadyExists() {
        // Given
        String newEmail = "existing@example.com";
        User existingUser = new User(newEmail, "password", Role.ROLE_TRAINER);
        setIdViaReflection(existingUser, UUID.randomUUID());

        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByEmailAndDeletedAtIsNull(newEmail)).thenReturn(Optional.of(existingUser));

        // When & Then
        assertThatThrownBy(() -> userService.updateUserEmail(userId, newEmail))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT)
                .hasMessageContaining("Email already in use");

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
        verify(userRepository).findByEmailAndDeletedAtIsNull(newEmail);
    }

    @Test
    @DisplayName("Should update user password successfully")
    void shouldUpdateUserPasswordSuccessfully() {
        // Given
        String newPassword = "newPassword123";
        String encodedNewPassword = "encodedNewPassword";
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        UserResponseDTO result = userService.updateUserPassword(userId, newPassword);

        // Then
        assertThat(result).isNotNull();
        assertThat(user.getPassword()).isEqualTo(encodedNewPassword);

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
        verify(passwordEncoder).encode(newPassword);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should throw bad request when password is null or empty")
    void shouldThrowBadRequestWhenPasswordIsNullOrEmpty() {
        // When & Then - null password
        assertThatThrownBy(() -> userService.updateUserPassword(userId, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Password is required");

        // When & Then - empty password
        assertThatThrownBy(() -> userService.updateUserPassword(userId, "   "))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Password is required");

        verify(userRepository, never()).findByIdAndDeletedAtIsNull(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Should throw not found when updating password for non-existent user")
    void shouldThrowNotFoundWhenUpdatingPasswordForNonExistentUser() {
        // Given
        when(userRepository.findByIdAndDeletedAtIsNull(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.updateUserPassword(userId, "newPassword"))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND)
                .hasMessageContaining("User not found");

        verify(userRepository).findByIdAndDeletedAtIsNull(userId);
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("Should handle empty user list in findAll")
    void shouldHandleEmptyUserListInFindAll() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(userRepository.findAllByDeletedAtIsNull(pageable)).thenReturn(emptyPage);

        // When
        Page<UserResponseDTO> result = userService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();

        verify(userRepository).findAllByDeletedAtIsNull(pageable);
    }

    @Test
    @DisplayName("Should handle multiple users in findAll")
    void shouldHandleMultipleUsersInFindAll() {
        // Given
        User adminUser = new User("admin@example.com", "password", Role.ROLE_ADMIN);
        User trainerUser = new User("trainer@example.com", "password", Role.ROLE_TRAINER);
        setIdViaReflection(adminUser, UUID.randomUUID());
        setIdViaReflection(trainerUser, UUID.randomUUID());

        Pageable pageable = PageRequest.of(0, 10);
        List<User> users = List.of(adminUser, trainerUser);
        Page<User> page = new PageImpl<>(users, pageable, 2);

        when(userRepository.findAllByDeletedAtIsNull(pageable)).thenReturn(page);

        // When
        Page<UserResponseDTO> result = userService.findAll(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        
        var resultList = result.getContent();
        assertThat(resultList).extracting("email")
                .containsExactlyInAnyOrder("admin@example.com", "trainer@example.com");
        assertThat(resultList).extracting("role")
                .containsExactlyInAnyOrder(Role.ROLE_ADMIN, Role.ROLE_TRAINER);

        verify(userRepository).findAllByDeletedAtIsNull(pageable);
    }
}
