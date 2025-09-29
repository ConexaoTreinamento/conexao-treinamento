package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findByDeletedAtIsNullOrderByCreatedAtDesc();
    List<Event> findAllByOrderByCreatedAtDesc();
    Optional<Event> findByIdAndDeletedAtIsNull(UUID id);
    boolean existsByIdAndDeletedAtIsNull(UUID id);

    @Query("select e from Event e where (lower(e.name) like :term or lower(e.location) like :term) order by e.createdAt desc")
    List<Event> findBySearchTermIncludingInactiveOrderByCreatedAtDesc(String term);

    @Query("select e from Event e where e.deletedAt is null and (lower(e.name) like :term or lower(e.location) like :term) order by e.createdAt desc")
    List<Event> findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc(String term);
}
