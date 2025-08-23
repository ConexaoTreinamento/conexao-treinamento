package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;

public record UserResponseDTO(
        UUID id,
        String email,
        String role) {
    public static UserResponseDTO fromEntity(User savedUser, String roleInput) {
        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getEmail(),
                roleInput);
    }
}
