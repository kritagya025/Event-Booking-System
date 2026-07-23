package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO request) {
        EventResponseDTO response = eventService.createEvent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventService.getAllEvents();
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
}
