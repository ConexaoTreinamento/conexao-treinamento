package org.conexaotreinamento.conexaotreinamentobackend.controller;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.StudentRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.StudentResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StudentController Unit Tests")
class StudentControllerTest {

    @Mock
    private StudentService studentService;

    @InjectMocks
    private StudentController studentController;

    private UUID studentId;
    private StudentRequestDTO studentRequestDTO;
    private StudentResponseDTO studentResponseDTO;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        studentRequestDTO = new StudentRequestDTO(
                "student@example.com", "John", "Doe", Student.Gender.M,
                LocalDate.of(1990, 5, 15), "123456789", "Engineer", "Main Street",
                "123", "Apt 1", "Downtown", "12345", "Jane Doe", "987654321", "Sister",
                "Lose weight", "No medical conditions", null, List.of()
        );
        studentResponseDTO = new StudentResponseDTO(
                studentId, "student@example.com", "John", "Doe", Student.Gender.M,
                LocalDate.of(1990, 5, 15), "123456789", "Engineer", "Main Street",
                "123", "Apt 1", "Downtown", "12345", "Jane Doe", "987654321", "Sister",
                "Lose weight", null, LocalDate.now(), null, null, null, null, List.of()
        );
    }

    @Test
    @DisplayName("Should create student successfully")
    void shouldCreateStudentSuccessfully() {
        // Given
        when(studentService.create(studentRequestDTO)).thenReturn(studentResponseDTO);

        // When
        ResponseEntity<StudentResponseDTO> response = studentController.create(studentRequestDTO);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(studentResponseDTO);
        verify(studentService).create(studentRequestDTO);
    }

    @Test
    @DisplayName("Should find student by id successfully")
    void shouldFindStudentByIdSuccessfully() {
        // Given
        when(studentService.findById(studentId)).thenReturn(studentResponseDTO);

        // When
        ResponseEntity<StudentResponseDTO> response = studentController.findById(studentId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(studentResponseDTO);
        verify(studentService).findById(studentId);
    }

    @Test
    @DisplayName("Should find all students with default pagination")
    void shouldFindAllStudentsWithDefaultPagination() {
        // Given
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, null, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should find all students with search term")
    void shouldFindAllStudentsWithSearchTerm() {
        // Given
        String search = "john";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(eq(search), isNull(), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                search, null, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(search, null, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should find all students with gender filter")
    void shouldFindAllStudentsWithGenderFilter() {
        // Given
        String gender = "M";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), eq(Student.Gender.M), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, gender, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, Student.Gender.M, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should find all students with profession filter")
    void shouldFindAllStudentsWithProfessionFilter() {
        // Given
        String profession = "Engineer";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), eq(profession), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, profession, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, null, profession, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should find all students with age range filter")
    void shouldFindAllStudentsWithAgeRangeFilter() {
        // Given
        Integer minAge = 25;
        Integer maxAge = 35;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), eq(minAge), eq(maxAge), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, minAge, maxAge, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, null, null, minAge, maxAge, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should find all students with registration date range filter")
    void shouldFindAllStudentsWithRegistrationDateRangeFilter() {
        // Given
        LocalDate minDate = LocalDate.of(2023, 1, 1);
        LocalDate maxDate = LocalDate.of(2023, 12, 31);
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                eq(minDate), eq(maxDate), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, null, null, minDate, maxDate, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, null, null, null, null, minDate, maxDate, false, pageable);
    }

    @Test
    @DisplayName("Should find all students including inactive")
    void shouldFindAllStudentsIncludingInactive() {
        // Given
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(true), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, null, null, null, null, true, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(null, null, null, null, null, null, null, true, pageable);
    }

    @Test
    @DisplayName("Should throw bad request when max age is less than min age")
    void shouldThrowBadRequestWhenMaxAgeIsLessThanMinAge() {
        // Given
        Integer minAge = 35;
        Integer maxAge = 25;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());

        // When & Then
        assertThatThrownBy(() -> studentController.findAll(
                null, null, null, minAge, maxAge, null, null, false, pageable))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Maximum age (25) must be greater than or equal to minimum age (35)");

        verify(studentService, never()).findAll(any(), any(), any(), any(), any(), any(), any(), anyBoolean(), any());
    }

    @Test
    @DisplayName("Should throw bad request when registration max date is before min date")
    void shouldThrowBadRequestWhenRegistrationMaxDateIsBeforeMinDate() {
        // Given
        LocalDate minDate = LocalDate.of(2023, 12, 31);
        LocalDate maxDate = LocalDate.of(2023, 1, 1);
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());

        // When & Then
        assertThatThrownBy(() -> studentController.findAll(
                null, null, null, null, null, minDate, maxDate, false, pageable))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST)
                .hasMessageContaining("Registration period max date (2023-01-01) must be after or equal to the min date (2023-12-31)");

        verify(studentService, never()).findAll(any(), any(), any(), any(), any(), any(), any(), anyBoolean(), any());
    }

    @Test
    @DisplayName("Should handle valid female gender")
    void shouldHandleValidFemaleGender() {
        // Given
        String gender = "F";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), eq(Student.Gender.F), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, gender, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, Student.Gender.F, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should handle valid other gender")
    void shouldHandleValidOtherGender() {
        // Given
        String gender = "O";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), eq(Student.Gender.O), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, gender, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, Student.Gender.O, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should handle null gender as no gender filter")
    void shouldHandleNullGenderAsNoGenderFilter() {
        // Given
        String gender = null;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, gender, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, null, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should handle blank gender as no gender filter")
    void shouldHandleBlankGenderAsNoGenderFilter() {
        // Given
        String gender = "   ";
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, gender, null, null, null, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, null, null, null, null, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should update student successfully")
    void shouldUpdateStudentSuccessfully() {
        // Given
        when(studentService.update(studentId, studentRequestDTO)).thenReturn(studentResponseDTO);

        // When
        ResponseEntity<StudentResponseDTO> response = studentController.update(studentId, studentRequestDTO);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(studentResponseDTO);
        verify(studentService).update(studentId, studentRequestDTO);
    }

    @Test
    @DisplayName("Should delete student successfully")
    void shouldDeleteStudentSuccessfully() {
        // Given
        doNothing().when(studentService).delete(studentId);

        // When
        ResponseEntity<Void> response = studentController.delete(studentId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(response.getBody()).isNull();
        verify(studentService).delete(studentId);
    }

    @Test
    @DisplayName("Should restore student successfully")
    void shouldRestoreStudentSuccessfully() {
        // Given
        when(studentService.restore(studentId)).thenReturn(studentResponseDTO);

        // When
        ResponseEntity<StudentResponseDTO> response = studentController.restore(studentId);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(studentResponseDTO);
        verify(studentService).restore(studentId);
    }

    @Test
    @DisplayName("Should handle all filters combined")
    void shouldHandleAllFiltersCombined() {
        // Given
        String search = "john";
        String gender = "M";
        String profession = "Engineer";
        Integer minAge = 25;
        Integer maxAge = 35;
        LocalDate minDate = LocalDate.of(2023, 1, 1);
        LocalDate maxDate = LocalDate.of(2023, 12, 31);
        boolean includeInactive = true;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);

        when(studentService.findAll(eq(search), eq(Student.Gender.M), eq(profession), eq(minAge), eq(maxAge), 
                eq(minDate), eq(maxDate), eq(includeInactive), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                search, gender, profession, minAge, maxAge, minDate, maxDate, includeInactive, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(page);
        verify(studentService).findAll(search, Student.Gender.M, profession, minAge, maxAge, minDate, maxDate, includeInactive, pageable);
    }

    @Test
    @DisplayName("Should handle edge case with zero ages")
    void shouldHandleEdgeCaseWithZeroAges() {
        // Given
        Integer minAge = 0;
        Integer maxAge = 0;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), eq(minAge), eq(maxAge), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, minAge, maxAge, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, null, null, minAge, maxAge, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should handle same min and max ages")
    void shouldHandleSameMinAndMaxAges() {
        // Given
        Integer age = 30;
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), eq(age), eq(age), 
                isNull(), isNull(), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, age, age, null, null, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, null, null, age, age, null, null, false, pageable);
    }

    @Test
    @DisplayName("Should handle same min and max dates")
    void shouldHandleSameMinAndMaxDates() {
        // Given
        LocalDate date = LocalDate.of(2023, 6, 15);
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<StudentResponseDTO> page = new PageImpl<>(List.of(studentResponseDTO), pageable, 1);
        when(studentService.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), 
                eq(date), eq(date), eq(false), any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Page<StudentResponseDTO>> response = studentController.findAll(
                null, null, null, null, null, date, date, false, pageable);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studentService).findAll(null, null, null, null, null, date, date, false, pageable);
    }
}
