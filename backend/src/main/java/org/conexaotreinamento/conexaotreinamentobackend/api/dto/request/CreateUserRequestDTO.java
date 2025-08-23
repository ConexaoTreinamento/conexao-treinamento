package org.conexaotreinamento.conexaotreinamentobackend.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequestDTO(
    @NotBlank(message = "Email é obrigatório")
    @Size(max = 120)
    @Email(message = "Email deve ter formato válido")
    String email,
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String password,
    
    String role // "ADMIN" ou "TRAINER" (opcional, padrão será TRAINER)
) {}
