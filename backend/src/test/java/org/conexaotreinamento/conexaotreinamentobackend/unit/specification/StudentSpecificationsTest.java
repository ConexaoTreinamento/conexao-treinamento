package org.conexaotreinamento.conexaotreinamentobackend.unit.specification;

import jakarta.persistence.criteria.*;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.conexaotreinamento.conexaotreinamentobackend.specification.StudentSpecifications;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentSpecificationsTest {

    @Mock
    private Root<Student> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private Path<Object> path;

    @Mock
    private Expression<String> stringExpression;

    @Mock
    private Predicate predicate;

    @BeforeEach
    void setUp() {
        // Default behavior for root.get() to return a path
        lenient().when(root.get(anyString())).thenReturn(path);
        
        // Default behavior for criteriaBuilder methods to return a predicate
        lenient().when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(predicate);
        lenient().when(criteriaBuilder.or(any(Predicate[].class))).thenReturn(predicate);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);
        lenient().when(criteriaBuilder.like(any(), anyString())).thenReturn(predicate);
        lenient().when(criteriaBuilder.isNull(any())).thenReturn(predicate);
        lenient().when(criteriaBuilder.greaterThan(any(Expression.class), any(LocalDate.class))).thenReturn(predicate);
        lenient().when(criteriaBuilder.lessThanOrEqualTo(any(Expression.class), any(LocalDate.class))).thenReturn(predicate);
        lenient().when(criteriaBuilder.greaterThanOrEqualTo(any(Expression.class), any(Instant.class))).thenReturn(predicate);
        lenient().when(criteriaBuilder.lessThan(any(Expression.class), any(Instant.class))).thenReturn(predicate);
        
        // Default behavior for lower() and coalesce()
        lenient().when(criteriaBuilder.lower(any())).thenReturn(stringExpression);
        // Cast to avoid ambiguity and type mismatch for coalesce
        lenient().doReturn(stringExpression).when(criteriaBuilder).coalesce(any(), any());
    }

    @Test
    @DisplayName("Should return specification with no filters when all parameters are null")
    void shouldReturnSpecificationWithNoFilters() {
        // Given
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, null, true
        );

        // When
        Predicate result = spec.toPredicate(root, query, criteriaBuilder);

        // Then
        assertThat(result).isEqualTo(predicate);
        verify(criteriaBuilder).and(any(Predicate[].class)); // Should call and() with empty or minimal predicates
    }

    @Test
    @DisplayName("Should filter by deletedAt is null when includeInactive is false")
    void shouldFilterByDeletedAtIsNull() {
        // Given
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, null, false
        );

        // When
        spec.toPredicate(root, query, criteriaBuilder);

        // Then
        verify(root).get("deletedAt");
        verify(criteriaBuilder).isNull(path);
    }

    @Test
    @DisplayName("Should filter by search term")
    void shouldFilterBySearchTerm() {
        // Given
        String search = "John";
        Specification<Student> spec = StudentSpecifications.withFilters(
                search, null, null, null, null, null, null, true
        );

        // When
        spec.toPredicate(root, query, criteriaBuilder);

        // Then
        verify(root).get("name");
        verify(root).get("surname");
        verify(root).get("email");
        verify(root).get("phone");
        verify(root).get("profession");
        
        // Verify that like was called multiple times (5 times for the OR clause)
        verify(criteriaBuilder, atLeast(5)).like(any(), eq("%john%"));
        verify(criteriaBuilder).or(any(Predicate[].class));
    }

    @Test
    @DisplayName("Should filter by gender")
    void shouldFilterByGender() {
        // Given
        Student.Gender gender = Student.Gender.M;
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, gender, null, null, null, null, null, true
        );

        // When
        spec.toPredicate(root, query, criteriaBuilder);

        // Then
        verify(root).get("gender");
        verify(criteriaBuilder).equal(path, gender);
    }

    @Test
    @DisplayName("Should filter by profession")
    void shouldFilterByProfession() {
        // Given
        String profession = "Developer";
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, profession, null, null, null, null, true
        );

        // When
        spec.toPredicate(root, query, criteriaBuilder);

        // Then
        verify(root).get("profession");
        verify(criteriaBuilder).like(any(), eq("%developer%"));
    }

    @Test
    @DisplayName("Should filter by age range")
    void shouldFilterByAgeRange() {
        // Given
        Integer minAge = 20;
        Integer maxAge = 30;
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, minAge, maxAge, null, null, true
        );

        // When
        spec.toPredicate(root, query, criteriaBuilder);

        // Then
        verify(root, atLeastOnce()).get("birthDate");
        verify(criteriaBuilder).greaterThan(any(), any(LocalDate.class)); // For maxAge (birth date > X)
        verify(criteriaBuilder).lessThanOrEqualTo(any(), any(LocalDate.class)); // For minAge (birth date <= Y)
    }
}
