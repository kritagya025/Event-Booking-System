package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {

}
