package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    List<Event> findByVenueId(Long venueId);

    Page<Event> findByDeletedFalse(Pageable pageable);

    Optional<Event> findByIdAndDeletedFalse(Long id);
}
