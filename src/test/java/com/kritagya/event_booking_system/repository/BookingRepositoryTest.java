package com.kritagya.event_booking_system.repository;

import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Test
    @DisplayName("Should find bookings by user ID")
    void findByUserId_Success() {
        User user = userRepository.save(new User("Customer", "One", "customertest@example.com", "pass", "123", Role.CUSTOMER));
        Venue venue = venueRepository.save(new Venue("Hall A", "Downtown", 300, "Small hall"));
        Event event = eventRepository.save(new Event("Standup", "Comedy show", LocalDate.now().plusDays(3),
                LocalTime.of(20, 0), LocalTime.of(22, 0), "COMEDY",
                EventStatus.PUBLISHED, BigDecimal.valueOf(40), 50, venue));

        bookingRepository.save(new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 2,
                BigDecimal.valueOf(80), user, event));

        List<Booking> bookings = bookingRepository.findByUserId(user.getId());

        assertThat(bookings).hasSize(1);
        assertThat(bookings.get(0).getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(80));
    }
}
