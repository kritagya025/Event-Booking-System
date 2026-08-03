package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByEventId(Long eventId, Pageable pageable);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    Optional<Review> findByUserIdAndEventId(Long userId, Long eventId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.event.id = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.event.id = :eventId")
    Long countByEventId(@Param("eventId") Long eventId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Review r WHERE r.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
