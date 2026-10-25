package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.EventAnalyticsDTO;
import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Endpoints for discovering, searching, managing, and publishing events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new event", description = "Creates an event in DRAFT or PUBLISHED status. Organizers and Admins can create events.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Event created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid event request payload"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO request,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        com.kritagya.event_booking_system.entity.User organizer = userDetails != null ? userDetails.getUser() : null;
        EventResponseDTO response = eventService.createEvent(request, organizer);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all events", description = "Returns paginated list of published events")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Events retrieved successfully")
    })
    public ResponseEntity<Page<EventResponseDTO>> getAllEvents(@PageableDefault(size = 10) Pageable pageable) {
        Page<EventResponseDTO> events = eventService.getAllEvents(pageable);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/search")
    @Operation(summary = "Search events with dynamic filters", description = "Filter events by category, date range, venue, city, keyword, and price limits")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search results returned successfully")
    })
    public ResponseEntity<Page<EventResponseDTO>> searchEvents(
            @Parameter(description = "Event category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Start date range") @RequestParam(required = false) LocalDate dateFrom,
            @Parameter(description = "End date range") @RequestParam(required = false) LocalDate dateTo,
            @Parameter(description = "Venue ID filter") @RequestParam(required = false) Long venueId,
            @Parameter(description = "City location filter") @RequestParam(required = false) String city,
            @Parameter(description = "Keyword search for title/description/venue") @RequestParam(required = false) String keyword,
            @Parameter(description = "Minimum ticket price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum ticket price") @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<EventResponseDTO> events = eventService.searchEvents(
                category, dateFrom, dateTo, venueId, city, keyword, minPrice, maxPrice, pageable);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Retrieves event details and increments view count counter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Event details found"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<EventResponseDTO> getEvent(
            @Parameter(description = "Event unique ID") @PathVariable Long id) {
        eventService.incrementViewCount(id);
        EventResponseDTO event = eventService.getEvent(id);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get event analytics", description = "Provides performance metrics, tickets sold, revenue, and attendance analytics")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analytics metrics retrieved"),
            @ApiResponse(responseCode = "403", description = "Forbidden - requires ADMIN or ORGANIZER role"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<EventAnalyticsDTO> getEventAnalytics(
            @Parameter(description = "Event ID to analyze") @PathVariable Long id) {
        EventAnalyticsDTO analytics = eventService.getEventAnalytics(id);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular events", description = "Retrieves top events ranked by total view counts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Popular events list")
    })
    public ResponseEntity<List<EventResponseDTO>> getPopularEvents(
            @Parameter(description = "Maximum number of events to return") @RequestParam(defaultValue = "5") int limit) {
        List<EventResponseDTO> popular = eventService.getPopularEvents(limit);
        return ResponseEntity.ok(popular);
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending events", description = "Retrieves events with highest velocity of bookings in recent hours")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Trending events list")
    })
    public ResponseEntity<List<EventResponseDTO>> getTrendingEvents(
            @Parameter(description = "Maximum number of events to return") @RequestParam(defaultValue = "5") int limit) {
        List<EventResponseDTO> trending = eventService.getTrendingEvents(limit);
        return ResponseEntity.ok(trending);
    }

    @GetMapping("/recommendations")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get personalized event recommendations", description = "Returns recommended events based on user booking and browsing history")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recommended events list"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<EventResponseDTO>> getRecommendedEvents(
            @Parameter(description = "Maximum number of recommendations") @RequestParam(defaultValue = "5") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<EventResponseDTO> recommended = eventService.getRecommendedEvents(userDetails.getUser(), limit);
        return ResponseEntity.ok(recommended);
    }

    @GetMapping("/venue/{venueId}")
    @Operation(summary = "Get events by venue", description = "Retrieves all events scheduled at a specific venue")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Events found for venue")
    })
    public ResponseEntity<List<EventResponseDTO>> getEventsByVenue(
            @Parameter(description = "Venue ID") @PathVariable Long venueId) {
        List<EventResponseDTO> events = eventService.getEventsByVenue(venueId);
        return new ResponseEntity<>(events, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update event details", description = "Updates details of an existing event")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Event updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<EventResponseDTO> updateEvent(
            @Parameter(description = "Event ID to update") @PathVariable Long id,
            @Valid @RequestBody EventRequestDTO request) {
        EventResponseDTO event = eventService.updateEvent(id, request);
        return new ResponseEntity<>(event, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete event", description = "Soft-deletes or removes an event from active catalog")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Event deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "Event ID to delete") @PathVariable Long id) {
        eventService.deleteEvent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PatchMapping("/{id}/publish")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Publish event", description = "Changes event lifecycle status to PUBLISHED making it visible to users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Event published successfully"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<EventResponseDTO> publishEvent(
            @Parameter(description = "Event ID to publish") @PathVariable Long id) {
        EventResponseDTO event = eventService.publishEvent(id);
        return ResponseEntity.ok(event);
    }

    @PatchMapping("/{id}/unpublish")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Unpublish event", description = "Reverts event status to DRAFT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Event unpublished successfully"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<EventResponseDTO> unpublishEvent(
            @Parameter(description = "Event ID to unpublish") @PathVariable Long id) {
        EventResponseDTO event = eventService.unpublishEvent(id);
        return ResponseEntity.ok(event);
    }
}
