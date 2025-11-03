package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Validated
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<StudentResponseDTO> createStudent(@RequestBody @Valid StudentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<StudentResponseDTO>> findAllStudents(
            @RequestParam(required = false) String search,
            
            @RequestParam(required = false)
            @Pattern(regexp = "(?i)^[MFO]$", message = "Gender must be M, F, or O")
            String gender,
            
            @RequestParam(required = false) String profession,
            
            @RequestParam(required = false)
            @Min(value = 0, message = "Minimum age must be 0 or greater")
            @Max(value = 150, message = "Minimum age must be 150 or less")
            Integer minAge,
            
            @RequestParam(required = false)
            @Min(value = 0, message = "Maximum age must be 0 or greater")
            @Max(value = 150, message = "Maximum age must be 150 or less")
            Integer maxAge,
            
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate registrationPeriodMinDate,
            
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate registrationPeriodMaxDate,
            
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        // Additional validation for age range
        if (minAge != null && maxAge != null && maxAge < minAge) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Maximum age (%d) must be greater than or equal to minimum age (%d)".formatted(maxAge, minAge));
        }
        
        // Additional validation for date range
        if (registrationPeriodMinDate != null && registrationPeriodMaxDate != null && registrationPeriodMaxDate.isBefore(registrationPeriodMinDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Registration period max date (%s) must be after or equal to the min date (%s)".formatted(registrationPeriodMaxDate, registrationPeriodMinDate));
        }
        
        Student.Gender genderEnum = null;
        if (gender != null && !gender.isBlank()) {
            genderEnum = Student.Gender.valueOf(gender.toUpperCase());
        }
        
        return ResponseEntity.ok(studentService.findAll(search, genderEnum, profession, minAge, maxAge,
                registrationPeriodMinDate, registrationPeriodMaxDate, includeInactive, pageable));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentResponseDTO> findStudentById(@PathVariable UUID studentId) {
        return ResponseEntity.ok(studentService.findById(studentId));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<StudentResponseDTO> updateStudent(@PathVariable UUID studentId, @RequestBody @Valid StudentRequestDTO request) {
        return ResponseEntity.ok(studentService.update(studentId, request));
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID studentId) {
        studentService.delete(studentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{studentId}/restore")
    public ResponseEntity<StudentResponseDTO> restoreStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(studentService.restore(studentId));
    }
}
