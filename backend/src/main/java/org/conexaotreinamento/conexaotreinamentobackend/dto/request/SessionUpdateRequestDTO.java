package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.entity.SessionParticipant;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionUpdateRequestDTO {
    private List<SessionParticipant> participants;
    private String notes;
}
