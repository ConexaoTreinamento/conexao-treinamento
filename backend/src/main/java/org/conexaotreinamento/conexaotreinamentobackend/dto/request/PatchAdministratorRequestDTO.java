package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record PatchAdministratorRequestDTO(
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String firstName,
        
        @Size(max = 100, message = "Sobrenome deve ter no máximo 100 caracteres")
        String lastName,
        
        @Email(message = "Email deve ter um formato válido")
        @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
        String email,
        
        @Size(min = 6, max = 255, message = "Senha deve ter entre 6 e 255 caracteres")
        String password
) {}