package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionParticipantAddRequestDTO {
    private UUID studentId;
}
