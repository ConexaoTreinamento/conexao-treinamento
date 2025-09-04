package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
        @NotBlank(message = "Email é obrigatório")
        @Size(max = 120)
        @Pattern(
                regexp = "^[a-z0-9.]+@[a-z0-9]+\\.[a-z]+(\\.[a-z]+)?$",
                message = "Email deve ter formato válido"
        )
        String email,
        @NotBlank(message = "Senha é obrigatória")
        String password
        ) {

}
