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
import com.kritagya.event_booking_system.logging.AuditLogger;
import com.kritagya.event_booking_system.mapper.BookingMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import com.kritagya.event_booking_system.websocket.SeatUpdatePublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final EmailService emailService;
    private final AuditLogger auditLogger;
    private final WaitlistService waitlistService;
    private final SeatUpdatePublisher seatUpdatePublisher;
    private final CouponService couponService;

    @Value("${app.seat.lock-timeout-minutes:10}")
    private int seatLockTimeoutMinutes;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository,
                          EventRepository eventRepository, SeatRepository seatRepository,
                          EmailService emailService, AuditLogger auditLogger,
                          WaitlistService waitlistService, SeatUpdatePublisher seatUpdatePublisher,
                          CouponService couponService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.emailService = emailService;
        this.auditLogger = auditLogger;
        this.waitlistService = waitlistService;
        this.seatUpdatePublisher = seatUpdatePublisher;
        this.couponService = couponService;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        Event event = eventRepository.findByIdAndDeletedFalse(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException(request.getEventId()));

        if (event.getRegistrationDeadline() != null && LocalDate.now().isAfter(event.getRegistrationDeadline())) {
            throw new IllegalArgumentException("Registration deadline has passed for this event");
        }

        if (event.getAvailableSeats() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough seats available");
        }

        BigDecimal originalTotal = event.getTicketPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal totalAmount = originalTotal;

        // Apply coupon discount if code provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            BigDecimal discount = couponService.calculateDiscount(request.getCouponCode(), originalTotal, event.getEventDate());
            totalAmount = originalTotal.subtract(discount);
            couponService.incrementUsage(request.getCouponCode());
            log.info("Coupon {} applied. Original: {}, Discount: {}, Final: {}",
                    request.getCouponCode(), originalTotal, discount, totalAmount);
        }

        Booking booking = new Booking(
                LocalDateTime.now(),
                BookingStatus.CONFIRMED,
                request.getQuantity(),
                totalAmount,
                user,
                event
        );

        if (request.getSeatIds() != null && !request.getSeatIds().isEmpty()) {
            List<Seat> seatsToBook = seatRepository.findAllById(request.getSeatIds());
            if (seatsToBook.size() != request.getSeatIds().size()) {
                throw new IllegalArgumentException("One or more specified seats do not exist");
            }

            for (Seat seat : seatsToBook) {
                if (seat.getStatus() == SeatStatus.BOOKED) {
                    throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " is already booked");
                }
                if (seat.getStatus() == SeatStatus.LOCKED && seat.getLockedUntil() != null && seat.getLockedUntil().isAfter(LocalDateTime.now())) {
                    throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " is currently locked");
                }
                seat.setStatus(SeatStatus.BOOKED);
                seat.setLockedUntil(null);
            }

            seatRepository.saveAll(seatsToBook);
            booking.setSeats(seatsToBook);
        }

        event.setAvailableSeats(event.getAvailableSeats() - request.getQuantity());
        eventRepository.save(event);

        Booking savedBooking = bookingRepository.save(booking);
        auditLogger.logBookingCreated(savedBooking.getId(), user.getEmail(), event.getId(), savedBooking.getQuantity(), savedBooking.getTotalAmount());
        log.info("Booking created successfully with ID: {} for user: {}", savedBooking.getId(), user.getEmail());
        emailService.sendBookingConfirmationEmail(user, savedBooking);

        // Broadcast real-time seat update over WebSocket
        try {
            seatUpdatePublisher.publishSeatUpdate(event.getId(), null, "BOOKED", event.getAvailableSeats());
        } catch (Exception e) {
            log.warn("Failed to broadcast WebSocket seat update for event {}: {}", event.getId(), e.getMessage());
        }

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

        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            for (Seat seat : booking.getSeats()) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedUntil(null);
            }
            seatRepository.saveAll(booking.getSeats());
        }

        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getQuantity());
        eventRepository.save(event);

        Booking cancelledBooking = bookingRepository.save(booking);
        auditLogger.logBookingCancelled(cancelledBooking.getId(), booking.getUser().getEmail(), event.getId());
        log.info("Booking cancelled successfully with ID: {} for user: {}", cancelledBooking.getId(), booking.getUser().getEmail());
        emailService.sendBookingCancellationEmail(booking.getUser(), cancelledBooking);

        // Auto-promote first waiting user on waitlist when seats are freed
        try {
            waitlistService.autoPromoteFirstWaitingUser(event.getId());
        } catch (Exception e) {
            log.warn("Failed to auto-promote waitlist user for event {}: {}", event.getId(), e.getMessage());
        }

        // Broadcast real-time seat update over WebSocket
        try {
            seatUpdatePublisher.publishSeatUpdate(event.getId(), null, "AVAILABLE", event.getAvailableSeats());
        } catch (Exception e) {
            log.warn("Failed to broadcast WebSocket seat update for event {}: {}", event.getId(), e.getMessage());
        }

        return BookingMapper.toDTO(cancelledBooking);
    }
}
