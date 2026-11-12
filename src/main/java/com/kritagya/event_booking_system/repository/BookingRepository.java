package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT DISTINCT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.event e JOIN FETCH e.venue WHERE b.user.id = :userId")
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.event e JOIN FETCH e.venue WHERE b.event.id = :eventId")
    List<Booking> findByEventId(@Param("eventId") Long eventId);

    @Query("SELECT DISTINCT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.event e JOIN FETCH e.venue WHERE b.event.id = :eventId AND b.bookingStatus = :bookingStatus")
    List<Booking> findByEventIdAndBookingStatus(@Param("eventId") Long eventId, @Param("bookingStatus") BookingStatus bookingStatus);

    @Query("SELECT DISTINCT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.event e JOIN FETCH e.venue WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId AND b.bookingStatus = :status")
    Long countByEventIdAndBookingStatus(@Param("eventId") Long eventId, @Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.event.id = :eventId AND b.bookingStatus = :status")
    java.math.BigDecimal sumRevenueByEventIdAndStatus(@Param("eventId") Long eventId, @Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus = :status")
    java.math.BigDecimal sumTotalRevenueByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus = :status AND b.bookingDate >= :since")
    java.math.BigDecimal sumRevenueByStatusSince(@Param("status") BookingStatus status, @Param("since") java.time.LocalDateTime since);

    @Query("SELECT COALESCE(e.category, 'Uncategorized'), COALESCE(SUM(b.totalAmount), 0) FROM Booking b LEFT JOIN b.event e WHERE b.bookingStatus = :status GROUP BY e.category")
    List<Object[]> sumRevenueByCategoryAndStatus(@Param("status") BookingStatus status);

    @Query("SELECT b.bookingDate, b.totalAmount FROM Booking b WHERE b.bookingStatus = :status AND b.bookingDate IS NOT NULL")
    List<Object[]> findBookingDatesAndAmountsByStatus(@Param("status") BookingStatus status);

    long countByBookingStatus(BookingStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Booking b WHERE b.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
