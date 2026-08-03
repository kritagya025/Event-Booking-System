package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private com.kritagya.event_booking_system.repository.TicketRepository ticketRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private com.kritagya.event_booking_system.logging.AuditLogger auditLogger;

    @Mock
    private WaitlistService waitlistService;

    @Mock
    private com.kritagya.event_booking_system.websocket.SeatUpdatePublisher seatUpdatePublisher;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Event event;
    private Venue venue;
    private Booking booking;
    private BookingRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        venue = new Venue("Test Venue", "123 Test St", 500, "A test venue");

        user = new User("Jane", "Doe", "jane@example.com", "encoded", "1234567890", Role.CUSTOMER);

        event = new Event("Concert", "Live concert", LocalDate.now().plusDays(30),
                LocalTime.of(19, 0), LocalTime.of(23, 0), "MUSIC",
                EventStatus.PUBLISHED, BigDecimal.valueOf(100), 50, venue);

        booking = new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 2,
                BigDecimal.valueOf(200), user, event);

        requestDTO = new BookingRequestDTO(1L, 1L, 2);
    }

    @Test
    @DisplayName("Should create booking and decrement available seats")
    void createBooking_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponseDTO result = bookingService.createBooking(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(2);
        assertThat(event.getAvailableSeats()).isEqualTo(48);
        verify(eventRepository).save(event);
    }

    @Test
    @DisplayName("Should reject booking when not enough seats")
    void createBooking_NotEnoughSeats() {
        event.setAvailableSeats(1);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> bookingService.createBooking(requestDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Not enough seats available");
    }

    @Test
    @DisplayName("Should reject booking past registration deadline")
    void createBooking_PastDeadline() {
        event.setRegistrationDeadline(LocalDate.now().minusDays(1));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(eventRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> bookingService.createBooking(requestDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Registration deadline has passed");
    }

    @Test
    @DisplayName("Should cancel booking and restore seats")
    void cancelBooking_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        int seatsBefore = event.getAvailableSeats();
        BookingResponseDTO result = bookingService.cancelBooking(1L);

        assertThat(result).isNotNull();
        assertThat(booking.getBookingStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(event.getAvailableSeats()).isEqualTo(seatsBefore + 2);
    }

    @Test
    @DisplayName("Should reject cancelling already cancelled booking")
    void cancelBooking_AlreadyCancelled() {
        booking.setBookingStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    @DisplayName("Should throw BookingNotFoundException")
    void getBooking_NotFound() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBooking(99L))
                .isInstanceOf(BookingNotFoundException.class);
    }
}
