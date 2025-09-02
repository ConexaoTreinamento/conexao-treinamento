package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;



    
public record PatchUserRoleRequestDTO(
    Role role
    )
    {}

