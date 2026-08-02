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

    @EntityGraph(attributePaths = {"venue", "organizer"})
    List<Event> findByEventDateAndDeletedFalse(LocalDate eventDate);
}
