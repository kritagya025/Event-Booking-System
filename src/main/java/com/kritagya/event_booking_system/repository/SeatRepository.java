package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByVenueId(Long venueId);

    List<Seat> findByVenueIdAndStatus(Long venueId, SeatStatus status);

    List<Seat> findByIdInAndStatus(List<Long> ids, SeatStatus status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    java.util.Optional<Seat> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);

    @Modifying
    @Query("UPDATE Seat s SET s.status = 'AVAILABLE', s.lockedUntil = null WHERE s.status = 'LOCKED' AND s.lockedUntil < :now")
    int releaseExpiredLocks(LocalDateTime now);

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.venue.id = :venueId")
    void deleteByVenueId(@org.springframework.data.repository.query.Param("venueId") Long venueId);
}
