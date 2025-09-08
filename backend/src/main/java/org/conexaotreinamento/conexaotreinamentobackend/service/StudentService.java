package org.conexaotreinamento.conexaotreinamentobackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
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

        // Build student entity from request
        Student student = new Student(request.email(), request.name(), request.surname(), request.gender(), request.birthDate());
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
        // registrationDate is defaulted by DB; set it here to keep entity consistent
        student.setRegistrationDate(LocalDate.now());

        // Persist student first to generate UUID (used by Anamnesis and PhysicalImpairments)
        Student savedStudent = studentRepository.save(student);

        // Save anamnesis if provided
        if (request.anamnesis() != null) {
            var dto = request.anamnesis();
            org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis anamnesis = new org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis(savedStudent);
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

            anamnesisRepository.save(anamnesis);
        }

        // Save physical impairments if provided
        if (request.physicalImpairments() != null && !request.physicalImpairments().isEmpty()) {
            java.util.List<org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment> toSave = new java.util.ArrayList<>();
            for (var pi : request.physicalImpairments()) {
                toSave.add(new org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment(
                        savedStudent,
                        pi.type(),
                        pi.name(),
                        pi.observations()
                ));
            }
            physicalImpairmentRepository.saveAll(toSave);
        }

        return StudentResponseDTO.fromEntity(savedStudent);
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

        Student savedStudent = studentRepository.save(student);

        // Update or create anamnesis
        if (request.anamnesis() != null) {
            var dto = request.anamnesis();
            var existing = anamnesisRepository.findById(savedStudent.getId());
            if (existing.isPresent()) {
                var anam = existing.get();
                anam.setMedication(dto.medication());
                anam.setDoctorAwareOfPhysicalActivity(dto.isDoctorAwareOfPhysicalActivity());
                anam.setFavoritePhysicalActivity(dto.favoritePhysicalActivity());
                anam.setHasInsomnia(dto.hasInsomnia());
                anam.setDietOrientedBy(dto.dietOrientedBy());
                anam.setCardiacProblems(dto.cardiacProblems());
                anam.setHasHypertension(dto.hasHypertension());
                anam.setChronicDiseases(dto.chronicDiseases());
                anam.setDifficultiesInPhysicalActivities(dto.difficultiesInPhysicalActivities());
                anam.setMedicalOrientationsToAvoidPhysicalActivity(dto.medicalOrientationsToAvoidPhysicalActivity());
                anam.setSurgeriesInTheLast12Months(dto.surgeriesInTheLast12Months());
                anam.setRespiratoryProblems(dto.respiratoryProblems());
                anam.setJointMuscularBackPain(dto.jointMuscularBackPain());
                anam.setSpinalDiscProblems(dto.spinalDiscProblems());
                anam.setDiabetes(dto.diabetes());
                anam.setSmokingDuration(dto.smokingDuration());
                anam.setAlteredCholesterol(dto.alteredCholesterol());
                anam.setOsteoporosisLocation(dto.osteoporosisLocation());
                anamnesisRepository.save(anam);
            } else {
                org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis anamnesis = new org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis(savedStudent);
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
                anamnesisRepository.save(anamnesis);
            }
        }

        // Replace physical impairments
        physicalImpairmentRepository.deleteByStudentId(savedStudent.getId());
        if (request.physicalImpairments() != null && !request.physicalImpairments().isEmpty()) {
            java.util.List<org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment> toSave = new java.util.ArrayList<>();
            for (var pi : request.physicalImpairments()) {
                toSave.add(new org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment(
                        savedStudent,
                        pi.type(),
                        pi.name(),
                        pi.observations()
                ));
            }
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
