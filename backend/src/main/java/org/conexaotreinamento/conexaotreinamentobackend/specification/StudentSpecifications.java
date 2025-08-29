package org.conexaotreinamento.conexaotreinamentobackend.specification;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Student;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

public class StudentSpecifications {

    public static Specification<Student> withFilters(
        String search,
        Student.Gender gender,
        String profession,
        Integer minAge,
        Integer maxAge,
        LocalDate registrationMinDate,
        LocalDate registrationMaxDate,
        boolean includeInactive
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Include inactive filter
            if (!includeInactive) {
                predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));
            }

            // Search filter
            if (search != null && !search.isBlank()) {
                String searchTerm = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("surname")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("profession"), "")), searchTerm
                    )
                );

                predicates.add(searchPredicate);
            }

            // Gender filter
            if (gender != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), gender));
            }

            // Profession filter
            if (profession != null && !profession.isBlank()) {
                String professionTerm = "%" + profession.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("profession"), "")),
                    professionTerm));
            }

            // Age range filter
            if (minAge != null || maxAge != null) {
                addAgeRangePredicate(predicates, root, criteriaBuilder, minAge, maxAge);
            }

            // Date range filter
            if (registrationMinDate != null || registrationMaxDate != null) {
                addDateRangePredicate(predicates, root, criteriaBuilder, registrationMinDate, registrationMaxDate);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addAgeRangePredicate(List<Predicate> predicates,
                                           jakarta.persistence.criteria.Root<Student> root,
                                             jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
                                           Integer minAge,
                                           Integer maxAge) {
        
        LocalDate currentDate = LocalDate.now();
        
        if (maxAge != null) {
            LocalDate minBirthDate = currentDate.minusYears(maxAge).minusDays(1);
            predicates.add(criteriaBuilder.greaterThan(root.get("birthDate"), minBirthDate));
        }
        
        if (minAge != null) {
            LocalDate maxBirthDate = currentDate.minusYears(minAge);
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("birthDate"), maxBirthDate));
        }
    }

    private static void addDateRangePredicate(List<Predicate> predicates,
                                            jakarta.persistence.criteria.Root<Student> root,
                                              jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
                                            LocalDate startDate,
                                            LocalDate endDate) {
        
        if (startDate != null) {
            Instant startInstant = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("registrationDate"), startInstant));
        }
        
        if (endDate != null) {
            Instant endInstant = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            predicates.add(criteriaBuilder.lessThan(root.get("registrationDate"), endInstant));
        }
    }
}
