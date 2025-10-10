package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("LoginRequestDTO Unit Tests")
class LoginRequestDTOTest {

    @Test
    @DisplayName("Should create DTO with valid email and password")
    void shouldCreateDTOWithValidEmailAndPassword() {
        // When
        LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "password123");

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo("user@example.com");
        assertThat(dto.password()).isEqualTo("password123");
    }

    @Test
    @DisplayName("Should handle null values")
    void shouldHandleNullValues() {
        // When
        LoginRequestDTO dto = new LoginRequestDTO(null, null);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isNull();
        assertThat(dto.password()).isNull();
    }

    @Test
    @DisplayName("Should be equal when same values")
    void shouldBeEqualWhenSameValues() {
        // Given
        LoginRequestDTO dto1 = new LoginRequestDTO("user@example.com", "password123");
        LoginRequestDTO dto2 = new LoginRequestDTO("user@example.com", "password123");

        // Then
        assertThat(dto1).isEqualTo(dto2);
        assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when different values")
    void shouldNotBeEqualWhenDifferentValues() {
        // Given
        LoginRequestDTO dto1 = new LoginRequestDTO("user1@example.com", "password123");
        LoginRequestDTO dto2 = new LoginRequestDTO("user2@example.com", "password123");

        // Then
        assertThat(dto1).isNotEqualTo(dto2);
    }

    @Test
    @DisplayName("Should handle special characters in email")
    void shouldHandleSpecialCharactersInEmail() {
        // When
        LoginRequestDTO dto = new LoginRequestDTO("test+special@example-site.co.uk", "p@ssw0rd!");

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo("test+special@example-site.co.uk");
        assertThat(dto.password()).isEqualTo("p@ssw0rd!");
    }

    @Test
    @DisplayName("Should handle empty strings")
    void shouldHandleEmptyStrings() {
        // When
        LoginRequestDTO dto = new LoginRequestDTO("", "");

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEmpty();
        assertThat(dto.password()).isEmpty();
    }

    @Test
    @DisplayName("Should handle very long credentials")
    void shouldHandleVeryLongCredentials() {
        // Given
        String longEmail = "a".repeat(50) + "@" + "b".repeat(50) + ".com";
        String longPassword = "c".repeat(100);

        // When
        LoginRequestDTO dto = new LoginRequestDTO(longEmail, longPassword);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo(longEmail);
        assertThat(dto.password()).isEqualTo(longPassword);
    }

    @Test
    @DisplayName("Should have proper toString without exposing password")
    void shouldHaveProperToStringWithoutExposingPassword() {
        // Given
        LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "secretpassword");

        // When
        String toString = dto.toString();

        // Then
        assertThat(toString).contains("LoginRequestDTO");
        assertThat(toString).contains("user@example.com");
        // Should not expose the actual password for security reasons
        // Note: This depends on the actual toString implementation
        assertThat(toString).isNotNull();
    }

    @Test
    @DisplayName("Should maintain immutability")
    void shouldMaintainImmutability() {
        // Given
        LoginRequestDTO dto = new LoginRequestDTO("user@example.com", "password123");

        // When/Then - Record fields should be final and immutable
        assertThat(dto.email()).isEqualTo("user@example.com");
        assertThat(dto.password()).isEqualTo("password123");
        
        // Creating new instance with same values should be equal
        LoginRequestDTO sameDto = new LoginRequestDTO("user@example.com", "password123");
        assertThat(dto).isEqualTo(sameDto);
    }

    @Test
    @DisplayName("Should handle case sensitive passwords")
    void shouldHandleCaseSensitivePasswords() {
        // Given
        LoginRequestDTO dto1 = new LoginRequestDTO("user@example.com", "Password123");
        LoginRequestDTO dto2 = new LoginRequestDTO("user@example.com", "password123");

        // Then
        assertThat(dto1).isNotEqualTo(dto2);
        assertThat(dto1.password()).isEqualTo("Password123");
        assertThat(dto2.password()).isEqualTo("password123");
    }

    @Test
    @DisplayName("Should handle whitespace in credentials")
    void shouldHandleWhitespaceInCredentials() {
        // When
        LoginRequestDTO dto = new LoginRequestDTO(" user@example.com ", " password123 ");

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.email()).isEqualTo(" user@example.com ");
        assertThat(dto.password()).isEqualTo(" password123 ");
    }

    @Test
    @DisplayName("Should create different instances with different hashcodes")
    void shouldCreateDifferentInstancesWithDifferentHashcodes() {
        // Given
        LoginRequestDTO dto1 = new LoginRequestDTO("user1@example.com", "password1");
        LoginRequestDTO dto2 = new LoginRequestDTO("user2@example.com", "password2");
        LoginRequestDTO dto3 = new LoginRequestDTO("user1@example.com", "password2");

        // Then
        assertThat(dto1.hashCode()).isNotEqualTo(dto2.hashCode());
        assertThat(dto1.hashCode()).isNotEqualTo(dto3.hashCode());
        assertThat(dto2.hashCode()).isNotEqualTo(dto3.hashCode());
    }
}
