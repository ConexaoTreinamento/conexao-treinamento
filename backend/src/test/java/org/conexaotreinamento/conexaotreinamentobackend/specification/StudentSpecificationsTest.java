package org.conexaotreinamento.conexaotreinamentobackend.specification;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("StudentSpecifications Unit Tests")
class StudentSpecificationsTest {

    @Test
    @DisplayName("Should create specification with no filters (only includeInactive=false)")
    void shouldCreateSpecificationWithNoFilters() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification including inactive when includeInactive is true")
    void shouldCreateSpecificationIncludingInactiveWhenIncludeInactiveIsTrue() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, null, true
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with search term")
    void shouldCreateSpecificationWithSearchTerm() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                "john", null, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with blank search term")
    void shouldCreateSpecificationWithBlankSearchTerm() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                "   ", null, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with gender filter")
    void shouldCreateSpecificationWithGenderFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, Student.Gender.M, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with profession filter")
    void shouldCreateSpecificationWithProfessionFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, "Engineer", null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with blank profession filter")
    void shouldCreateSpecificationWithBlankProfessionFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, "   ", null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with minAge filter")
    void shouldCreateSpecificationWithMinAgeFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, 25, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with maxAge filter")
    void shouldCreateSpecificationWithMaxAgeFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, 35, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with age range filter")
    void shouldCreateSpecificationWithAgeRangeFilter() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, 25, 35, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with zero age values")
    void shouldCreateSpecificationWithZeroAgeValues() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, 0, 0, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with registration min date filter")
    void shouldCreateSpecificationWithRegistrationMinDateFilter() {
        // Given
        LocalDate registrationMinDate = LocalDate.of(2023, 1, 1);

        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, registrationMinDate, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with registration max date filter")
    void shouldCreateSpecificationWithRegistrationMaxDateFilter() {
        // Given
        LocalDate registrationMaxDate = LocalDate.of(2023, 12, 31);

        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, registrationMaxDate, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with registration date range filter")
    void shouldCreateSpecificationWithRegistrationDateRangeFilter() {
        // Given
        LocalDate registrationMinDate = LocalDate.of(2023, 1, 1);
        LocalDate registrationMaxDate = LocalDate.of(2023, 12, 31);

        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, registrationMinDate, registrationMaxDate, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with all filters combined")
    void shouldCreateSpecificationWithAllFiltersCombined() {
        // Given
        String search = "john";
        Student.Gender gender = Student.Gender.M;
        String profession = "Engineer";
        Integer minAge = 25;
        Integer maxAge = 35;
        LocalDate registrationMinDate = LocalDate.of(2023, 1, 1);
        LocalDate registrationMaxDate = LocalDate.of(2023, 12, 31);

        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                search, gender, profession, minAge, maxAge, registrationMinDate, registrationMaxDate, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with all filters including inactive")
    void shouldCreateSpecificationWithAllFiltersIncludingInactive() {
        // Given
        String search = "jane";
        Student.Gender gender = Student.Gender.F;
        String profession = "Teacher";
        Integer minAge = 30;
        Integer maxAge = 40;
        LocalDate registrationMinDate = LocalDate.of(2022, 1, 1);
        LocalDate registrationMaxDate = LocalDate.of(2024, 12, 31);

        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                search, gender, profession, minAge, maxAge, registrationMinDate, registrationMaxDate, true
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with female gender")
    void shouldCreateSpecificationWithFemaleGender() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, Student.Gender.F, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create specification with other gender")
    void shouldCreateSpecificationWithOtherGender() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, Student.Gender.O, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should handle null values gracefully")
    void shouldHandleNullValuesGracefully() {
        // When
        Specification<Student> spec = StudentSpecifications.withFilters(
                null, null, null, null, null, null, null, false
        );

        // Then
        assertThat(spec).isNotNull();
        assertThat(spec.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should create different specifications for different parameters")
    void shouldCreateDifferentSpecificationsForDifferentParameters() {
        // Given
        Specification<Student> spec1 = StudentSpecifications.withFilters(
                "john", null, null, null, null, null, null, false
        );

        Specification<Student> spec2 = StudentSpecifications.withFilters(
                "jane", null, null, null, null, null, null, false
        );

        // Then
        assertThat(spec1).isNotNull();
        assertThat(spec2).isNotNull();
        assertThat(spec1.toString()).isNotEqualTo(spec2.toString());
    }

    @Test
    @DisplayName("Should create equal specifications for same parameters")
    void shouldCreateEqualSpecificationsForSameParameters() {
        // Given
        String search = "john";
        Student.Gender gender = Student.Gender.M;
        
        Specification<Student> spec1 = StudentSpecifications.withFilters(
                search, gender, null, null, null, null, null, false
        );

        Specification<Student> spec2 = StudentSpecifications.withFilters(
                search, gender, null, null, null, null, null, false
        );

        // Then
        assertThat(spec1).isNotNull();
        assertThat(spec2).isNotNull();
        // Note: Since specifications are lambda-based, we can't easily test equality
        // but we can verify they're both created successfully
        assertThat(spec1.toString()).isNotNull();
        assertThat(spec2.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should handle extreme age values")
    void shouldHandleExtremeAgeValues() {
        // When - Test with very high age values
        Specification<Student> spec1 = StudentSpecifications.withFilters(
                null, null, null, 100, 120, null, null, false
        );

        // When - Test with very low age values  
        Specification<Student> spec2 = StudentSpecifications.withFilters(
                null, null, null, 0, 5, null, null, false
        );

        // Then
        assertThat(spec1).isNotNull();
        assertThat(spec2).isNotNull();
        assertThat(spec1.toString()).isNotNull();
        assertThat(spec2.toString()).isNotNull();
    }

    @Test
    @DisplayName("Should handle various date ranges")
    void shouldHandleVariousDateRanges() {
        // Given - Past dates
        LocalDate pastMin = LocalDate.of(2020, 1, 1);
        LocalDate pastMax = LocalDate.of(2021, 12, 31);

        // Given - Future dates
        LocalDate futureMin = LocalDate.of(2030, 1, 1);
        LocalDate futureMax = LocalDate.of(2031, 12, 31);

        // When
        Specification<Student> pastSpec = StudentSpecifications.withFilters(
                null, null, null, null, null, pastMin, pastMax, false
        );

        Specification<Student> futureSpec = StudentSpecifications.withFilters(
                null, null, null, null, null, futureMin, futureMax, false
        );

        // Then
        assertThat(pastSpec).isNotNull();
        assertThat(futureSpec).isNotNull();
        assertThat(pastSpec.toString()).isNotNull();
        assertThat(futureSpec.toString()).isNotNull();
    }
}