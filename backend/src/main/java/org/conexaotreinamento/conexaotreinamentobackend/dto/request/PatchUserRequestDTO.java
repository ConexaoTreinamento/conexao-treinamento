package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;


    
public record PatchUserRequestDTO(
    @Size(max = 120)
    @Email(message = "Email deve ter formato válido")
    String email,
    
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String password,
    
    String role
    )
    {}

