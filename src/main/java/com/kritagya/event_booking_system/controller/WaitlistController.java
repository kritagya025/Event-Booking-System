package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.WaitlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<Map<String, String>> joinWaitlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        waitlistService.joinWaitlist(eventId, userDetails.getUser());
        return new ResponseEntity<>(Map.of("message", "Successfully joined the waitlist."), HttpStatus.CREATED);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Map<String, String>> leaveWaitlist(
            @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        waitlistService.leaveWaitlist(eventId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Successfully left the waitlist."));
    }

    @GetMapping("/{eventId}/count")
    public ResponseEntity<Map<String, Long>> getWaitlistCount(@PathVariable Long eventId) {
        Long count = waitlistService.getWaitlistCount(eventId);
        return ResponseEntity.ok(Map.of("waitlistCount", count));
    }
}
