package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AnamnesisRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PhysicalImpairmentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Anamnesis;
import org.conexaotreinamento.conexaotreinamentobackend.entity.PhysicalImpairment;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AnamnesisRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.PhysicalImpairmentRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
@DisplayName("StudentService Unit Tests")
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private AnamnesisRepository anamnesisRepository;
    @Mock
    private PhysicalImpairmentRepository physicalImpairmentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student student;
    private UUID studentId;
    private StudentRequestDTO studentRequestDTO;
    private AnamnesisRequestDTO anamnesisRequestDTO;
    private List<PhysicalImpairmentRequestDTO> physicalImpairments;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        student = new Student("email@email.com", "Nome", "Sobrenome", Student.Gender.M, LocalDate.of(2000, 1, 1));
        ReflectionTestUtils.setField(student, "id", studentId);

        anamnesisRequestDTO = new AnamnesisRequestDTO(
                "medicação", true, "futebol", Anamnesis.InsomniaFrequency.NO, "nutricionista", "problemas cardíacos",
                true, "doenças crônicas", "dificuldades", "restrições", "cirurgias", "respiratórios",
                "dores", "coluna", "diabetes", "2 anos", true, "ossos"
        );

        physicalImpairments = List.of(
                new PhysicalImpairmentRequestDTO(PhysicalImpairment.PhysicalImpairmentType.MOTOR, "NOME", "OBS")
        );

        studentRequestDTO = new StudentRequestDTO(
                "email@email.com", "Nome", "Sobrenome", Student.Gender.M, LocalDate.of(2000, 1, 1),
                "11999999999", "Profissão", "Rua", "123", "Comp", "Bairro", "00000-000",
                "Contato", "11988888888", "Parente", "Objetivos", "Observações",
                anamnesisRequestDTO, physicalImpairments
        );
    }

    @Test
    @DisplayName("Deve lançar exceção se email já existe ao criar estudante")
    void shouldThrowConflictWhenEmailAlreadyExists() {
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(anyString())).thenReturn(true);

        assertThatThrownBy(() -> studentService.create(studentRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student with this email already exists");

        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNull(anyString());
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lançar exceção se estudante não encontrado ao buscar por id")
    void shouldThrowNotFoundWhenStudentDoesNotExist() {
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.findById(studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student not found");

        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
    }

    @Test
    @DisplayName("Deve lançar exceção se estudante não encontrado ao atualizar")
    void shouldThrowNotFoundWhenUpdatingNonExistentStudent() {
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.update(studentId, studentRequestDTO))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student not found");

        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
    }

    @Test
    @DisplayName("Deve lançar exceção de conflito ao atualizar para email já existente")
    void shouldThrowConflictWhenUpdatingToExistingEmail() {
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull(anyString())).thenReturn(true);

        StudentRequestDTO updateRequest = new StudentRequestDTO(
                "novo@email.com", "Nome", "Sobrenome", Student.Gender.M, LocalDate.of(2000, 1, 1),
                "11999999999", "Profissão", "Rua", "123", "Comp", "Bairro", "00000-000",
                "Contato", "11988888888", "Parente", "Objetivos", "Observações",
                anamnesisRequestDTO, physicalImpairments
        );

        assertThatThrownBy(() -> studentService.update(studentId, updateRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student with this email already exists");

        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNull("novo@email.com");
    }

    @Test
    @DisplayName("Deve lançar exceção ao deletar estudante inexistente")
    void shouldThrowNotFoundWhenDeletingNonExistentStudent() {
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.delete(studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student not found");

        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
    }

    @Test
    @DisplayName("Deve deletar estudante com sucesso (soft delete)")
    void shouldDeleteStudentSuccessfully() {
        when(studentRepository.findByIdAndDeletedAtIsNull(studentId)).thenReturn(Optional.of(student));

        studentService.delete(studentId);

        assertThat(student.isActive()).isFalse();
        verify(studentRepository).findByIdAndDeletedAtIsNull(studentId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao restaurar estudante inexistente")
    void shouldThrowExceptionWhenRestoringNonExistentStudent() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.restore(studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student not found");

        verify(studentRepository).findById(studentId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao restaurar estudante já ativo")
    void shouldThrowExceptionWhenRestoringAlreadyActiveStudent() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> studentService.restore(studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot restore student.");

        verify(studentRepository).findById(studentId);
    }

    @Test
    @DisplayName("Deve lançar exceção ao restaurar estudante com email já existente ativo")
    void shouldThrowExceptionWhenRestoringStudentWithEmailAlreadyExists() {
        Student deletedStudent = new Student("email@email.com", "Nome", "Sobrenome", Student.Gender.M, LocalDate.of(2000, 1, 1));
        deletedStudent.deactivate();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(deletedStudent));
        when(studentRepository.existsByEmailIgnoringCaseAndDeletedAtIsNull("email@email.com")).thenReturn(true);

        assertThatThrownBy(() -> studentService.restore(studentId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cannot restore student.");

        verify(studentRepository).findById(studentId);
        verify(studentRepository).existsByEmailIgnoringCaseAndDeletedAtIsNull("email@email.com");
    }

    @Test
    @DisplayName("Deve aplicar ordenação padrão quando pageable não está ordenado")
    void shouldApplyDefaultSortWhenPageableIsUnsorted() {
        Pageable unsortedPageable = PageRequest.of(0, 20);
        List<Student> students = List.of(student);
        Page<Student> page = new PageImpl<>(students, unsortedPageable, 1);

        when(studentRepository.findByDeletedAtIsNull(any(Pageable.class))).thenReturn(page);

        assertThatThrownBy(() -> studentService.findAll(null, unsortedPageable, false))
                .isInstanceOf(UnsupportedOperationException.class);

        verify(studentRepository).findByDeletedAtIsNull(argThat(pageable ->
                pageable.getSort().equals(Sort.by("createdAt").descending())
        ));
    }

    @Test
    @DisplayName("Deve buscar todos os estudantes incluindo inativos quando includeInactive é true")
    void shouldFindAllStudentsIncludingInactiveWhenIncludeInactiveIsTrue() {
        Pageable pageable = PageRequest.of(0, 20);
        List<Student> students = List.of(student);
        Page<Student> page = new PageImpl<>(students, pageable, 1);

        when(studentRepository.findAll(any(Pageable.class))).thenReturn(page);

        assertThatThrownBy(() -> studentService.findAll(null, pageable, true))
                .isInstanceOf(UnsupportedOperationException.class);

        verify(studentRepository).findAll(any(Pageable.class));
        verify(studentRepository, never()).findByDeletedAtIsNull(any());
    }

    @Test
    @DisplayName("Deve buscar estudantes por termo de busca")
    void shouldFindStudentsBySearchTerm() {
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        List<Student> students = List.of(student);
        Page<Student> page = new PageImpl<>(students, pageable, 1);

        when(studentRepository.findBySearchTermAndDeletedAtIsNull(eq("%nome%"), any(Pageable.class))).thenReturn(page);

        assertThatThrownBy(() -> studentService.findAll("nome", PageRequest.of(0, 20), false))
                .isInstanceOf(UnsupportedOperationException.class);

        verify(studentRepository).findBySearchTermAndDeletedAtIsNull(eq("%nome%"), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve buscar estudantes incluindo inativos por termo de busca")
    void shouldSearchStudentsIncludingInactiveWhenIncludeInactiveIsTrue() {
        String searchTerm = "nome";
        Pageable pageable = PageRequest.of(0, 20);
        List<Student> students = List.of(student);
        Page<Student> page = new PageImpl<>(students, pageable, 1);

        when(studentRepository.findBySearchTermIncludingInactive(anyString(), any(Pageable.class))).thenReturn(page);

        assertThatThrownBy(() -> studentService.findAll(searchTerm, pageable, true))
                .isInstanceOf(UnsupportedOperationException.class);

        verify(studentRepository).findBySearchTermIncludingInactive(eq("%" + searchTerm.toLowerCase() + "%"), any(Pageable.class));
        verify(studentRepository, never()).findBySearchTermAndDeletedAtIsNull(any(), any());
    }
}