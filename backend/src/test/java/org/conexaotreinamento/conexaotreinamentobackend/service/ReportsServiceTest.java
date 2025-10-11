package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AgeDistributionDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerReportDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.repository.ScheduledSessionRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportsService Unit Tests")
class ReportsServiceTest {

    @Mock
    private ScheduledSessionRepository scheduledSessionRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private ReportsService reportsService;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UUID trainerId;

    @BeforeEach
    void setUp() {
        startDate = LocalDateTime.of(2025, 10, 1, 0, 0);
        endDate = LocalDateTime.of(2025, 10, 31, 23, 59);
        trainerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should generate complete reports with trainer and age distribution data")
    void shouldGenerateCompleteReports() {
        // Arrange
        List<Object[]> mockTrainerData = createMockTrainerData();
        List<LocalDate> mockBirthDates = createMockBirthDates();

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(mockTrainerData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(mockBirthDates);

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.trainerReports()).hasSize(2);
        assertThat(result.ageDistribution()).hasSize(4);

        verify(scheduledSessionRepository).findTrainerReportsRaw(startDate, endDate, trainerId);
        verify(studentRepository).findAllBirthDates();
    }

    @Test
    @DisplayName("Should map trainer raw data correctly to TrainerReportDTO")
    void shouldMapTrainerDataCorrectly() {
        // Arrange
        UUID trainer1Id = UUID.randomUUID();
        Object[] rawData = new Object[]{
                trainer1Id,
                "Prof. Ana Silva",
                15.5,
                10,
                5,
                "HOURLY",
                new String[]{"Pilates", "Yoga"}
        };

        List<Object[]> mockData = new ArrayList<>();
        mockData.add(rawData);
        
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(mockData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result.trainerReports()).hasSize(1);
        TrainerReportDTO trainer = result.trainerReports().get(0);
        
        assertThat(trainer.id()).isEqualTo(trainer1Id);
        assertThat(trainer.name()).isEqualTo("Prof. Ana Silva");
        assertThat(trainer.hoursWorked()).isEqualTo(15.5);
        assertThat(trainer.classesGiven()).isEqualTo(10);
        assertThat(trainer.studentsManaged()).isEqualTo(5);
        assertThat(trainer.compensation()).isEqualTo(CompensationType.HOURLY);
        assertThat(trainer.specialties()).containsExactly("Pilates", "Yoga");
    }

    @Test
    @DisplayName("Should handle trainer with null specialties")
    void shouldHandleNullSpecialties() {
        // Arrange
        Object[] rawData = new Object[]{
                UUID.randomUUID(),
                "Prof. Carlos Santos",
                20.0,
                15,
                8,
                "MONTHLY",
                null
        };

        List<Object[]> mockData = new ArrayList<>();
        mockData.add(rawData);
        
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(mockData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result.trainerReports()).hasSize(1);
        TrainerReportDTO trainer = result.trainerReports().get(0);
        assertThat(trainer.specialties()).isEmpty();
    }

    @Test
    @DisplayName("Should handle trainer with empty specialties array")
    void shouldHandleEmptySpecialtiesArray() {
        // Arrange
        Object[] rawData = new Object[]{
                UUID.randomUUID(),
                "Prof. Marina Costa",
                12.0,
                8,
                3,
                "HOURLY",
                new String[]{}
        };

        List<Object[]> mockData = new ArrayList<>();
        mockData.add(rawData);
        
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(mockData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result.trainerReports()).hasSize(1);
        TrainerReportDTO trainer = result.trainerReports().get(0);
        assertThat(trainer.specialties()).isEmpty();
    }

    @Test
    @DisplayName("Should return empty trainer reports when no data exists")
    void shouldReturnEmptyTrainerReports() {
        // Arrange
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result.trainerReports()).isEmpty();
        assertThat(result.ageDistribution()).hasSize(4); // Always returns 4 age groups
    }

    @Test
    @DisplayName("Should calculate age distribution correctly")
    void shouldCalculateAgeDistributionCorrectly() {
        // Arrange
        List<LocalDate> birthDates = Arrays.asList(
                LocalDate.now().minusYears(20), // 18-25
                LocalDate.now().minusYears(22), // 18-25
                LocalDate.now().minusYears(30), // 26-35
                LocalDate.now().minusYears(32), // 26-35
                LocalDate.now().minusYears(35), // 26-35
                LocalDate.now().minusYears(40), // 36-45
                LocalDate.now().minusYears(50), // 46+
                LocalDate.now().minusYears(60)  // 46+
        );

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(birthDates);

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        List<AgeDistributionDTO> ageDistribution = result.ageDistribution();
        assertThat(ageDistribution).hasSize(4);

        // Verify counts
        assertThat(ageDistribution.get(0).ageRange()).isEqualTo("18-25");
        assertThat(ageDistribution.get(0).count()).isEqualTo(2);
        assertThat(ageDistribution.get(0).percentage()).isEqualTo(25.0);

        assertThat(ageDistribution.get(1).ageRange()).isEqualTo("26-35");
        assertThat(ageDistribution.get(1).count()).isEqualTo(3);
        assertThat(ageDistribution.get(1).percentage()).isEqualTo(37.5);

        assertThat(ageDistribution.get(2).ageRange()).isEqualTo("36-45");
        assertThat(ageDistribution.get(2).count()).isEqualTo(1);
        assertThat(ageDistribution.get(2).percentage()).isEqualTo(12.5);

        assertThat(ageDistribution.get(3).ageRange()).isEqualTo("46+");
        assertThat(ageDistribution.get(3).count()).isEqualTo(2);
        assertThat(ageDistribution.get(3).percentage()).isEqualTo(25.0);
    }

    @Test
    @DisplayName("Should handle empty birth dates list")
    void shouldHandleEmptyBirthDates() {
        // Arrange
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        List<AgeDistributionDTO> ageDistribution = result.ageDistribution();
        assertThat(ageDistribution).hasSize(4);
        
        // All groups should have 0 count and 0% percentage
        ageDistribution.forEach(group -> {
            assertThat(group.count()).isEqualTo(0);
            assertThat(group.percentage()).isEqualTo(0.0);
        });
    }

    @Test
    @DisplayName("Should calculate percentages with proper rounding")
    void shouldCalculatePercentagesWithProperRounding() {
        // Arrange - 3 students total
        List<LocalDate> birthDates = Arrays.asList(
                LocalDate.now().minusYears(20), // 18-25
                LocalDate.now().minusYears(30), // 26-35
                LocalDate.now().minusYears(40)  // 36-45
        );

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(birthDates);

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        List<AgeDistributionDTO> ageDistribution = result.ageDistribution();
        
        // Each group has 1 student out of 3 = 33.33%
        assertThat(ageDistribution.get(0).percentage()).isEqualTo(33.33);
        assertThat(ageDistribution.get(1).percentage()).isEqualTo(33.33);
        assertThat(ageDistribution.get(2).percentage()).isEqualTo(33.33);
        assertThat(ageDistribution.get(3).percentage()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Should handle students under 18 (not counted in any group)")
    void shouldHandleStudentsUnder18() {
        // Arrange
        List<LocalDate> birthDates = Arrays.asList(
                LocalDate.now().minusYears(16), // Under 18 - not counted
                LocalDate.now().minusYears(20), // 18-25
                LocalDate.now().minusYears(30)  // 26-35
        );

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(birthDates);

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        List<AgeDistributionDTO> ageDistribution = result.ageDistribution();
        
        // Total should be 3 (including under 18), but only 2 are counted in groups
        int totalCounted = ageDistribution.stream()
                .mapToInt(AgeDistributionDTO::count)
                .sum();
        assertThat(totalCounted).isEqualTo(2);
    }

    @Test
    @DisplayName("Should handle boundary ages correctly")
    void shouldHandleBoundaryAgesCorrectly() {
        // Arrange
        List<LocalDate> birthDates = Arrays.asList(
                LocalDate.now().minusYears(18), // Exactly 18 -> 18-25
                LocalDate.now().minusYears(25), // Exactly 25 -> 18-25
                LocalDate.now().minusYears(26), // Exactly 26 -> 26-35
                LocalDate.now().minusYears(35), // Exactly 35 -> 26-35
                LocalDate.now().minusYears(36), // Exactly 36 -> 36-45
                LocalDate.now().minusYears(45), // Exactly 45 -> 36-45
                LocalDate.now().minusYears(46)  // Exactly 46 -> 46+
        );

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(Collections.emptyList());
        when(studentRepository.findAllBirthDates())
                .thenReturn(birthDates);

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        List<AgeDistributionDTO> ageDistribution = result.ageDistribution();
        
        assertThat(ageDistribution.get(0).count()).isEqualTo(2); // 18-25
        assertThat(ageDistribution.get(1).count()).isEqualTo(2); // 26-35
        assertThat(ageDistribution.get(2).count()).isEqualTo(2); // 36-45
        assertThat(ageDistribution.get(3).count()).isEqualTo(1); // 46+
    }

    @Test
    @DisplayName("Should handle multiple trainers with different compensation types")
    void shouldHandleMultipleTrainersWithDifferentCompensationTypes() {
        // Arrange
        List<Object[]> mockData = Arrays.asList(
                new Object[]{
                        UUID.randomUUID(), "Trainer 1", 10.0, 5, 3,
                        "HOURLY", new String[]{"Yoga"}
                },
                new Object[]{
                        UUID.randomUUID(), "Trainer 2", 20.0, 10, 8,
                        "MONTHLY", new String[]{"CrossFit"}
                },
                new Object[]{
                        UUID.randomUUID(), "Trainer 3", 15.0, 8, 5,
                        "HOURLY", new String[]{"Pilates", "Dança"}
                }
        );

        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, null))
                .thenReturn(mockData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, null);

        // Assert
        assertThat(result.trainerReports()).hasSize(3);
        
        long hourlyCount = result.trainerReports().stream()
                .filter(t -> t.compensation() == CompensationType.HOURLY)
                .count();
        long monthlyCount = result.trainerReports().stream()
                .filter(t -> t.compensation() == CompensationType.MONTHLY)
                .count();
        
        assertThat(hourlyCount).isEqualTo(2);
        assertThat(monthlyCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle trainers with zero hours and classes")
    void shouldHandleTrainersWithZeroHoursAndClasses() {
        // Arrange
        Object[] rawData = new Object[]{
                UUID.randomUUID(),
                "Inactive Trainer",
                0.0,
                0,
                0,
                "HOURLY",
                new String[]{"Yoga"}
        };

        List<Object[]> mockData = new ArrayList<>();
        mockData.add(rawData);
        
        when(scheduledSessionRepository.findTrainerReportsRaw(startDate, endDate, trainerId))
                .thenReturn(mockData);
        when(studentRepository.findAllBirthDates())
                .thenReturn(Collections.emptyList());

        // Act
        ReportsResponseDTO result = reportsService.generateReports(startDate, endDate, trainerId);

        // Assert
        assertThat(result.trainerReports()).hasSize(1);
        TrainerReportDTO trainer = result.trainerReports().get(0);
        
        assertThat(trainer.hoursWorked()).isEqualTo(0.0);
        assertThat(trainer.classesGiven()).isEqualTo(0);
        assertThat(trainer.studentsManaged()).isEqualTo(0);
    }

    // Helper methods

    private List<Object[]> createMockTrainerData() {
        UUID trainer1Id = UUID.randomUUID();
        UUID trainer2Id = UUID.randomUUID();

        return Arrays.asList(
                new Object[]{
                        trainer1Id,
                        "Prof. Ana Silva",
                        15.5,
                        10,
                        5,
                        "HOURLY",
                        new String[]{"Pilates", "Yoga"}
                },
                new Object[]{
                        trainer2Id,
                        "Prof. Carlos Santos",
                        20.0,
                        15,
                        8,
                        "MONTHLY",
                        new String[]{"Musculação", "CrossFit"}
                }
        );
    }

    private List<LocalDate> createMockBirthDates() {
        return Arrays.asList(
                LocalDate.now().minusYears(20), // 18-25
                LocalDate.now().minusYears(22), // 18-25
                LocalDate.now().minusYears(24), // 18-25
                LocalDate.now().minusYears(30), // 26-35
                LocalDate.now().minusYears(32), // 26-35
                LocalDate.now().minusYears(40), // 36-45
                LocalDate.now().minusYears(50)  // 46+
        );
    }
}
