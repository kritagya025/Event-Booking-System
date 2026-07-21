package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Payment;
import com.kritagya.event_booking_system.enums.PaymentMethod;
import com.kritagya.event_booking_system.enums.PaymentStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.mapper.PaymentMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    public PaymentResponseDTO createPayment(PaymentRequestDTO request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new BookingNotFoundException(request.getBookingId()));

        Payment payment = new Payment(
                booking.getTotalAmount(),
                PaymentMethod.valueOf(request.getPaymentMethod()),
                PaymentStatus.COMPLETED,
                UUID.randomUUID().toString(),
                booking
        );

        Payment savedPayment = paymentRepository.save(payment);
        return PaymentMapper.toDTO(savedPayment);
    }

    public PaymentResponseDTO getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return PaymentMapper.toDTO(payment);
    }

    public PaymentResponseDTO getPaymentByBooking(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new BookingNotFoundException(bookingId);
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
