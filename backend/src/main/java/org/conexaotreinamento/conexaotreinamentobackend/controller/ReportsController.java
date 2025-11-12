package org.conexaotreinamento.conexaotreinamentobackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ReportsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * REST controller for generating reports.
 * Provides comprehensive analytics on trainer performance and student demographics.
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Analytics and reporting endpoints")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping
    @Operation(
        summary = "Generate reports",
        description = "Generates comprehensive reports including trainer performance and student demographics for a specified period"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reports generated successfully")
    })
    public ResponseEntity<ReportsResponseDTO> getReports(
            @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "Start date and time for the reporting period (ISO format)", example = "2024-01-01T00:00:00")
            LocalDateTime startDate,
            
            @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "End date and time for the reporting period (ISO format)", example = "2024-12-31T23:59:59")
            LocalDateTime endDate,
            
            @RequestParam(required = false)
            @Parameter(description = "Optional trainer ID to filter reports by specific trainer")
            UUID trainerId) {
        
        log.debug("Generating reports - Start: {}, End: {}, Trainer: {}", startDate, endDate, trainerId);
        ReportsResponseDTO reports = reportsService.generateReports(startDate, endDate, trainerId);
        log.debug("Reports generated successfully");
        return ResponseEntity.ok(reports);
    }
}

