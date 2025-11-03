package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdministratorCreateRequestDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    String firstName,
    
    @NotBlank(message = "Sobrenome é obrigatório")
    @Size(max = 100, message = "Sobrenome deve ter no máximo 100 caracteres")
    String lastName,
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
    String email,
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, max = 255, message = "Senha deve ter entre 6 e 255 caracteres")
    String password
) {

    public Administrator toEntity(UUID userId) {
        Administrator administrator = new Administrator();
        administrator.setUserId(userId);
        administrator.setFirstName(firstName);
        administrator.setLastName(lastName);
        return administrator;
    }

    public boolean hasPassword() {
        return password != null && !password.trim().isEmpty();
    }
}