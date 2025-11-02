package org.conexaotreinamento.conexaotreinamentobackend.unit.dto.response;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UserResponseDTO Unit Tests")
class UserResponseDTOTest {

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("test@example.com", "encodedPassword", Role.ROLE_ADMIN);
        setIdViaReflection(user, userId);
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
    @DisplayName("Should create DTO from entity successfully")
    void shouldCreateDTOFromEntitySuccessfully() {
        // When
        UserResponseDTO dto = UserResponseDTO.fromEntity(user);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(userId);
        assertThat(dto.email()).isEqualTo("test@example.com");
        assertThat(dto.role()).isEqualTo(Role.ROLE_ADMIN);
    }

    @Test
    @DisplayName("Should create DTO with trainer role")
    void shouldCreateDTOWithTrainerRole() {
        // Given
        User trainerUser = new User("trainer@example.com", "password", Role.ROLE_TRAINER);
        UUID trainerId = UUID.randomUUID();
        setIdViaReflection(trainerUser, trainerId);

        // When
        UserResponseDTO dto = UserResponseDTO.fromEntity(trainerUser);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(trainerId);
        assertThat(dto.email()).isEqualTo("trainer@example.com");
        assertThat(dto.role()).isEqualTo(Role.ROLE_TRAINER);
    }

    @Test
    @DisplayName("Should create DTO from constructor")
    void shouldCreateDTOFromConstructor() {
        // When
        UserResponseDTO dto = new UserResponseDTO(userId, "direct@example.com", Role.ROLE_ADMIN);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isEqualTo(userId);
        assertThat(dto.email()).isEqualTo("direct@example.com");
        assertThat(dto.role()).isEqualTo(Role.ROLE_ADMIN);
    }

    @Test
    @DisplayName("Should handle null values gracefully")
    void shouldHandleNullValuesGracefully() {
        // When
        UserResponseDTO dto = new UserResponseDTO(null, null, null);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.id()).isNull();
        assertThat(dto.email()).isNull();
        assertThat(dto.role()).isNull();
    }

    @Test
    @DisplayName("Should be equal when same values")
    void shouldBeEqualWhenSameValues() {
        // Given
        UserResponseDTO dto1 = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);
        UserResponseDTO dto2 = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);

        // Then
        assertThat(dto1).isEqualTo(dto2);
        assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when different values")
    void shouldNotBeEqualWhenDifferentValues() {
        // Given
        UserResponseDTO dto1 = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);
        UserResponseDTO dto2 = new UserResponseDTO(UUID.randomUUID(), "test@example.com", Role.ROLE_ADMIN);

        // Then
        assertThat(dto1).isNotEqualTo(dto2);
    }

    @Test
    @DisplayName("Should have proper toString")
    void shouldHaveProperToString() {
        // Given
        UserResponseDTO dto = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);

        // When
        String toString = dto.toString();

        // Then
        assertThat(toString).contains("UserResponseDTO");
        assertThat(toString).contains(userId.toString());
        assertThat(toString).contains("test@example.com");
        assertThat(toString).contains("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should handle special characters in email")
    void shouldHandleSpecialCharactersInEmail() {
        // Given
        String specialEmail = "test+special@example-site.com";
        User userWithSpecialEmail = new User(specialEmail, "password", Role.ROLE_ADMIN);
        setIdViaReflection(userWithSpecialEmail, userId);

        // When
        UserResponseDTO dto = UserResponseDTO.fromEntity(userWithSpecialEmail);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo(specialEmail);
    }

    @Test
    @DisplayName("Should handle long email addresses")
    void shouldHandleLongEmailAddresses() {
        // Given
        String longEmail = "very.long.email.address.with.many.dots@very-long-domain-name.example.com";
        User userWithLongEmail = new User(longEmail, "password", Role.ROLE_TRAINER);
        setIdViaReflection(userWithLongEmail, userId);

        // When
        UserResponseDTO dto = UserResponseDTO.fromEntity(userWithLongEmail);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo(longEmail);
    }

    @Test
    @DisplayName("Should maintain immutability")
    void shouldMaintainImmutability() {
        // Given
        UserResponseDTO dto = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);

        // When/Then - Record fields should be final and immutable
        assertThat(dto.id()).isEqualTo(userId);
        assertThat(dto.email()).isEqualTo("test@example.com");
        assertThat(dto.role()).isEqualTo(Role.ROLE_ADMIN);
        
        // Creating new instance with same values should be equal
        UserResponseDTO sameDto = new UserResponseDTO(userId, "test@example.com", Role.ROLE_ADMIN);
        assertThat(dto).isEqualTo(sameDto);
    }

    @Test
    @DisplayName("Should handle both role types in fromEntity")
    void shouldHandleBothRoleTypesInFromEntity() {
        // Given - Admin user
        User adminUser = new User("admin@example.com", "password", Role.ROLE_ADMIN);
        UUID adminId = UUID.randomUUID();
        setIdViaReflection(adminUser, adminId);
        
        // Given - Trainer user
        User trainerUser = new User("trainer@example.com", "password", Role.ROLE_TRAINER);
        UUID trainerId = UUID.randomUUID();
        setIdViaReflection(trainerUser, trainerId);

        // When
        UserResponseDTO adminDto = UserResponseDTO.fromEntity(adminUser);
        UserResponseDTO trainerDto = UserResponseDTO.fromEntity(trainerUser);

        // Then
        assertThat(adminDto.role()).isEqualTo(Role.ROLE_ADMIN);
        assertThat(trainerDto.role()).isEqualTo(Role.ROLE_TRAINER);
        assertThat(adminDto.id()).isEqualTo(adminId);
        assertThat(trainerDto.id()).isEqualTo(trainerId);
    }

    @Test
    @DisplayName("Should create consistent DTOs from same entity")
    void shouldCreateConsistentDTOsFromSameEntity() {
        // When
        UserResponseDTO dto1 = UserResponseDTO.fromEntity(user);
        UserResponseDTO dto2 = UserResponseDTO.fromEntity(user);

        // Then
        assertThat(dto1).isEqualTo(dto2);
        assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
        assertThat(dto1.toString()).isEqualTo(dto2.toString());
    }
}
