package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.SeatRequestDTO;
import com.kritagya.event_booking_system.dto.SeatResponseDTO;
import com.kritagya.event_booking_system.service.SeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@Tag(name = "Seats", description = "Endpoints for venue seat allocation, availability discovery, and temporary seat locking")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @Operation(summary = "Create seat", description = "Creates a new seat definition for a venue")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Seat created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid seat payload"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    public ResponseEntity<SeatResponseDTO> createSeat(@Valid @RequestBody SeatRequestDTO request) {
        SeatResponseDTO response = seatService.createSeat(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all seats", description = "Retrieves all seats defined across all venues")
    public ResponseEntity<List<SeatResponseDTO>> getAllSeats() {
        List<SeatResponseDTO> seats = seatService.getAllSeats();
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get seat by ID", description = "Retrieves seat details including row, number, type, and current status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat found"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    public ResponseEntity<SeatResponseDTO> getSeat(
            @Parameter(description = "Seat ID") @PathVariable Long id) {
        SeatResponseDTO seat = seatService.getSeat(id);
        return new ResponseEntity<>(seat, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}")
    @Operation(summary = "Get seats by venue ID", description = "Retrieves all seats for a venue, auto-generating a default grid if unconfigured")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seats retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    public ResponseEntity<List<SeatResponseDTO>> getSeatsByVenue(
            @Parameter(description = "Venue ID") @PathVariable Long venueId) {
        List<SeatResponseDTO> seats = seatService.getSeatsByVenue(venueId);
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}/available")
    @Operation(summary = "Get available seats for venue", description = "Filters and returns only currently available seats for a venue")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Available seats retrieved"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    public ResponseEntity<List<SeatResponseDTO>> getAvailableSeatsByVenue(
            @Parameter(description = "Venue ID") @PathVariable Long venueId) {
        List<SeatResponseDTO> seats = seatService.getAvailableSeatsByVenue(venueId);
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @Operation(summary = "Update seat", description = "Updates seat position, type, or operational status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seat updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid payload"),
            @ApiResponse(responseCode = "404", description = "Seat or venue not found")
    })
    public ResponseEntity<SeatResponseDTO> updateSeat(@PathVariable Long id,
                                                      @Valid @RequestBody SeatRequestDTO request) {
        SeatResponseDTO seat = seatService.updateSeat(id, request);
        return new ResponseEntity<>(seat, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @Operation(summary = "Delete seat", description = "Removes a seat definition from a venue")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Seat deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Seat not found")
    })
    public ResponseEntity<Void> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/lock")
    @Operation(summary = "Temporarily lock seats", description = "Holds selected seats for a checkout session with configurable lock duration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seats locked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid seat list"),
            @ApiResponse(responseCode = "409", description = "One or more seats are already booked or locked")
    })
    public ResponseEntity<List<SeatResponseDTO>> lockSeats(
            @RequestBody List<Long> seatIds,
            @RequestParam(defaultValue = "10") int timeoutMinutes) {
        List<SeatResponseDTO> lockedSeats = seatService.lockSeats(seatIds, timeoutMinutes);
        return ResponseEntity.ok(lockedSeats);
    }

    @PostMapping("/unlock")
    @Operation(summary = "Release seat locks", description = "Releases held seat locks back to available status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Seats unlocked successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid seat list")
    })
    public ResponseEntity<List<SeatResponseDTO>> unlockSeats(@RequestBody List<Long> seatIds) {
        List<SeatResponseDTO> unlockedSeats = seatService.unlockSeats(seatIds);
        return ResponseEntity.ok(unlockedSeats);
    }
}
