package org.conexaotreinamento.conexaotreinamentobackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.entity.ScheduledSession;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponseDTO {
    private List<ScheduledSession> sessions;
}
