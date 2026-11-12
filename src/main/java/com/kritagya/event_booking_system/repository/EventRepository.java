package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    @EntityGraph(attributePaths = {"venue", "organizer"})
    List<Event> findByVenueId(Long venueId);

    @EntityGraph(attributePaths = {"venue", "organizer"})
    Page<Event> findByDeletedFalse(Pageable pageable);

    @EntityGraph(attributePaths = {"venue", "organizer"})
    Optional<Event> findByIdAndDeletedFalse(Long id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"venue", "organizer"})
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE e.id = :id AND e.deleted = false")
    Optional<Event> findByIdAndDeletedFalseWithLock(@org.springframework.data.repository.query.Param("id") Long id);

    @EntityGraph(attributePaths = {"venue", "organizer"})
    List<Event> findByEventDateAndDeletedFalse(LocalDate eventDate);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Event e SET e.viewCount = COALESCE(e.viewCount, 0) + 1 WHERE e.id = :eventId AND e.deleted = false")
    int incrementViewCount(@org.springframework.data.repository.query.Param("eventId") Long eventId);

    long countByDeletedFalse();

    long countByDeletedFalseAndStatus(com.kritagya.event_booking_system.enums.EventStatus status);

    long countByStatus(com.kritagya.event_booking_system.enums.EventStatus status);

    long countByDeletedFalseAndEventDateAfter(LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(e.category, 'Uncategorized'), COUNT(e) FROM Event e WHERE e.deleted = false GROUP BY e.category")
    List<Object[]> countEventsByCategory();
}
