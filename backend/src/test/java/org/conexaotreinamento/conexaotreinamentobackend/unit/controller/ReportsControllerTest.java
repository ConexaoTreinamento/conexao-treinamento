package org.conexaotreinamento.conexaotreinamentobackend.unit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AgeDistributionResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.TrainerReportResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.controller.ReportsController;
import org.conexaotreinamento.conexaotreinamentobackend.service.ReportsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportsController Unit Tests")
class ReportsControllerTest {

    @Mock
    private ReportsService reportsService;

    @InjectMocks
    private ReportsController reportsController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private UUID trainerId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper);

        mockMvc = MockMvcBuilders.standaloneSetup(reportsController)
                .setMessageConverters(converter)
                .build();

        trainerId = UUID.randomUUID();
    }

    @Test
    @DisplayName("GET /reports - Should return reports for all trainers when trainerId is not provided")
    void shouldReturnReportsForAllTrainers() throws Exception {
        // Arrange
        ReportsResponseDTO mockResponse = createMockReportsResponse();
        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.trainerReports", hasSize(2)))
                .andExpect(jsonPath("$.trainerReports[0].name", is("Prof. Ana Silva")))
                .andExpect(jsonPath("$.trainerReports[0].hoursWorked", is(15.5)))
                .andExpect(jsonPath("$.trainerReports[0].classesGiven", is(10)))
                .andExpect(jsonPath("$.trainerReports[0].studentsManaged", is(5)))
                .andExpect(jsonPath("$.trainerReports[0].compensation", is("HOURLY")))
                .andExpect(jsonPath("$.trainerReports[0].specialties", hasSize(2)))
                .andExpect(jsonPath("$.ageDistribution", hasSize(4)))
                .andExpect(jsonPath("$.ageDistribution[0].ageRange", is("18-25")))
                .andExpect(jsonPath("$.ageDistribution[0].count", is(3)))
                .andExpect(jsonPath("$.ageDistribution[0].percentage", is(30.0)));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should return reports for specific trainer when trainerId is provided")
    void shouldReturnReportsForSpecificTrainer() throws Exception {
        // Arrange
        TrainerReportResponseDTO trainerReport = new TrainerReportResponseDTO(
                trainerId,
                "Prof. Ana Silva",
                15.5,
                10,
                5,
                CompensationType.HOURLY,
                Arrays.asList("Pilates", "Yoga")
        );

        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                List.of(trainerReport),
                createMockAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(trainerId)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .param("trainerId", trainerId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.trainerReports", hasSize(1)))
                .andExpect(jsonPath("$.trainerReports[0].id", is(trainerId.toString())))
                .andExpect(jsonPath("$.trainerReports[0].name", is("Prof. Ana Silva")));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(trainerId));
    }

    @Test
    @DisplayName("GET /reports - Should return empty reports when no data exists")
    void shouldReturnEmptyReportsWhenNoDataExists() throws Exception {
        // Arrange
        ReportsResponseDTO emptyResponse = new ReportsResponseDTO(
                Collections.emptyList(),
                createEmptyAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(emptyResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.trainerReports", hasSize(0)))
                .andExpect(jsonPath("$.ageDistribution", hasSize(4)));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should handle different date ranges correctly")
    void shouldHandleDifferentDateRanges() throws Exception {
        // Arrange
        ReportsResponseDTO mockResponse = createMockReportsResponse();
        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-01-01T00:00:00")
                        .param("endDate", "2025-12-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should handle trainers with zero hours")
    void shouldHandleTrainersWithZeroHours() throws Exception {
        // Arrange
        TrainerReportResponseDTO inactiveTrainer = new TrainerReportResponseDTO(
                UUID.randomUUID(),
                "Inactive Trainer",
                0.0,
                0,
                0,
                CompensationType.HOURLY,
                Collections.emptyList()
        );

        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                List.of(inactiveTrainer),
                createMockAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainerReports[0].hoursWorked", is(0.0)))
                .andExpect(jsonPath("$.trainerReports[0].classesGiven", is(0)))
                .andExpect(jsonPath("$.trainerReports[0].studentsManaged", is(0)));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should handle trainers with different compensation types")
    void shouldHandleTrainersWithDifferentCompensationTypes() throws Exception {
        // Arrange
        List<TrainerReportResponseDTO> trainers = Arrays.asList(
                new TrainerReportResponseDTO(
                        UUID.randomUUID(),
                        "Hourly Trainer",
                        10.0,
                        5,
                        3,
                        CompensationType.HOURLY,
                        Arrays.asList("Yoga")
                ),
                new TrainerReportResponseDTO(
                        UUID.randomUUID(),
                        "Monthly Trainer",
                        40.0,
                        20,
                        15,
                        CompensationType.MONTHLY,
                        Arrays.asList("CrossFit")
                )
        );

        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                trainers,
                createMockAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainerReports", hasSize(2)))
                .andExpect(jsonPath("$.trainerReports[0].compensation", is("HOURLY")))
                .andExpect(jsonPath("$.trainerReports[1].compensation", is("MONTHLY")));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should return all age distribution groups even when empty")
    void shouldReturnAllAgeDistributionGroups() throws Exception {
        // Arrange
        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                Collections.emptyList(),
                createEmptyAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ageDistribution", hasSize(4)))
                .andExpect(jsonPath("$.ageDistribution[0].ageRange", is("18-25")))
                .andExpect(jsonPath("$.ageDistribution[1].ageRange", is("26-35")))
                .andExpect(jsonPath("$.ageDistribution[2].ageRange", is("36-45")))
                .andExpect(jsonPath("$.ageDistribution[3].ageRange", is("46+")));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should handle trainers with multiple specialties")
    void shouldHandleTrainersWithMultipleSpecialties() throws Exception {
        // Arrange
        TrainerReportResponseDTO trainer = new TrainerReportResponseDTO(
                UUID.randomUUID(),
                "Multi-Specialty Trainer",
                25.0,
                15,
                10,
                CompensationType.HOURLY,
                Arrays.asList("Pilates", "Yoga", "Dança", "Aeróbica")
        );

        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                List.of(trainer),
                createMockAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainerReports[0].specialties", hasSize(4)))
                .andExpect(jsonPath("$.trainerReports[0].specialties[0]", is("Pilates")))
                .andExpect(jsonPath("$.trainerReports[0].specialties[1]", is("Yoga")))
                .andExpect(jsonPath("$.trainerReports[0].specialties[2]", is("Dança")))
                .andExpect(jsonPath("$.trainerReports[0].specialties[3]", is("Aeróbica")));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    @Test
    @DisplayName("GET /reports - Should handle trainers with no specialties")
    void shouldHandleTrainersWithNoSpecialties() throws Exception {
        // Arrange
        TrainerReportResponseDTO trainer = new TrainerReportResponseDTO(
                UUID.randomUUID(),
                "No Specialty Trainer",
                10.0,
                5,
                3,
                CompensationType.MONTHLY,
                Collections.emptyList()
        );

        ReportsResponseDTO mockResponse = new ReportsResponseDTO(
                List.of(trainer),
                createMockAgeDistribution()
        );

        when(reportsService.generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(get("/reports")
                        .param("startDate", "2025-10-01T00:00:00")
                        .param("endDate", "2025-10-31T23:59:59")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainerReports[0].specialties", hasSize(0)));

        verify(reportsService).generateReports(any(LocalDateTime.class), any(LocalDateTime.class), eq(null));
    }

    // Helper methods

    private ReportsResponseDTO createMockReportsResponse() {
        List<TrainerReportResponseDTO> trainers = Arrays.asList(
                new TrainerReportResponseDTO(
                        UUID.randomUUID(),
                        "Prof. Ana Silva",
                        15.5,
                        10,
                        5,
                        CompensationType.HOURLY,
                        Arrays.asList("Pilates", "Yoga")
                ),
                new TrainerReportResponseDTO(
                        UUID.randomUUID(),
                        "Prof. Carlos Santos",
                        20.0,
                        15,
                        8,
                        CompensationType.MONTHLY,
                        Arrays.asList("Musculação", "CrossFit")
                )
        );

        return new ReportsResponseDTO(trainers, createMockAgeDistribution());
    }

    private List<AgeDistributionResponseDTO> createMockAgeDistribution() {
        return Arrays.asList(
                new AgeDistributionResponseDTO("18-25", 3, 30.0),
                new AgeDistributionResponseDTO("26-35", 4, 40.0),
                new AgeDistributionResponseDTO("36-45", 2, 20.0),
                new AgeDistributionResponseDTO("46+", 1, 10.0)
        );
    }

    private List<AgeDistributionResponseDTO> createEmptyAgeDistribution() {
        return Arrays.asList(
                new AgeDistributionResponseDTO("18-25", 0, 0.0),
                new AgeDistributionResponseDTO("26-35", 0, 0.0),
                new AgeDistributionResponseDTO("36-45", 0, 0.0),
                new AgeDistributionResponseDTO("46+", 0, 0.0)
        );
    }
}
