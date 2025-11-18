package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.UUID;

public record JwtResponseDTO(
    UUID id,
    String token,
    boolean passwordExpired
) {}
