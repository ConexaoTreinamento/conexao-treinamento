package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AnamnesisRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AnamnesisResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalImpairmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.specification.StudentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AnamnesisRepository anamnesisRepository;
    private final PhysicalImpairmentRepository physicalImpairmentRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public StudentResponseDTO create(StudentRequestDTO request) {
        if (studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student with this email already exists");
        }

        // Build student entity from request
        Student student = new Student(request.email(), request.name(), request.surname(), request.gender(), request.birthDate());
        applyDTOFields(request, student);

        // registrationDate is defaulted by DB; set it here to keep entity consistent
        student.setRegistrationDate(LocalDate.now());

        // Persist student first to generate UUID (used by Anamnesis and PhysicalImpairments)
        Student savedStudent = studentRepository.save(student);

        // Save anamnesis if provided
        if (request.anamnesis() != null) {
            var dto = request.anamnesis();
            org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis anamnesis = new org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis(savedStudent);
            createOrEditAnamnesis(dto, anamnesis);

            anamnesisRepository.save(anamnesis);
        }

        // Save physical impairments if provided
        return createOrEditPhysicalImpairments(request, savedStudent);
    }

    private void applyDTOFields(StudentRequestDTO request, Student student) {
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
    }

    public StudentResponseDTO findById(UUID id) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Anamnesis anamnesisEntity = anamnesisRepository.findById(student.getId()).orElse(null);
        AnamnesisResponseDTO anamnesisDto = AnamnesisResponseDTO.fromEntity(anamnesisEntity);

        java.util.List<PhysicalImpairmentResponseDTO> physicalImpairments =
                physicalImpairmentRepository.findByStudentId(student.getId())
                        .stream()
                        .map(PhysicalImpairmentResponseDTO::fromEntity)
                        .toList();

        return new StudentResponseDTO(
                student.getId(),
                student.getEmail(),
                student.getName(),
                student.getSurname(),
                student.getGender(),
                student.getBirthDate(),
                student.getPhone(),
                student.getProfession(),
                student.getStreet(),
                student.getNumber(),
                student.getComplement(),
                student.getNeighborhood(),
                student.getCep(),
                student.getEmergencyContactName(),
                student.getEmergencyContactPhone(),
                student.getEmergencyContactRelationship(),
                student.getObjectives(),
                student.getObservations(),
                student.getRegistrationDate(),
                student.getCreatedAt(),
                student.getUpdatedAt(),
                student.getDeletedAt(),
                anamnesisDto,
                physicalImpairments
        );
    }

    public Page<StudentResponseDTO> findAll(
            String search, 
            Student.Gender gender, 
            String profession, 
            Integer minAge,
            Integer maxAge,
            LocalDate startDate,
            LocalDate endDate,
            boolean includeInactive, 
            Pageable pageable) {
        
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending()
            );
        }
        
        // Use specifications for dynamic filtering
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
        
        Page<Student> students = studentRepository.findAll(spec, pageable);
        
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

        // Update basic fields
        student.setEmail(request.email());
        student.setName(request.name());
        student.setSurname(request.surname());
        student.setGender(request.gender());
        student.setBirthDate(request.birthDate());
        applyDTOFields(request, student);

        Student savedStudent = studentRepository.save(student);

        // Update or create anamnesis
        if (request.anamnesis() != null) {
            var dto = request.anamnesis();
            var existing = anamnesisRepository.findById(savedStudent.getId());
            // To avoid Hibernate StaleObjectStateException caused by merging a detached Anamnesis,
            // delete the existing row, flush the persistence context, then persist a fresh instance.
            if (existing.isPresent()) {
                anamnesisRepository.deleteById(savedStudent.getId());
                entityManager.flush();
            }

            Anamnesis anamnesis = getAnamnesis(savedStudent, dto);
            anamnesisRepository.saveAndFlush(anamnesis);
        }

        // Replace physical impairments
        physicalImpairmentRepository.deleteAllByStudentId(savedStudent.getId());
        return createOrEditPhysicalImpairments(request, savedStudent);
    }

    private static Anamnesis getAnamnesis(Student savedStudent, AnamnesisRequestDTO dto) {
        Anamnesis anamnesis = new Anamnesis(savedStudent);
        createOrEditAnamnesis(dto, anamnesis);
        return anamnesis;
    }

    private static void createOrEditAnamnesis(AnamnesisRequestDTO dto, Anamnesis anamnesis) {
        anamnesis.setMedication(dto.medication());
        anamnesis.setDoctorAwareOfPhysicalActivity(dto.isDoctorAwareOfPhysicalActivity());
        anamnesis.setFavoritePhysicalActivity(dto.favoritePhysicalActivity());
        anamnesis.setHasInsomnia(dto.hasInsomnia());
        anamnesis.setDietOrientedBy(dto.dietOrientedBy());
        anamnesis.setCardiacProblems(dto.cardiacProblems());
        anamnesis.setHasHypertension(dto.hasHypertension());
        anamnesis.setChronicDiseases(dto.chronicDiseases());
        anamnesis.setDifficultiesInPhysicalActivities(dto.difficultiesInPhysicalActivities());
        anamnesis.setMedicalOrientationsToAvoidPhysicalActivity(dto.medicalOrientationsToAvoidPhysicalActivity());
        anamnesis.setSurgeriesInTheLast12Months(dto.surgeriesInTheLast12Months());
        anamnesis.setRespiratoryProblems(dto.respiratoryProblems());
        anamnesis.setJointMuscularBackPain(dto.jointMuscularBackPain());
        anamnesis.setSpinalDiscProblems(dto.spinalDiscProblems());
        anamnesis.setDiabetes(dto.diabetes());
        anamnesis.setSmokingDuration(dto.smokingDuration());
        anamnesis.setAlteredCholesterol(dto.alteredCholesterol());
        anamnesis.setOsteoporosisLocation(dto.osteoporosisLocation());
    }

    private StudentResponseDTO createOrEditPhysicalImpairments(StudentRequestDTO request, Student savedStudent) {
        if (request.physicalImpairments() != null && !request.physicalImpairments().isEmpty()) {
            List<PhysicalImpairment> toSave = request.physicalImpairments().stream().map(pi -> new PhysicalImpairment(
                    savedStudent,
                    pi.type(),
                    pi.name(),
                    pi.observations()
            )).toList();
            physicalImpairmentRepository.saveAll(toSave);
        }

        return StudentResponseDTO.fromEntity(savedStudent);
    }

    @Transactional
    public void delete(UUID id) {
        Student student = studentRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        student.deactivate();

        studentRepository.save(student);
    }

    @Transactional
    public StudentResponseDTO restore(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        if (student.isActive() || studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(student.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore student.");
        }

        student.activate();

        studentRepository.save(student);

        return StudentResponseDTO.fromEntity(student);
    }
}
