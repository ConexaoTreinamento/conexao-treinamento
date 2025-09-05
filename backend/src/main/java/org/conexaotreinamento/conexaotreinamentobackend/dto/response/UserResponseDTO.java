package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;

public record UserResponseDTO(
        UUID id,
        String email,
        Role role) {
    public static UserResponseDTO fromEntity(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getRole());
    }
}
