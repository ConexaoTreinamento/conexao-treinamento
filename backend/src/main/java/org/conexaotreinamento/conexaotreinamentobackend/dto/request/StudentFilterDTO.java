package org.conexaotreinamento.conexaotreinamentobackend.dto.request;

import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record StudentFilterDTO(
        String search,
        
        @Pattern(regexp = "^[MFO]$", message = "Gender must be M, F, or O")
        String gender,
        
        String profession,
        
        @Min(value = 0, message = "Minimum age must be 0 or greater")
        @Max(value = 150, message = "Minimum age must be 150 or less")
        Integer minAge,
        
        @Min(value = 0, message = "Maximum age must be 0 or greater")  
        @Max(value = 150, message = "Maximum age must be 150 or less")
        Integer maxAge,
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate startDate,
        
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)  
        LocalDate endDate,
        
        boolean includeInactive
) {
    
    @AssertTrue(message = "Maximum age must be greater than or equal to minimum age")
    public boolean isAgeRangeValid() {
        if (minAge == null || maxAge == null) {
            return true; // Skip validation if either is null
        }
        return maxAge >= minAge;
    }
    
    @AssertTrue(message = "End date must be after or equal to start date")
    public boolean isDateRangeValid() {
        if (startDate == null || endDate == null) {
            return true; // Skip validation if either is null
        }
        return !endDate.isBefore(startDate);
    }
}
