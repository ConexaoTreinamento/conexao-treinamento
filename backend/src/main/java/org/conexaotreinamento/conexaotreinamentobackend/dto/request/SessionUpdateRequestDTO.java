package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;

import java.util.List;

public record SessionUpdateRequestDTO(List<SessionParticipant> participants, String notes) {}
