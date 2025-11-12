package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.CommitmentDetailResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.entity.StudentCommitment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Mapper for converting StudentCommitment entities to DTOs.
 * Enriches commitment data with student and schedule information.
 */
@Component
@RequiredArgsConstructor
public class StudentCommitmentMapper {

    private final StudentRepository studentRepository;
    private final TrainerScheduleRepository scheduleRepository;

    /**
     * Maps StudentCommitment entity to CommitmentDetailResponseDTO.
     * Fetches related Student and TrainerSchedule data.
     */
    public CommitmentDetailResponseDTO toDetailResponse(StudentCommitment commitment) {
        String studentName = studentRepository.findById(commitment.getStudentId())
                .map(Student::getName)
                .orElse(null);

        String seriesName = scheduleRepository.findById(commitment.getSessionSeriesId())
                .map(TrainerSchedule::getSeriesName)
                .orElse(null);

        return new CommitmentDetailResponseDTO(
                commitment.getId(),
                commitment.getStudentId(),
                studentName,
                commitment.getSessionSeriesId(),
                seriesName,
                commitment.getCommitmentStatus(),
                commitment.getEffectiveFromTimestamp(),
                commitment.getCreatedAt()
        );
    }
}

