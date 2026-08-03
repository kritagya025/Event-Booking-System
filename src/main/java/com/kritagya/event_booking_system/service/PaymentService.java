package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Payment;
import com.kritagya.event_booking_system.enums.PaymentMethod;
import com.kritagya.event_booking_system.enums.PaymentStatus;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.logging.AuditLogger;
import com.kritagya.event_booking_system.mapper.PaymentMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogger auditLogger;
    private final TicketService ticketService;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository, AuditLogger auditLogger,
                          TicketService ticketService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogger = auditLogger;
        this.ticketService = ticketService;
    }

    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        return createPayment(request, null);
    }

    @Transactional
    public PaymentResponseDTO createPayment(PaymentRequestDTO request, com.kritagya.event_booking_system.entity.User currentUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new BookingNotFoundException(request.getBookingId()));

        if (currentUser != null && !booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to create payment for this booking.");
        }

        Payment payment = new Payment(
                booking.getTotalAmount(),
                PaymentMethod.valueOf(request.getPaymentMethod()),
                PaymentStatus.COMPLETED,
                UUID.randomUUID().toString(),
                booking
        );

        Payment savedPayment = paymentRepository.save(payment);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        ticketService.generateTickets(booking.getId(), currentUser);
        auditLogger.logPaymentProcessed(savedPayment.getId(), booking.getId(),
                request.getPaymentMethod(), savedPayment.getPaymentStatus().name(), savedPayment.getAmount());
        log.info("Payment created successfully with ID: {} for booking ID: {}", savedPayment.getId(), booking.getId());

        return PaymentMapper.toDTO(savedPayment);
    }

    public PaymentResponseDTO getPayment(Long id) {
        return getPayment(id, null);
    }

    public PaymentResponseDTO getPayment(Long id, com.kritagya.event_booking_system.entity.User currentUser) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        if (currentUser != null && !payment.getBooking().getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view this payment.");
        }

        return PaymentMapper.toDTO(payment);
    }

    public PaymentResponseDTO getPaymentByBooking(Long bookingId) {
        return getPaymentByBooking(bookingId, null);
    }

    public PaymentResponseDTO getPaymentByBooking(Long bookingId, com.kritagya.event_booking_system.entity.User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (currentUser != null && !booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view payment for this booking.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking id: " + bookingId));
        return PaymentMapper.toDTO(payment);
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }
}
