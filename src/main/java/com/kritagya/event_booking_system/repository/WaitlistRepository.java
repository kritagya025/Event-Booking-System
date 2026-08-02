package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Waitlist;
import com.kritagya.event_booking_system.enums.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, WaitlistStatus status);

    Optional<Waitlist> findByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT w FROM Waitlist w JOIN FETCH w.user WHERE w.event.id = :eventId AND w.status = :status ORDER BY w.createdAt ASC")
    List<Waitlist> findByEventIdAndStatusOrderByCreatedAtAsc(@Param("eventId") Long eventId, @Param("status") WaitlistStatus status);

    @Query("SELECT COUNT(w) FROM Waitlist w WHERE w.event.id = :eventId AND w.status = :status")
    Long countByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") WaitlistStatus status);
}
