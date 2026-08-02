package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("SELECT w FROM Wishlist w JOIN FETCH w.event e JOIN FETCH e.venue WHERE w.user.id = :userId")
    List<Wishlist> findByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    Optional<Wishlist> findByUserIdAndEventId(Long userId, Long eventId);

    void deleteByUserIdAndEventId(Long userId, Long eventId);
}
