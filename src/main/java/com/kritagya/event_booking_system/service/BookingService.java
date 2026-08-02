package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.UserNotFoundException;
import com.kritagya.event_booking_system.mapper.BookingMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Value("${app.seat.lock-timeout-minutes:10}")
    private int seatLockTimeoutMinutes;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository,
                          EventRepository eventRepository, SeatRepository seatRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        Event event = eventRepository.findByIdAndDeletedFalse(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException(request.getEventId()));

        // Check registration deadline
        if (event.getRegistrationDeadline() != null &&
                LocalDate.now().isAfter(event.getRegistrationDeadline())) {
            throw new IllegalArgumentException("Registration deadline has passed for this event");
        }

        // Check available seats
        if (event.getAvailableSeats() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough seats available. Requested: " + request.getQuantity()
                            + ", Available: " + event.getAvailableSeats());
        }

        BigDecimal totalAmount = event.getTicketPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Booking booking = new Booking(
                LocalDateTime.now(),
                BookingStatus.CONFIRMED,
                request.getQuantity(),
                totalAmount,
                user,
                event
        );

        // Handle specific seat allocation if seat IDs are provided
        if (request.getSeatIds() != null && !request.getSeatIds().isEmpty()) {
            if (request.getSeatIds().size() != request.getQuantity()) {
                throw new IllegalArgumentException(
                        "Number of selected seats (" + request.getSeatIds().size()
                                + ") must match booking quantity (" + request.getQuantity() + ")");
            }

            List<Seat> availableSeats = seatRepository.findByIdInAndStatus(
                    request.getSeatIds(), SeatStatus.AVAILABLE);

            if (availableSeats.size() != request.getSeatIds().size()) {
                throw new IllegalArgumentException(
                        "Some selected seats are not available. Requested: " + request.getSeatIds().size()
                                + ", Available: " + availableSeats.size());
            }

            // Lock seats with timeout
            for (Seat seat : availableSeats) {
                seat.setStatus(SeatStatus.BOOKED);
                seat.setLockedUntil(null);
            }
            seatRepository.saveAll(availableSeats);
            booking.setSeats(availableSeats);
        }

        // Decrement available seats atomically via optimistic locking (@Version on Event)
        event.setAvailableSeats(event.getAvailableSeats() - request.getQuantity());
        eventRepository.save(event);

        Booking savedBooking = bookingRepository.save(booking);
        return BookingMapper.toDTO(savedBooking);
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));
        return BookingMapper.toDTO(booking);
    }

    public List<BookingResponseDTO> getBookingsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        // Release allocated seats
        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            for (Seat seat : booking.getSeats()) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
            }
            seatRepository.saveAll(booking.getSeats());
        }

        // Restore available seats on event
        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getQuantity());
        eventRepository.save(event);

        Booking cancelledBooking = bookingRepository.save(booking);
        return BookingMapper.toDTO(cancelledBooking);
    }
}
