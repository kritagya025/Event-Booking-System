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
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        BookingResponseDTO response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id) {
        BookingResponseDTO booking = bookingService.getBooking(id);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUser(@PathVariable Long userId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByUser(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        BookingResponseDTO booking = bookingService.cancelBooking(id);
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }
}
