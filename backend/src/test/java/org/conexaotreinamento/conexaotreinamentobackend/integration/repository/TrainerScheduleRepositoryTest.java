package org.conexaotreinamento.conexaotreinamentobackend.integration.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.config.PersistenceConfig;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Trainer;
import org.conexaotreinamento.conexaotreinamentobackend.entity.TrainerSchedule;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerScheduleRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.TrainerRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@Import({TestContainerConfig.class, PersistenceConfig.class})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TrainerScheduleRepositoryTest {

    @Autowired
    private TrainerScheduleRepository trainerScheduleRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void softDeletedScheduleStillVisibleForHistoricalTimestamp() {
        Trainer trainer = persistTrainer();
        UUID trainerId = trainer.getId();
        int weekday = 2; // Tuesday
        Instant referenceInstant = Instant.parse("2025-01-01T10:00:00Z");
        Instant olderEffectiveFrom = referenceInstant.minusSeconds(172_800); // two days before
        Instant effectiveFrom = referenceInstant.minusSeconds(86_400); // day before

        TrainerSchedule activeSchedule = buildSchedule(trainerId, weekday, LocalTime.of(8, 0), olderEffectiveFrom);
        activeSchedule.setSeriesName("active-series");

        TrainerSchedule softDeletedFuture = buildSchedule(trainerId, weekday, LocalTime.of(9, 0), effectiveFrom);
        softDeletedFuture.setActive(false);
        softDeletedFuture.setDeletedAt(referenceInstant.plusSeconds(86_400));
        softDeletedFuture.setSeriesName("soft-deleted-future");

        TrainerSchedule softDeletedPast = buildSchedule(trainerId, weekday, LocalTime.of(10, 0), effectiveFrom);
        softDeletedPast.setActive(false);
        softDeletedPast.setDeletedAt(referenceInstant.minusSeconds(86_400));
        softDeletedPast.setSeriesName("soft-deleted-past");

        trainerScheduleRepository.saveAll(List.of(activeSchedule, softDeletedFuture, softDeletedPast));

        List<TrainerSchedule> byWeekday = trainerScheduleRepository
                .findByWeekdayAndEffectiveFromTimestampLessThanEqual(weekday, referenceInstant);
        assertEquals(2, byWeekday.size());
        assertTrue(containsSeries(byWeekday, "active-series"));
        assertTrue(containsSeries(byWeekday, "soft-deleted-future"));
        assertTrue(byWeekday.stream().noneMatch(ts -> "soft-deleted-past".equals(ts.getSeriesName())));

        List<TrainerSchedule> byTrainer = trainerScheduleRepository
                .findByTrainerIdAndWeekdayAndEffectiveFromTimestampLessThanEqualOrderByEffectiveFromTimestampDesc(
                        trainerId,
                        weekday,
                        referenceInstant);
        assertEquals(2, byTrainer.size());
        assertEquals("soft-deleted-future", byTrainer.get(0).getSeriesName());
        assertEquals("active-series", byTrainer.get(1).getSeriesName());
    }

    private TrainerSchedule buildSchedule(UUID trainerId, int weekday, LocalTime startTime, Instant effectiveFrom) {
        TrainerSchedule schedule = new TrainerSchedule();
        schedule.setTrainerId(trainerId);
        schedule.setWeekday(weekday);
        schedule.setStartTime(startTime);
        schedule.setIntervalDuration(60);
        schedule.setSeriesName("placeholder");
        schedule.setActive(true);
        schedule.setEffectiveFromTimestamp(effectiveFrom);
        return schedule;
    }

    private Trainer persistTrainer() {
        User user = userRepository.save(new User(
                "trainer-" + UUID.randomUUID() + "@test.com",
                "password",
                Role.ROLE_TRAINER));

        Trainer trainer = new Trainer();
        trainer.setUserId(user.getId());
        trainer.setName("Repository Test Trainer");
        trainer.setPhone("+55 11 99999-0000");
        trainer.setAddress("Integration Test Gym");
        trainer.setBirthDate(LocalDate.of(1990, 1, 1));
        trainer.setCompensationType(CompensationType.HOURLY);
        return trainerRepository.save(trainer);
    }

    private boolean containsSeries(List<TrainerSchedule> schedules, String seriesName) {
        return schedules.stream().anyMatch(ts -> seriesName.equals(ts.getSeriesName()));
    }
}
