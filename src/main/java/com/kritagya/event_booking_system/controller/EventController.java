package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO request,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        EventResponseDTO response = eventService.createEvent(request, userDetails.getUser());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<EventResponseDTO>> getAllEvents(@PageableDefault(size = 10) Pageable pageable) {
        Page<EventResponseDTO> events = eventService.getAllEvents(pageable);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<EventResponseDTO>> searchEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<EventResponseDTO> events = eventService.searchEvents(
                category, dateFrom, dateTo, venueId, keyword, minPrice, maxPrice, pageable);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEvent(@PathVariable Long id) {
        EventResponseDTO event = eventService.getEvent(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<EventResponseDTO>> getEventsByVenue(@PathVariable Long venueId) {
        List<EventResponseDTO> events = eventService.getEventsByVenue(venueId);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable Long id,
                                                        @Valid @RequestBody EventRequestDTO request) {
        EventResponseDTO event = eventService.updateEvent(id, request);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<EventResponseDTO> publishEvent(@PathVariable Long id) {
        EventResponseDTO event = eventService.publishEvent(id);
        return ResponseEntity.ok(event);
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<EventResponseDTO> unpublishEvent(@PathVariable Long id) {
        EventResponseDTO event = eventService.unpublishEvent(id);
        return ResponseEntity.ok(event);
    }
}
