package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.service.BookingService;
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
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Endpoints for ticket reservations, booking retrieval, and cancellations")
@SecurityRequirement(name = "Bearer Authentication")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a new booking", description = "Reserves tickets/seats for a specified event. Non-admin users can only book for themselves.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or insufficient seat availability"),
            @ApiResponse(responseCode = "401", description = "Unauthorized request"),
            @ApiResponse(responseCode = "404", description = "Event or user not found")
    })
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            request.setUserId(userDetails.getUser().getId());
        } else if (request.getUserId() == null) {
            request.setUserId(userDetails.getUser().getId());
        }
        BookingResponseDTO response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all bookings", description = "Retrieves all bookings across the platform. Requires ADMIN role.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of bookings retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN role")
    })
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Retrieves reservation details by unique booking identifier.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking found and returned"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to view another user's booking"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> getBooking(
            @Parameter(description = "ID of the booking to retrieve") @PathVariable Long id,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        BookingResponseDTO booking = bookingService.getBooking(id, userDetails.getUser());
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get bookings by user ID", description = "Retrieves all bookings for the specified user ID. Users can only view their own bookings unless ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User bookings retrieved"),
            @ApiResponse(responseCode = "403", description = "Forbidden - unauthorized access to other user's bookings")
    })
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByUser(
            @Parameter(description = "ID of the user whose bookings to fetch") @PathVariable Long userId,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        if (!userId.equals(userDetails.getUser().getId()) && userDetails.getUser().getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view bookings for another user.");
        }
        List<BookingResponseDTO> bookings = bookingService.getBookingsByUser(userId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "Cancels a confirmed booking, returning seats to inventory and notifying waitlist.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Booking cannot be cancelled"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to cancel this booking"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @Parameter(description = "ID of the booking to cancel") @PathVariable Long id,
            @AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        BookingResponseDTO booking = bookingService.cancelBooking(id, userDetails.getUser());
        return new ResponseEntity<>(booking, HttpStatus.OK);
    }
}
