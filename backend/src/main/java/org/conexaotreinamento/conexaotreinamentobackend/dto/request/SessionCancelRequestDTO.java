package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

public record SessionCancelRequestDTO(
        boolean cancel,
        String reason
) {}
