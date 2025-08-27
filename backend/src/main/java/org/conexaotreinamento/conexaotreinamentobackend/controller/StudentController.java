package org.conexaotreinamento.conexaotreinamentobackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<StudentResponseDTO> create(@RequestBody @Valid StudentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping
    public ResponseEntity<Page<StudentResponseDTO>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String ageRange,
            @RequestParam(required = false) String joinPeriod,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Student.Gender genderEnum = null;
        if (gender != null && !gender.isBlank() && !"all".equals(gender)) {
            try {
                genderEnum = Student.Gender.valueOf(gender.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid gender value: %s. Valid values are: M, F, O".formatted(gender)
                );
            }
        }
        
        // Validate age range
        if (ageRange != null && !ageRange.isBlank() && !"all".equals(ageRange)) {
            if (!ageRange.matches("18-25|26-35|36-45|46\\+")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid age range: %s. Valid values are: 18-25, 26-35, 36-45, 46+".formatted(ageRange)
                );
            }
        }
        
        // Validate join period
        if (joinPeriod != null && !joinPeriod.isBlank() && !"all".equals(joinPeriod)) {
            if (!joinPeriod.matches("2024|2023|older")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid join period: %s. Valid values are: 2024, 2023, older".formatted(joinPeriod)
                );
            }
        }
        
        return ResponseEntity.ok(studentService.findAll(search, genderEnum, profession, ageRange, joinPeriod, includeInactive, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid StudentRequestDTO request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<StudentResponseDTO> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.restore(id));
    }
}
