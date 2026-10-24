package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Calendar", description = "Endpoints for iCalendar (.ics) downloads and Google Calendar integration")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/{id}/calendar.ics")
    @Operation(summary = "Download iCalendar (.ics) file", description = "Generates standard RFC 5545 iCalendar file for importing event details into Apple Calendar, Outlook, etc.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "iCalendar file generated and returned as attachment"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<String> downloadCalendarIcs(
            @Parameter(description = "Event ID to export calendar for") @PathVariable Long id) {
        String icsContent = calendarService.generateICalendar(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icsContent);
    }

    @GetMapping("/{id}/google-calendar-link")
    @Operation(summary = "Generate Google Calendar import link", description = "Constructs an external Google Calendar URL with pre-populated event details.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Google Calendar render URL returned"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<Map<String, String>> getGoogleCalendarLink(
            @Parameter(description = "Event ID to construct Google Calendar link for") @PathVariable Long id) {
        String url = calendarService.generateGoogleCalendarLink(id);
        return ResponseEntity.ok(Map.of("googleCalendarUrl", url));
    }
}
