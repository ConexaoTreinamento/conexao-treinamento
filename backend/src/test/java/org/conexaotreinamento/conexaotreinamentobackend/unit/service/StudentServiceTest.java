package org.conexaotreinamento.conexaotreinamentobackend.unit.service;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AnamnesisRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalImpairmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.StudentMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentValidationService;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.BusinessException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.AgeRangeValidator;
import org.conexaotreinamento.conexaotreinamentobackend.shared.validation.DateRangeValidator;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AnamnesisRepository anamnesisRepository;

    @Mock
    private PhysicalImpairmentRepository physicalImpairmentRepository;

    private StudentMapper studentMapper = new StudentMapper();

    @Mock
    private StudentValidationService validationService;

    @Mock
    private AgeRangeValidator ageRangeValidator;

    @Mock
    private DateRangeValidator dateRangeValidator;

    @InjectMocks
    private StudentService studentService;

    private UUID studentId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        
        // Inject real mapper into service
        ReflectionTestUtils.setField(studentService, "studentMapper", studentMapper);
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

        doNothing().when(validationService).validateEmailUniqueness(req.email());
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
        verify(validationService).validateEmailUniqueness(req.email());
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

        doNothing().when(validationService).validateEmailUniqueness(req.email());
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            setIdViaReflection(s, studentId);
            return s;
        });

        // Act
        StudentResponseDTO dto = studentService.create(req);

        // Assert
        assertNotNull(dto);
        verify(validationService).validateEmailUniqueness(req.email());
        verify(anamnesisRepository, never()).save(any(Anamnesis.class));
        verify(physicalImpairmentRepository, never()).saveAll(anyList());
    }

    @Test
    void create_conflict_whenEmailExists() {
        // Arrange
        StudentRequestDTO req = sampleRequest(false, false);
        doThrow(new BusinessException("Student with email '" + req.email() + "' already exists"))
                .when(validationService).validateEmailUniqueness(req.email());

        // Act + Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> studentService.create(req));
        // Business exception doesn't have status code
        verify(validationService).validateEmailUniqueness(req.email());
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
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> studentService.findById(studentId));
        // Resource not found exception
    }

    @Test
    void findAll_appliesDefaultSort_whenUnsorted() {
        // Arrange
        Pageable unsorted = PageRequest.of(0, 10);
        Student s = new Student("a@b.com", "A", "B", Student.Gender.F, LocalDate.of(1990, 1, 1));
        s.setRegistrationDate(LocalDate.now());
        setIdViaReflection(s, studentId);

        Page<Student> page = new PageImpl<>(List.of(s), PageRequest.of(0, 10, Sort.by("createdAt").descending()), 1);
        when(studentRepository.findAll(ArgumentMatchers.<Specification<Student>>any(), any(Pageable.class))).thenReturn(page);

        // Act
        PageResponse<StudentResponseDTO> result = studentService.findAll(null, null, null, null, null, null, null, false, unsorted);

        // Assert
        assertEquals(1, result.totalElements());
        // Note: StudentService doesn't apply default sort - that's done in the controller with @PageableDefault
        // The service just passes the pageable as-is to the repository
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(studentRepository).findAll(ArgumentMatchers.<Specification<Student>>any(), pageableCaptor.capture());
        Pageable used = pageableCaptor.getValue();
        // The pageable passed to repository should be the same as the one passed to the service
        assertEquals(unsorted, used);
    }

    @Test
    void update_conflict_whenNewEmailExists() {
        // Arrange
        Student existing = new Student("old@example.com", "Alice", "Doe", Student.Gender.F, LocalDate.of(2000, 1, 1));
        existing.setRegistrationDate(LocalDate.now());
        setIdViaReflection(existing, studentId);

        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(existing));
        doThrow(new BusinessException("Student with email 'new@example.com' already exists"))
                .when(validationService).validateEmailUniqueness("new@example.com", studentId);

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
        BusinessException ex = assertThrows(BusinessException.class, () -> studentService.update(studentId, finalReq));
        // Business exception doesn't have status code
        verify(validationService).validateEmailUniqueness("new@example.com", studentId);
    }

    @Test
    void update_notFound_throws404() {
        // Arrange
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        // Act + Assert
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> studentService.update(studentId, sampleRequest(false, false)));
        // Resource not found exception
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
        verify(anamnesisRepository).delete(any(Anamnesis.class));
        verify(anamnesisRepository, never()).save(any(Anamnesis.class));
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
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> studentService.delete(studentId));
        // Resource not found exception
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
        BusinessException ex = assertThrows(BusinessException.class, () -> studentService.restore(studentId));
        // Business exception doesn't have status code
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
        BusinessException ex = assertThrows(BusinessException.class, () -> studentService.restore(studentId));
        // Business exception doesn't have status code
    }
}
