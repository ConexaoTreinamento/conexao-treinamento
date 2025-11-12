package org.conexaotreinamento.conexaotreinamentobackend.mapper;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AnamnesisRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalImpairmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AnamnesisResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.PhysicalImpairmentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Student entities and DTOs.
 * Centralizes all mapping logic for cleaner services.
 */
@Component
public class StudentMapper {
    
    /**
     * Maps Student entity to StudentResponseDTO.
     */
    public StudentResponseDTO toResponse(Student entity) {
        return toResponse(entity, null, null);
    }
    
    /**
     * Maps Student entity to StudentResponseDTO with anamnesis and impairments.
     */
    public StudentResponseDTO toResponse(
            Student entity, 
            Anamnesis anamnesis,
            List<PhysicalImpairment> impairments) {
        
        return new StudentResponseDTO(
                entity.getId(),
                entity.getEmail(),
                entity.getName(),
                entity.getSurname(),
                entity.getGender(),
                entity.getBirthDate(),
                entity.getPhone(),
                entity.getProfession(),
                entity.getStreet(),
                entity.getNumber(),
                entity.getComplement(),
                entity.getNeighborhood(),
                entity.getCep(),
                entity.getEmergencyContactName(),
                entity.getEmergencyContactPhone(),
                entity.getEmergencyContactRelationship(),
                entity.getObjectives(),
                entity.getObservations(),
                entity.getRegistrationDate(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getDeletedAt(),
                anamnesis != null ? toAnamnesisResponse(anamnesis) : null,
                impairments != null ? impairments.stream().map(this::toImpairmentResponse).toList() : Collections.emptyList()
        );
    }
    
    /**
     * Maps StudentRequestDTO to new Student entity.
     */
    public Student toEntity(StudentRequestDTO request) {
        Student student = new Student(
                request.email(),
                request.name(),
                request.surname(),
                request.gender(),
                request.birthDate()
        );
        
        applyRequestFields(request, student);
        student.setRegistrationDate(LocalDate.now());
        
        return student;
    }
    
    /**
     * Updates existing Student entity with data from StudentRequestDTO.
     */
    public void updateEntity(StudentRequestDTO request, Student entity) {
        entity.setEmail(request.email());
        entity.setName(request.name());
        entity.setSurname(request.surname());
        entity.setGender(request.gender());
        entity.setBirthDate(request.birthDate());
        
        applyRequestFields(request, entity);
    }
    
    /**
     * Applies common fields from request to entity.
     */
    private void applyRequestFields(StudentRequestDTO request, Student entity) {
        entity.setPhone(request.phone());
        entity.setProfession(request.profession());
        entity.setStreet(request.street());
        entity.setNumber(request.number());
        entity.setComplement(request.complement());
        entity.setNeighborhood(request.neighborhood());
        entity.setCep(request.cep());
        entity.setEmergencyContactName(request.emergencyContactName());
        entity.setEmergencyContactPhone(request.emergencyContactPhone());
        entity.setEmergencyContactRelationship(request.emergencyContactRelationship());
        entity.setObjectives(request.objectives());
        entity.setObservations(request.observations());
    }
    
    /**
     * Maps AnamnesisRequestDTO to Anamnesis entity.
     */
    public Anamnesis toAnamnesisEntity(AnamnesisRequestDTO request, Student student) {
        Anamnesis anamnesis = new Anamnesis(student);
        updateAnamnesisEntity(request, anamnesis);
        return anamnesis;
    }
    
    /**
     * Updates Anamnesis entity with data from AnamnesisRequestDTO.
     */
    public void updateAnamnesisEntity(AnamnesisRequestDTO request, Anamnesis entity) {
        Optional.ofNullable(request.medication()).ifPresent(entity::setMedication);
        Optional.ofNullable(request.isDoctorAwareOfPhysicalActivity()).ifPresent(entity::setDoctorAwareOfPhysicalActivity);
        Optional.ofNullable(request.favoritePhysicalActivity()).ifPresent(entity::setFavoritePhysicalActivity);
        Optional.ofNullable(request.hasInsomnia()).ifPresent(entity::setHasInsomnia);
        Optional.ofNullable(request.dietOrientedBy()).ifPresent(entity::setDietOrientedBy);
        Optional.ofNullable(request.cardiacProblems()).ifPresent(entity::setCardiacProblems);
        Optional.ofNullable(request.hasHypertension()).ifPresent(entity::setHasHypertension);
        Optional.ofNullable(request.chronicDiseases()).ifPresent(entity::setChronicDiseases);
        Optional.ofNullable(request.difficultiesInPhysicalActivities()).ifPresent(entity::setDifficultiesInPhysicalActivities);
        Optional.ofNullable(request.medicalOrientationsToAvoidPhysicalActivity()).ifPresent(entity::setMedicalOrientationsToAvoidPhysicalActivity);
        Optional.ofNullable(request.surgeriesInTheLast12Months()).ifPresent(entity::setSurgeriesInTheLast12Months);
        Optional.ofNullable(request.respiratoryProblems()).ifPresent(entity::setRespiratoryProblems);
        Optional.ofNullable(request.jointMuscularBackPain()).ifPresent(entity::setJointMuscularBackPain);
        Optional.ofNullable(request.spinalDiscProblems()).ifPresent(entity::setSpinalDiscProblems);
        Optional.ofNullable(request.diabetes()).ifPresent(entity::setDiabetes);
        Optional.ofNullable(request.smokingDuration()).ifPresent(entity::setSmokingDuration);
        Optional.ofNullable(request.alteredCholesterol()).ifPresent(entity::setAlteredCholesterol);
        Optional.ofNullable(request.osteoporosisLocation()).ifPresent(entity::setOsteoporosisLocation);
    }
    
    /**
     * Maps Anamnesis entity to AnamnesisResponseDTO.
     */
    public AnamnesisResponseDTO toAnamnesisResponse(Anamnesis entity) {
        return new AnamnesisResponseDTO(
                entity.getMedication(),
                entity.isDoctorAwareOfPhysicalActivity(),
                entity.getFavoritePhysicalActivity(),
                entity.getHasInsomnia(),
                entity.getDietOrientedBy(),
                entity.getCardiacProblems(),
                entity.isHasHypertension(),
                entity.getChronicDiseases(),
                entity.getDifficultiesInPhysicalActivities(),
                entity.getMedicalOrientationsToAvoidPhysicalActivity(),
                entity.getSurgeriesInTheLast12Months(),
                entity.getRespiratoryProblems(),
                entity.getJointMuscularBackPain(),
                entity.getSpinalDiscProblems(),
                entity.getDiabetes(),
                entity.getSmokingDuration(),
                entity.isAlteredCholesterol(),
                entity.getOsteoporosisLocation()
        );
    }
    
    /**
     * Maps PhysicalImpairmentRequestDTO to PhysicalImpairment entity.
     */
    public PhysicalImpairment toImpairmentEntity(PhysicalImpairmentRequestDTO request, Student student) {
        return new PhysicalImpairment(
                student,
                request.type(),
                request.name(),
                request.observations()
        );
    }
    
    /**
     * Maps PhysicalImpairment entity to PhysicalImpairmentResponseDTO.
     */
    public PhysicalImpairmentResponseDTO toImpairmentResponse(PhysicalImpairment entity) {
        return new PhysicalImpairmentResponseDTO(
                entity.getId(),
                entity.getImpairmentType(),
                entity.getName(),
                entity.getObservations()
        );
    }
}

