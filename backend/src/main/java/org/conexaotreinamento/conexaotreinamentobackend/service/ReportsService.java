package org.conexaotreinamento.conexaotreinamentobackend.service;

import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AgeDistributionDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerReportDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ScheduledSessionRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final ScheduledSessionRepository scheduledSessionRepository;
    private final StudentRepository studentRepository;

    public ReportsResponseDTO generateReports(LocalDateTime startDate, LocalDateTime endDate, UUID trainerId) {
        List<TrainerReportDTO> trainerReports = generateTrainerReports(startDate, endDate, trainerId);
        List<AgeDistributionDTO> ageDistribution = calculateAgeDistribution();
        return new ReportsResponseDTO(trainerReports, ageDistribution);
    }
    
    /**
     * Generate trainer reports by fetching raw data and mapping to DTOs.
     * Handles PostgreSQL array to List conversion.
     */
    private List<TrainerReportDTO> generateTrainerReports(LocalDateTime startDate, LocalDateTime endDate, UUID trainerId) {
        List<Object[]> rawResults = scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId);
        
        return rawResults.stream()
                .map(row -> {
                    UUID id = (UUID) row[0];
                    String name = (String) row[1];
                    Double hoursWorked = ((Number) row[2]).doubleValue();
                    Integer classesGiven = ((Number) row[3]).intValue();
                    Integer studentsManaged = ((Number) row[4]).intValue();
                    CompensationType compensation = CompensationType.valueOf((String) row[5]);
                    
                    // Convert PostgreSQL array to List
                    List<String> specialties = new ArrayList<>();
                    if (row[6] != null) {
                        String[] specialtiesArray = (String[]) row[6];
                        specialties = Arrays.asList(specialtiesArray);
                    }
                    
                    return new TrainerReportDTO(
                            id,
                            name,
                            hoursWorked,
                            classesGiven,
                            studentsManaged,
                            compensation,
                            specialties
                    );
                })
                .collect(Collectors.toList());
    }
    
    private List<AgeDistributionDTO> calculateAgeDistribution() {
        List<LocalDate> birthDates = studentRepository.findAllBirthDates();
        
        Map<String, Integer> ageGroups = new LinkedHashMap<>();
        ageGroups.put("18-25", 0);
        ageGroups.put("26-35", 0);
        ageGroups.put("36-45", 0);
        ageGroups.put("46+", 0);
        
        LocalDate today = LocalDate.now();
        for (LocalDate birthDate : birthDates) {
            int age = Period.between(birthDate, today).getYears();
            
            if (age >= 18 && age <= 25) {
                ageGroups.merge("18-25", 1, Integer::sum);
            } else if (age >= 26 && age <= 35) {
                ageGroups.merge("26-35", 1, Integer::sum);
            } else if (age >= 36 && age <= 45) {
                ageGroups.merge("36-45", 1, Integer::sum);
            } else if (age >= 46) {
                ageGroups.merge("46+", 1, Integer::sum);
            }
        }
        
        int totalStudents = birthDates.size();
        
        return ageGroups.entrySet().stream()
                .map(entry -> {
                    double percentage = totalStudents > 0 ? 
                            (entry.getValue() * 100.0 / totalStudents) : 0.0;
                    return new AgeDistributionDTO(
                            entry.getKey(),
                            entry.getValue(),
                            Math.round(percentage * 100.0) / 100.0
                    );
                })
                .collect(Collectors.toList());
    }
}