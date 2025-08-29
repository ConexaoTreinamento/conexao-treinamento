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
        
        throw new UnsupportedOperationException("Not implemented yet");
    }

    public Page<StudentResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                    Sort.by("createdAt").descending());
        }
        
        Page<Student> students;
        if (search == null || search.isBlank()) {
            students = includeInactive ? 
                studentRepository.findAll(pageable) : 
                studentRepository.findByDeletedAtIsNull(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";
            students = includeInactive ? 
                studentRepository.findBySearchTermIncludingInactive(searchTerm, pageable) :
                studentRepository.findBySearchTermAndDeletedAtIsNull(searchTerm, pageable);
        }
        
        throw new UnsupportedOperationException("Not implemented yet - need to map to DTOs");
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
        throw new UnsupportedOperationException("Not implemented yet - need to map to DTO");
    }
}
