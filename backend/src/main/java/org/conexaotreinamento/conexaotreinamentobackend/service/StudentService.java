package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final PhysicalImpairmentRepository physicalImpairmentRepository;

    @Transactional
    public StudentResponseDTO create(StudentRequestDTO request) {
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student with this email already exists");
        }

        throw new UnsupportedOperationException("Not implemented yet");
    }

    public StudentResponseDTO findById(UUID id) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        return StudentResponseDTO.fromEntity(student);
    }

    public Page<StudentResponseDTO> findAll(
            String search, 
            Student.Gender gender, 
            String profession, 
            String ageRange, 
            String joinPeriod, 
            boolean includeInactive, 
            Pageable pageable) {
        
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                    Sort.by("createdAt").descending());
        }
        
        // Process search term
        String searchTerm = null;
        if (search != null && !search.isBlank()) {
            searchTerm = "%" + search.toLowerCase() + "%";
        }
        
        // Process profession filter
        String professionFilter = null;
        if (profession != null && !profession.isBlank() && !"all".equals(profession)) {
            professionFilter = "%" + profession.toLowerCase() + "%";
        }
        
        // Process age range filter
        Integer minAge = null;
        Integer maxAge = null;
        if (ageRange != null && !"all".equals(ageRange)) {
            switch (ageRange) {
                case "18-25":
                    minAge = 18;
                    maxAge = 25;
                    break;
                case "26-35":
                    minAge = 26;
                    maxAge = 35;
                    break;
                case "36-45":
                    minAge = 36;
                    maxAge = 45;
                    break;
                case "46+":
                    minAge = 46;
                    break;
            }
        }
        
        // Process join period filter
        Instant joinedAfter = null;
        Instant joinedBefore = null;
        if (joinPeriod != null && !"all".equals(joinPeriod)) {
            switch (joinPeriod) {
                case "2024":
                    joinedAfter = LocalDate.of(2024, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                    joinedBefore = LocalDate.of(2024, 12, 31).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
                    break;
                case "2023":
                    joinedAfter = LocalDate.of(2023, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                    joinedBefore = LocalDate.of(2023, 12, 31).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
                    break;
                case "older":
                    joinedBefore = LocalDate.of(2023, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                    break;
            }
        }
        
        Page<Student> students = studentRepository.findWithFilters(
                searchTerm,
                gender,
                professionFilter,
                minAge,
                maxAge,
                joinedAfter,
                joinedBefore,
                includeInactive,
                pageable
        );
        
        return students.map(StudentResponseDTO::fromEntity);
    }

    @Transactional
    public StudentResponseDTO update(UUID id, StudentRequestDTO request) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // If the email is different, check if the new email already exists
        if (!student.getEmail().equalsIgnoreCase(request.email())) {
            if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Student with this email already exists");
            }
        }

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Transactional
    public void delete(UUID id) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        student.deactivate();
    }

    @Transactional
    public StudentResponseDTO restore(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        if (student.isActive() || studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(student.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore student.");
        }

        student.activate();
        return StudentResponseDTO.fromEntity(student);
    }
}
