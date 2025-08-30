package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record LoginRequestDTO(
    @NotBlank(message = "Email é obrigatório")
    @Size(max = 120)
    String email,
    
    @NotBlank(message = "Senha é obrigatória")
    String password
) {}
