package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.VenueRequestDTO;
import com.kritagya.event_booking_system.dto.VenueResponseDTO;
import com.kritagya.event_booking_system.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @PostMapping
    public ResponseEntity<VenueResponseDTO> createVenue(@Valid @RequestBody VenueRequestDTO request) {
        VenueResponseDTO response = venueService.createVenue(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueResponseDTO>> getAllVenues() {
        List<VenueResponseDTO> venues = venueService.getAllVenues();
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> getVenue(@PathVariable Long id) {
        VenueResponseDTO venue = venueService.getVenue(id);
        return new ResponseEntity<>(venue, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> updateVenue(@PathVariable Long id,
                                                        @Valid @RequestBody VenueRequestDTO request) {
        VenueResponseDTO venue = venueService.updateVenue(id, request);
        return new ResponseEntity<>(venue, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
