package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            request.setUserId(userDetails.getUser().getId());
        } else if (request.getUserId() == null) {
            request.setUserId(userDetails.getUser().getId());
        }
        BookingResponseDTO response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        BookingResponseDTO booking = bookingService.getBooking(id, userDetails.getUser());
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUser(
            @PathVariable Long userId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (!userId.equals(userDetails.getUser().getId()) && userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view bookings for another user.");
        }
        List<BookingResponseDTO> bookings = bookingService.getBookingsByUser(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        BookingResponseDTO booking = bookingService.cancelBooking(id, userDetails.getUser());
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }
}
