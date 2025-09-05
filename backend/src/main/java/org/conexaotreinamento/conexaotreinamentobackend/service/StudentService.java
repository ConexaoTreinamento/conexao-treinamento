package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AnamnesisResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalImpairmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalImpairmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
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

import java.util.ArrayList;
import java.util.List;
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



            Student student = new Student(request.email(),request.name(), request.surname(), request.gender(), request.birthDate());
        student.setPhone(request.phone());
        student.setProfession(request.profession());
        student.setStreet(request.street());
        student.setNumber(request.number());
        student.setComplement(request.complement());
        student.setNeighborhood(request.neighborhood());
        student.setCep(request.cep());
        student.setEmergencyContactName(request.emergencyContactName());
        student.setEmergencyContactPhone(request.emergencyContactPhone());
        student.setEmergencyContactRelationship(request.emergencyContactRelationship());
        student.setObjectives(request.objectives());
        student.setObservations(request.observations());

        Student savedStudent = studentRepository.save(student);

        Anamnesis anamnesis = new Anamnesis(savedStudent);
        anamnesis.setStudent(student);
        anamnesis.setMedication(request.anamnesis().medication());
        anamnesis.setDoctorAwareOfPhysicalActivity(request.anamnesis().isDoctorAwareOfPhysicalActivity());
        anamnesis.setFavoritePhysicalActivity(request.anamnesis().favoritePhysicalActivity());
        anamnesis.setHasInsomnia(request.anamnesis().hasInsomnia());
        anamnesis.setDietOrientedBy(request.anamnesis().dietOrientedBy());
        anamnesis.setCardiacProblems(request.anamnesis().cardiacProblems());
        anamnesis.setHasHypertension(request.anamnesis().hasHypertension());
        anamnesis.setChronicDiseases(request.anamnesis().chronicDiseases());
        anamnesis.setDifficultiesInPhysicalActivities(request.anamnesis().difficultiesInPhysicalActivities());
        anamnesis.setMedicalOrientationsToAvoidPhysicalActivity(request.anamnesis().medicalOrientationsToAvoidPhysicalActivity());
        anamnesis.setSurgeriesInTheLast12Months(request.anamnesis().surgeriesInTheLast12Months());
        anamnesis.setRespiratoryProblems(request.anamnesis().respiratoryProblems());
        anamnesis.setJointMuscularBackPain(request.anamnesis().jointMuscularBackPain());
        anamnesis.setSpinalDiscProblems(request.anamnesis().spinalDiscProblems());
        anamnesis.setDiabetes(request.anamnesis().diabetes());
        anamnesis.setSmokingDuration(request.anamnesis().smokingDuration());
        anamnesis.setAlteredCholesterol(request.anamnesis().alteredCholesterol());
        anamnesis.setOsteoporosisLocation(request.anamnesis().osteoporosisLocation());

        Anamnesis savedAnamnesis = anamnesisRepository.save(anamnesis);

        List<PhysicalImpairment> savedImpairments = new ArrayList<>();
        if (request.physicalImpairments() != null) {
            for (PhysicalImpairmentRequestDTO dto : request.physicalImpairments()) {
                PhysicalImpairment impairment = new PhysicalImpairment(
                        savedStudent,
                        dto.type(),
                        dto.name(),
                        dto.observations()
                );
                savedImpairments.add(physicalImpairmentRepository.save(impairment));
            }
        }

        AnamnesisResponseDTO responseAnamnesis = AnamnesisResponseDTO.fromEntity(savedAnamnesis);

        List<PhysicalImpairmentResponseDTO> responsePhysicalImpairments = savedImpairments.stream()
                .map(PhysicalImpairmentResponseDTO::fromEntity)
                .toList();

        return StudentResponseDTO.fromEntity(savedStudent, responseAnamnesis, responsePhysicalImpairments);

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
