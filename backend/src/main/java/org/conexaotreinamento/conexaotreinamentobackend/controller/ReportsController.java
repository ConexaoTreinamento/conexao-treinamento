package org.conexaotreinamento.conexaotreinamentobackend.controller;

import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.ReportsResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.service.ReportsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportsService reportsService;

    /**
     * Get comprehensive reports including trainer performance and student demographics
     *
     * @param startDate Start date and time for the reporting period (ISO format)
     * @param endDate   End date and time for the reporting period (ISO format)
     * @param trainerId Optional trainer ID to filter reports by specific trainer
     * @return ReportsResponseDTO containing all report data
     */
    @GetMapping
    public ResponseEntity<ReportsResponseDTO> getReports(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) UUID trainerId) {
        
        ReportsResponseDTO reports = reportsService.generateReports(startDate, endDate, trainerId);
        return ResponseEntity.ok(reports);
    }
}

