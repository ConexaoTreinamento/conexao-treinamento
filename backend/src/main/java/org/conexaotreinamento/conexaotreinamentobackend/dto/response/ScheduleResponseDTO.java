package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import java.util.List;

public record ScheduleResponseDTO(List<SessionResponseDTO> sessions) {}
