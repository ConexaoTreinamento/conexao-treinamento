package org.conexaotreinamento.conexaotreinamentobackend.repository;

import org.conexaotreinamento.conexaotreinamentobackend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("select distinct e from Event e left join fetch e.participants p left join fetch p.student left join fetch e.trainer where e.deletedAt is null order by e.createdAt desc")
    List<Event> findByDeletedAtIsNullOrderByCreatedAtDesc();

    @Query("select distinct e from Event e left join fetch e.participants p left join fetch p.student left join fetch e.trainer order by e.createdAt desc")
    List<Event> findAllByOrderByCreatedAtDesc();

    @Query("select e from Event e left join fetch e.participants p left join fetch p.student left join fetch e.trainer where e.id = :id and e.deletedAt is null")
    Optional<Event> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsByIdAndDeletedAtIsNull(UUID id);

    @Query("select distinct e from Event e left join fetch e.participants p left join fetch p.student left join fetch e.trainer where (lower(e.name) like :term or lower(e.location) like :term) order by e.createdAt desc")
    List<Event> findBySearchTermIncludingInactiveOrderByCreatedAtDesc(String term);

    @Query("select distinct e from Event e left join fetch e.participants p left join fetch p.student left join fetch e.trainer where e.deletedAt is null and (lower(e.name) like :term or lower(e.location) like :term) order by e.createdAt desc")
    List<Event> findBySearchTermAndDeletedAtIsNullOrderByCreatedAtDesc(String term);
}
