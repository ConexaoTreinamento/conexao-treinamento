package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.AgeRangeValidator;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.DateRangeValidator;
import org.conexaotreinamento.conexaotreinamentobackend.specification.StudentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Student entities.
 * Handles all business logic related to students.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final PhysicalImpairmentRepository physicalImpairmentRepository;
    private final StudentMapper studentMapper;
    private final StudentValidationService validationService;
    private final AgeRangeValidator ageRangeValidator;
    private final DateRangeValidator dateRangeValidator;

    /**
     * Creates a new student with anamnesis and physical impairments.
     * 
     * @param request Student creation request
     * @return Created student details
     */
    public StudentResponseDTO create(StudentRequestDTO request) {
        log.info("Creating student: {}", request.email());
        
        // Validate email uniqueness
        validationService.validateEmailUniqueness(request.email());
        
        // Map and save student
        Student student = studentMapper.toEntity(request);
        Student savedStudent = studentRepository.save(student);
        
        log.info("Student created successfully [ID: {}] - Name: {} {}", 
                savedStudent.getId(), savedStudent.getName(), savedStudent.getSurname());
        
        // Save anamnesis if provided
        Anamnesis anamnesis = null;
        if (request.anamnesis() != null) {
            log.debug("Creating anamnesis for student [ID: {}]", savedStudent.getId());
            anamnesis = studentMapper.toAnamnesisEntity(request.anamnesis(), savedStudent);
            anamnesis = anamnesisRepository.save(anamnesis);
            log.debug("Anamnesis created for student [ID: {}]", savedStudent.getId());
        }
        
        // Save physical impairments if provided
        List<PhysicalImpairment> impairments = null;
        if (request.physicalImpairments() != null && !request.physicalImpairments().isEmpty()) {
            log.debug("Creating {} physical impairments for student [ID: {}]", 
                    request.physicalImpairments().size(), savedStudent.getId());
            
            impairments = request.physicalImpairments().stream()
                    .map(dto -> studentMapper.toImpairmentEntity(dto, savedStudent))
                    .toList();
            impairments = physicalImpairmentRepository.saveAll(impairments);
            
            log.debug("Physical impairments created for student [ID: {}]", savedStudent.getId());
        }
        
        return studentMapper.toResponse(savedStudent, anamnesis, impairments);
    }

    /**
     * Finds a student by ID.
     * 
     * @param id Student ID
     * @return Student details
     * @throws ResourceNotFoundException if student not found
     */
    public StudentResponseDTO findById(UUID id) {
        log.debug("Finding student by ID: {}", id);
        
        Student student = findEntityById(id);
        Anamnesis anamnesis = anamnesisRepository.findById(student.getId()).orElse(null);
        List<PhysicalImpairment> impairments = physicalImpairmentRepository.findByStudentId(student.getId());
        
        return studentMapper.toResponse(student, anamnesis, impairments);
    }

    /**
     * Finds all students with optional filters and pagination.
     * 
     * @param search Search term for name/email
     * @param gender Gender filter
     * @param profession Profession filter
     * @param minAge Minimum age
     * @param maxAge Maximum age
     * @param startDate Registration start date
     * @param endDate Registration end date
     * @param includeInactive Include soft-deleted students
     * @param pageable Pagination parameters
     * @return Paginated list of students
     */
    public PageResponse<StudentResponseDTO> findAll(
            String search, 
            Student.Gender gender, 
            String profession, 
            Integer minAge,
            Integer maxAge,
            LocalDate startDate,
            LocalDate endDate,
            boolean includeInactive, 
            Pageable pageable) {
        
        log.debug("Finding all students with filters - search: {}, gender: {}, minAge: {}, maxAge: {}",
                search, gender, minAge, maxAge);
        
        // Validate age and date ranges
        ageRangeValidator.validate(minAge, maxAge);
        dateRangeValidator.validate(startDate, endDate);
        
        // Build specification for dynamic filtering
        Specification<Student> spec = StudentSpecifications.withFilters(
            search,
            gender,
            profession,
            minAge,
            maxAge,
            startDate,
            endDate,
            includeInactive
        );
        
        Page<Student> page = studentRepository.findAll(spec, pageable);
        
        log.debug("Found {} students (page {}/{})", 
                page.getNumberOfElements(), page.getNumber() + 1, page.getTotalPages());
        
        return PageResponse.of(page, studentMapper::toResponse);
    }

    /**
     * Updates an existing student.
     * 
     * @param id Student ID
     * @param request Updated student data
     * @return Updated student details
     * @throws ResourceNotFoundException if student not found
     * @throws BusinessException if email already exists
     */
    public StudentResponseDTO update(UUID id, StudentRequestDTO request) {
        log.info("Updating student [ID: {}]", id);
        
        Student student = findEntityById(id);
        
        // Validate email uniqueness if changed
        if (!student.getEmail().equalsIgnoreCase(request.email())) {
            validationService.validateEmailUniqueness(request.email(), id);
        }
        
        // Update student entity
        studentMapper.updateEntity(request, student);
        Student savedStudent = studentRepository.save(student);
        
        log.info("Student updated successfully [ID: {}]", id);
        
        // Update or create anamnesis
        Anamnesis anamnesis = anamnesisRepository.findById(savedStudent.getId()).orElse(null);
        if (request.anamnesis() != null) {
            if (anamnesis == null) {
                anamnesis = studentMapper.toAnamnesisEntity(request.anamnesis(), savedStudent);
            } else {
                studentMapper.updateAnamnesisEntity(request.anamnesis(), anamnesis);
            }
            anamnesis = anamnesisRepository.save(anamnesis);
        } else if (anamnesis != null) {
            // Remove anamnesis if not provided
            anamnesisRepository.delete(anamnesis);
            anamnesis = null;
        }
        
        // Replace physical impairments
        physicalImpairmentRepository.deleteAllByStudentId(savedStudent.getId());
        
        List<PhysicalImpairment> impairments = null;
        if (request.physicalImpairments() != null && !request.physicalImpairments().isEmpty()) {
            impairments = request.physicalImpairments().stream()
                    .map(dto -> studentMapper.toImpairmentEntity(dto, savedStudent))
                    .toList();
            impairments = physicalImpairmentRepository.saveAll(impairments);
        }
        
        return studentMapper.toResponse(savedStudent, anamnesis, impairments);
    }

    /**
     * Soft deletes a student.
     * 
     * @param id Student ID
     * @throws ResourceNotFoundException if student not found
     */
    public void delete(UUID id) {
        log.info("Deleting student [ID: {}]", id);
        
        Student student = findEntityById(id);
        student.setDeletedAt(Instant.now());
        studentRepository.save(student);
        
        log.info("Student deleted successfully [ID: {}]", id);
    }

    /**
     * Restores a soft-deleted student.
     * 
     * @param id Student ID
     * @return Restored student details
     * @throws ResourceNotFoundException if student not found
     * @throws BusinessException if student is not deleted or email conflict
     */
    public StudentResponseDTO restore(UUID id) {
        log.info("Restoring student [ID: {}]", id);
        
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));

        if (student.getDeletedAt() == null) {
            throw new BusinessException("Student is not deleted", "NOT_DELETED");
        }
        
        // Check for email conflict
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(student.getEmail())) {
            log.warn("Student restoration failed [ID: {}] - Email conflict", id);
            throw new BusinessException(
                    "Cannot restore student: email already in use by another active student",
                    "EMAIL_CONFLICT"
            );
        }

        student.setDeletedAt(null);
        student = studentRepository.save(student);

        log.info("Student restored successfully [ID: {}]", id);

        Anamnesis anamnesis = anamnesisRepository.findById(id).orElse(null);
        List<PhysicalImpairment> impairments = physicalImpairmentRepository.findByStudentId(id);
        
        return studentMapper.toResponse(student, anamnesis, impairments);
    }

    /**
     * Finds all active (non-deleted) students.
     * 
     * @return List of active students
     */
    public List<Student> findAllActive() {
        return studentRepository.findByDeletedAtIsNull();
    }
    
    /**
     * Helper method to find a student entity by ID.
     * 
     * @param id Student ID
     * @return Student entity
     * @throws ResourceNotFoundException if not found
     */
    private Student findEntityById(UUID id) {
        return studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    }
}
