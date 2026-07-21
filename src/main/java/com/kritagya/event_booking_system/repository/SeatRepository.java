package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByVenueId(Long venueId);

    List<Seat> findByVenueIdAndStatus(Long venueId, SeatStatus status);
}
