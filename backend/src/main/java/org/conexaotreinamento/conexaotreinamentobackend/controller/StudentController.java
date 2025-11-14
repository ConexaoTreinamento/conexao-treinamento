package org.conexaotreinamento.conexaotreinamentobackend.controller;

import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.ErrorResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for Student management.
 * Handles CRUD operations and filtering for students.
 */
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Students", description = "Student management endpoints")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @Operation(summary = "Create a new student", description = "Creates a new student with anamnesis and physical impairments if provided")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Student created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentResponseDTO> createStudent(
            @RequestBody @Valid 
            @Parameter(description = "Student creation data") 
            StudentRequestDTO request) {
        
        log.info("Creating new student - Name: {}, Email: {}", request.name(), request.email());
        StudentResponseDTO response = studentService.create(request);
        
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        
        log.info("Student created successfully [ID: {}] - Name: {}", response.id(), response.name());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID", description = "Retrieves a student with all details including anamnesis and physical impairments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Student found"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentResponseDTO> findStudentById(
            @PathVariable 
            @Parameter(description = "Student ID") 
            UUID id) {
        
        log.debug("Fetching student by ID: {}", id);
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping
    @Operation(summary = "List all students", description = "Retrieves a paginated list of students with optional filters")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Students retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid filter parameters", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PageResponse<StudentResponseDTO>> findAllStudents(
            @RequestParam(required = false) 
            @Parameter(description = "Search term for name/email") 
            String search,
            
            @RequestParam(required = false)
            @Pattern(regexp = "(?i)^[MFO]$", message = "Gender must be M, F, or O")
            @Parameter(description = "Gender filter (M, F, or O)") 
            String gender,
            
            @RequestParam(required = false) 
            @Parameter(description = "Profession filter") 
            String profession,
            
            @RequestParam(required = false)
            @Min(value = 0, message = "Minimum age must be 0 or greater")
            @Max(value = 150, message = "Minimum age must be 150 or less")
            @Parameter(description = "Minimum age filter") 
            Integer minAge,
            
            @RequestParam(required = false)
            @Min(value = 0, message = "Maximum age must be 0 or greater")
            @Max(value = 150, message = "Maximum age must be 150 or less")
            @Parameter(description = "Maximum age filter") 
            Integer maxAge,
            
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "Registration start date") 
            LocalDate registrationPeriodMinDate,
            
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "Registration end date") 
            LocalDate registrationPeriodMaxDate,
            
            @RequestParam(required = false, defaultValue = "false") 
            @Parameter(description = "Include soft-deleted students") 
            boolean includeInactive,
            
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            @Parameter(hidden = true) 
            Pageable pageable) {
        
        Student.Gender genderEnum = null;
        if (gender != null && !gender.isBlank()) {
            genderEnum = Student.Gender.valueOf(gender.toUpperCase());
        }
        
        PageResponse<StudentResponseDTO> response = studentService.findAll(
                search, genderEnum, profession, minAge, maxAge,
                registrationPeriodMinDate, registrationPeriodMaxDate, includeInactive, pageable);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update student", description = "Updates all fields of a student including anamnesis and physical impairments")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Student updated successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email already exists", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentResponseDTO> updateStudent(
            @PathVariable 
            @Parameter(description = "Student ID") 
            UUID id, 
            @RequestBody @Valid 
            @Parameter(description = "Updated student data") 
            StudentRequestDTO request) {
        
        log.info("Updating student [ID: {}] - Name: {}", id, request.name());
        StudentResponseDTO response = studentService.update(id, request);
        log.info("Student updated successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete student", description = "Soft deletes a student (marks as inactive)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Student deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void deleteStudent(
            @PathVariable 
            @Parameter(description = "Student ID") 
            UUID id) {
        
        log.info("Deleting student [ID: {}]", id);
        studentService.delete(id);
        log.info("Student deleted successfully [ID: {}]", id);
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore student", description = "Restores a soft-deleted student")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Student restored successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Email conflict or student not deleted", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<StudentResponseDTO> restoreStudent(
            @PathVariable 
            @Parameter(description = "Student ID") 
            UUID id) {
        
        log.info("Restoring student [ID: {}]", id);
        StudentResponseDTO response = studentService.restore(id);
        log.info("Student restored successfully [ID: {}]", id);
        return ResponseEntity.ok(response);
    }
}
