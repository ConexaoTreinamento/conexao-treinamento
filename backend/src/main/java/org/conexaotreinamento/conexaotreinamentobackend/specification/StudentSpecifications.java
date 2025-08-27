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
            String ageRange,
            String joinPeriod,
            boolean includeInactive) {

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
                    criteriaBuilder.like(criteriaBuilder.lower(
                        criteriaBuilder.coalesce(root.get("profession"), "")), searchTerm)
                );
                predicates.add(searchPredicate);
            }

            // Gender filter
            if (gender != null) {
                predicates.add(criteriaBuilder.equal(root.get("gender"), gender));
            }

            // Profession filter
            if (profession != null && !profession.isBlank() && !"all".equals(profession)) {
                String professionTerm = "%" + profession.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("profession"), "")),
                    professionTerm));
            }

            // Age range filter
            if (ageRange != null && !"all".equals(ageRange)) {
                addAgeRangePredicate(predicates, root, query, criteriaBuilder, ageRange);
            }

            // Join period filter
            if (joinPeriod != null && !"all".equals(joinPeriod)) {
                addJoinPeriodPredicate(predicates, root, query, criteriaBuilder, joinPeriod);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addAgeRangePredicate(List<Predicate> predicates,
                                           jakarta.persistence.criteria.Root<Student> root,
                                           jakarta.persistence.criteria.CriteriaQuery<?> query,
                                           jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
                                           String ageRange) {
        
        LocalDate currentDate = LocalDate.now();
        LocalDate minBirthDate = null;
        LocalDate maxBirthDate = null;
        
        switch (ageRange) {
            case "18-25":
                minBirthDate = currentDate.minusYears(25).minusDays(1); // born after this date
                maxBirthDate = currentDate.minusYears(18); // born before or on this date
                break;
            case "26-35":
                minBirthDate = currentDate.minusYears(35).minusDays(1);
                maxBirthDate = currentDate.minusYears(26);
                break;
            case "36-45":
                minBirthDate = currentDate.minusYears(45).minusDays(1);
                maxBirthDate = currentDate.minusYears(36);
                break;
            case "46+":
                maxBirthDate = currentDate.minusYears(46);
                break;
        }
        
        if (minBirthDate != null && maxBirthDate != null) {
            predicates.add(criteriaBuilder.between(root.get("birthDate"), minBirthDate, maxBirthDate));
        } else if (maxBirthDate != null) {
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("birthDate"), maxBirthDate));
        }
    }

    private static void addJoinPeriodPredicate(List<Predicate> predicates,
                                             jakarta.persistence.criteria.Root<Student> root,
                                             jakarta.persistence.criteria.CriteriaQuery<?> query,
                                             jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
                                             String joinPeriod) {
        switch (joinPeriod) {
            case "2024":
                Instant start2024 = LocalDate.of(2024, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                Instant end2024 = LocalDate.of(2025, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(criteriaBuilder.between(root.get("createdAt"), start2024, end2024));
                break;
            case "2023":
                Instant start2023 = LocalDate.of(2023, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                Instant end2023 = LocalDate.of(2024, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(criteriaBuilder.between(root.get("createdAt"), start2023, end2023));
                break;
            case "older":
                Instant before2023 = LocalDate.of(2023, 1, 1).atStartOfDay().toInstant(ZoneOffset.UTC);
                predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), before2023));
                break;
        }
    }
}
