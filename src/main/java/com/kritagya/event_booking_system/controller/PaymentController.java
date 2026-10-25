package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for payment processing, transaction verification, and receipt retrieval")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Process booking payment", description = "Executes payment transaction for an existing booking using selected payment method")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payment parameters or already paid"),
            @ApiResponse(responseCode = "403", description = "Unauthorized access to booking payment"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO response = paymentService.createPayment(request, userDetails.getUser());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID", description = "Retrieves payment details by payment ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment record found"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Payment not found")
    })
    public ResponseEntity<PaymentResponseDTO> getPayment(
            @Parameter(description = "Payment ID") @PathVariable Long id,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO payment = paymentService.getPayment(id, userDetails.getUser());
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment by booking ID", description = "Retrieves payment associated with a specific booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment record found"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Payment or booking not found")
    })
    public ResponseEntity<PaymentResponseDTO> getPaymentByBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        PaymentResponseDTO payment = paymentService.getPaymentByBooking(bookingId, userDetails.getUser());
        return new ResponseEntity<>(payment, HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all payments", description = "Returns all payment transactions system-wide. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of all payments"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<List<PaymentResponseDTO>> getAllPayments() {
        List<PaymentResponseDTO> payments = paymentService.getAllPayments();
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
}
