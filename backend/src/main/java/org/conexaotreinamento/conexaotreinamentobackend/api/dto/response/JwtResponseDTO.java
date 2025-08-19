package org.conexaotreinamento.conexaotreinamentobackend.api.dto.response;

import java.util.UUID;

/**
 * DTO de resposta para autenticação JWT
 * Contém informações do usuário autenticado e o token de acesso
 */
public record JwtResponseDTO(
    UUID id,
    String token
) {}
