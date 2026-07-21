package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.exception.UserNotFoundException;
import com.kritagya.event_booking_system.mapper.BookingMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository,
                          EventRepository eventRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException(request.getEventId()));

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

    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getQuantity());
        eventRepository.save(event);

        Booking cancelledBooking = bookingRepository.save(booking);
        return BookingMapper.toDTO(cancelledBooking);
    }
}
