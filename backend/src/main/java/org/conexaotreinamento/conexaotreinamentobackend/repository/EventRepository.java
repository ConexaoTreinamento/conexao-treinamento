package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Page<Event> findByDeletedAtIsNull(Pageable pageable);
    Optional<Event> findByIdAndDeletedAtIsNull(UUID id);

    @Query("select e from Event e where lower(e.name) like :term or lower(e.location) like :term")
    Page<Event> findBySearchTermIncludingInactive(String term, Pageable pageable);

    @Query("select e from Event e where e.deletedAt is null and (lower(e.name) like :term or lower(e.location) like :term)")
    Page<Event> findBySearchTermAndDeletedAtIsNull(String term, Pageable pageable);
}
