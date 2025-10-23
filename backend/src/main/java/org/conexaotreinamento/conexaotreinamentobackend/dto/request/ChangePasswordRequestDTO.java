package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDTO(
    @NotBlank(message = "A senha atual é obrigatória")
    String oldPassword,

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 6, message = "A nova senha deve ter pelo menos 6 caracteres")
    String newPassword,

    @NotBlank(message = "A confirmação da senha é obrigatória")
    String confirmPassword
) {}

