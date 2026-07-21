package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByVenueId(Long venueId);
}
