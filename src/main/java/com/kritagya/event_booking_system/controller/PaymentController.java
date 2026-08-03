package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO response = paymentService.createPayment(request, userDetails.getUser());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPayment(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO payment = paymentService.getPayment(id, userDetails.getUser());
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByBooking(
            @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO payment = paymentService.getPaymentByBooking(bookingId, userDetails.getUser());
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        List<PaymentResponseDTO> payments = paymentService.getAllPayments();
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
}
