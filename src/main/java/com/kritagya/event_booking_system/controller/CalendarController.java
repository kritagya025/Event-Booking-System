package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.service.CalendarService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/{id}/calendar.ics")
    public ResponseEntity<String> downloadCalendarIcs(@PathVariable Long id) {
        String icsContent = calendarService.generateICalendar(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icsContent);
    }

    @GetMapping("/{id}/google-calendar-link")
    public ResponseEntity<Map<String, String>> getGoogleCalendarLink(@PathVariable Long id) {
        String url = calendarService.generateGoogleCalendarLink(id);
        return ResponseEntity.ok(Map.of("googleCalendarUrl", url));
    }
}
