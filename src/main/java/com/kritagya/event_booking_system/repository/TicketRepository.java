package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByBookingId(Long bookingId);

    Optional<Ticket> findByQrCode(String qrCode);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM Ticket t WHERE t.booking.id IN (SELECT b.id FROM Booking b WHERE b.event.id = :eventId)")
    void deleteByEventId(@org.springframework.data.repository.query.Param("eventId") Long eventId);
}

