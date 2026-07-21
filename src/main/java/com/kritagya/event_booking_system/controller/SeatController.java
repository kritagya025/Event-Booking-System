package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.SeatRequestDTO;
import com.kritagya.event_booking_system.dto.SeatResponseDTO;
import com.kritagya.event_booking_system.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @PostMapping
    public ResponseEntity<SeatResponseDTO> createSeat(@Valid @RequestBody SeatRequestDTO request) {
        SeatResponseDTO response = seatService.createSeat(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SeatResponseDTO>> getAllSeats() {
        List<SeatResponseDTO> seats = seatService.getAllSeats();
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatResponseDTO> getSeat(@PathVariable Long id) {
        SeatResponseDTO seat = seatService.getSeat(id);
        return new ResponseEntity<>(seat, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<SeatResponseDTO>> getSeatsByVenue(@PathVariable Long venueId) {
        List<SeatResponseDTO> seats = seatService.getSeatsByVenue(venueId);
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}/available")
    public ResponseEntity<List<SeatResponseDTO>> getAvailableSeatsByVenue(@PathVariable Long venueId) {
        List<SeatResponseDTO> seats = seatService.getAvailableSeatsByVenue(venueId);
        return new ResponseEntity<>(seats, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeatResponseDTO> updateSeat(@PathVariable Long id,
                                                      @Valid @RequestBody SeatRequestDTO request) {
        SeatResponseDTO seat = seatService.updateSeat(id, request);
        return new ResponseEntity<>(seat, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
