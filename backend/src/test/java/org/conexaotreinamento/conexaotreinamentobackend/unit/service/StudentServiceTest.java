package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import jakarta.persistence.EntityManager;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AnamnesisRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalImpairmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AnamnesisRepository anamnesisRepository;

    @Mock
    private PhysicalImpairmentRepository physicalImpairmentRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private StudentService studentService;

    private UUID studentId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        ReflectionTestUtils.setField(studentService, "entityManager", entityManager);
    }

    private StudentRequestDTO sampleRequest(boolean includeAnamnesis, boolean includeImpairments) {
        AnamnesisRequestDTO anam = includeAnamnesis ? new AnamnesisRequestDTO(
                "meds", true, "yoga", Anamnesis.InsomniaFrequency.yes, "dietician", "cardiac",
                true, "chronic", "difficulties", "avoid", "surgery", "resp", "backpain", "disc",
                "diabetes", "2 years", true, "spine"
        ) : null;

        List<PhysicalImpairmentRequestDTO> impairments = includeImpairments
                ? List.of(
                new PhysicalImpairmentRequestDTO(PhysicalImpairment.PhysicalImpairmentType.intellectual, "knee", "obs"),
                new PhysicalImpairmentRequestDTO(PhysicalImpairment.PhysicalImpairmentType.motor, "shoulder", null)
        )
                : List.of();

        return new StudentRequestDTO(
                "alice@example.com", "Alice", "Doe", Student.Gender.F,
                LocalDate.of(2000, 1, 1), "555", "Engineer", "Street",
                "123", "", "Center", "12345", "Bob", "555-2222", "Friend",
                "Lose weight", "None", anam, impairments
        );
    }

    private void setIdViaReflection(Student s, UUID id) {
        try {
            Field f = Student.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(s, id);
        } catch (Exception e) {
            fail("Failed to set Student.id via reflection: " + e.getMessage());
        }
    }

    @Test
    void create_success_withAnamnesisAndImpairments() {
        // Arrange
        StudentRequestDTO req = sampleRequest(true, true);

        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(req.email())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            // registrationDate should be set
            assertNotNull(s.getRegistrationDate(), "registrationDate should be set before save");
            // simulate DB-generated id
            setIdViaReflection(s, studentId);
            return s;
        });

        when(anamnesisRepository.save(any(Anamnesis.class))).thenAnswer(inv -> inv.getArgument(0));
        when(physicalImpairmentRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        StudentResponseDTO dto = studentService.create(req);

        // Assert
        assertNotNull(dto);
        assertEquals(req.email(), dto.email());
        verify(studentRepository).save(any(Student.class));
        verify(anamnesisRepository, times(1)).save(any(Anamnesis.class));
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<PhysicalImpairment>> piCaptor = ArgumentCaptor.forClass(List.class);
        verify(physicalImpairmentRepository).saveAll(piCaptor.capture());
        assertEquals(2, piCaptor.getValue().size());
    }

    @Test
    void create_success_withoutAnamnesis() {
        // Arrange
        StudentRequestDTO req = sampleRequest(false, false);

        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(req.email())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            setIdViaReflection(s, studentId);
            return s;
        });

        // Act
        StudentResponseDTO dto = studentService.create(req);

        // Assert
        assertNotNull(dto);
        verify(anamnesisRepository, never()).save(any(Anamnesis.class));
        verify(physicalImpairmentRepository, never()).saveAll(anyList());
    }

    @Test
    void create_conflict_whenEmailExists() {
        // Arrange
        StudentRequestDTO req = sampleRequest(false, false);
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(req.email())).thenReturn(true);

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.create(req));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(studentRepository, never()).save(any());
    }

    @Test
    void findById_success_populatesAnamnesisAndImpairments() {
        // Arrange
        Student s = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        s.setRegistrationDate(LocalDate.now());
        setIdViaReflection(s, studentId);

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(s));

        Anamnesis anam = new Anamnesis(s);
        anam.setMedication("meds");
        when(anamnesisRepository.findById(studentId)).thenReturn(Optional.of(anam));

        PhysicalImpairment pi1 = new PhysicalImpairment(s, PhysicalImpairment.PhysicalImpairmentType.motor, "knee", "obs");
        PhysicalImpairment pi2 = new PhysicalImpairment(s, PhysicalImpairment.PhysicalImpairmentType.intellectual, "shoulder", null);
        when(physicalImpairmentRepository.findByStudentId(studentId)).thenReturn(List.of(pi1, pi2));

        // Act
        StudentResponseDTO dto = studentService.findById(studentId);

        // Assert
        assertEquals(studentId, dto.id());
        assertEquals("alice@example.com", dto.email());
        assertNotNull(dto.anamnesis());
        assertEquals("meds", dto.anamnesis().medication());
        assertEquals(2, dto.physicalImpairments().size());
    }

    @Test
    void findById_notFound_throws404() {
        // Arrange
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.findById(studentId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void findAll_appliesDefaultSort_whenUnsorted() {
        // Arrange
        Pageable unsorted = PageRequest.of(0, 10);
        Student s = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        s.setRegistrationDate(LocalDate.now());
        setIdViaReflection(s, studentId);

        Page<Student> page = new PageImpl<>(List.of(s), PageRequest.of(0, 10), 1);
        when(studentRepository.findAll(ArgumentMatchers.<Specification<Student>>any(), any(Pageable.class))).thenReturn(page);

        // Act
        Page<StudentResponseDTO> result = studentService.findAll(null, null, null, null, null, null, null, false, unsorted);

        // Assert
        assertEquals(1, result.getTotalElements());
        // Capture pageable argument to verify sorting
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(studentRepository).findAll(ArgumentMatchers.<Specification<Student>>any(), pageableCaptor.capture());
        Pageable used = pageableCaptor.getValue();
        assertFalse(used.getSort().isUnsorted(), "Sort should be applied");
        assertEquals(Sort.by("createdAt").descending(), used.getSort(), "Expected sort by createdAt desc");
    }

    @Test
    void update_conflict_whenNewEmailExists() {
        // Arrange
        Student existing = new Student("old@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        setIdViaReflection(existing, studentId);

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(existing));
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull("new@example.com")).thenReturn(true);

        StudentRequestDTO req = sampleRequest(false, false);
        // override email
        req = new StudentRequestDTO(
                "new@example.com", req.name(), req.surname(), req.gender(), req.birthDate(), req.phone(), req.profession(),
                req.street(), req.number(), req.complement(), req.neighborhood(), req.cep(), req.emergencyContactName(),
                req.emergencyContactPhone(), req.emergencyContactRelationship(), req.objectives(), req.observations(),
                req.anamnesis(), req.physicalImpairments()
        );

        // Act + Assert
        StudentRequestDTO finalReq = req;
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.update(studentId, finalReq));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void update_notFound_throws404() {
        // Arrange
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.update(studentId, sampleRequest(false, false)));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void update_removesAnamnesis_whenPayloadOmitsSection() {
        // Arrange
        Student existing = new Student("alice@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        setIdViaReflection(existing, studentId);

        Anamnesis existingAnamnesis = new Anamnesis(existing);

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(existing));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(anamnesisRepository.findById(studentId)).thenReturn(Optional.of(existingAnamnesis));

        StudentRequestDTO request = sampleRequest(false, false);

        // Act
        studentService.update(studentId, request);

        // Assert
        verify(anamnesisRepository).deleteById(studentId);
        verify(anamnesisRepository, never()).saveAndFlush(any(Anamnesis.class));
        verify(entityManager).flush();
    }

    @Test
    void delete_success_softDeletesAndSaves() {
        // Arrange
        Student existing = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        setIdViaReflection(existing, studentId);

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(existing));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        studentService.delete(studentId);

        // Assert
        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        Student saved = captor.getValue();
        assertTrue(saved.isInactive(), "Student should be inactive after delete");
        assertNotNull(saved.getDeletedAt(), "deletedAt should be set");
    }

    @Test
    void delete_notFound_throws404() {
        // Arrange
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.delete(studentId));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void restore_success_whenInactive_andNoEmailConflict() {
        // Arrange
        Student existing = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        existing.deactivate(); // inactive
        setIdViaReflection(existing, studentId);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(existing.getEmail())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        StudentResponseDTO dto = studentService.restore(studentId);

        // Assert
        assertEquals(existing.getEmail(), dto.email());
        assertTrue(existing.isActive(), "Student should be active after restore");
        verify(studentRepository).save(existing);
    }

    @Test
    void restore_conflict_whenAlreadyActive() {
        // Arrange
        Student existing = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        setIdViaReflection(existing, studentId);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.restore(studentId));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void restore_conflict_whenEmailExists() {
        // Arrange
        Student existing = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        existing.deactivate();
        setIdViaReflection(existing, studentId);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(existing));
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(existing.getEmail())).thenReturn(true);

        // Act + Assert
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> studentService.restore(studentId));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }
}
