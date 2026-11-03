package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.WaitlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@Tag(name = "Waitlist", description = "Endpoints for sold-out event waitlist registration, status tracking, and queue metrics")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping("/{eventId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Join event waitlist", description = "Places the authenticated user on the waitlist for a sold-out event")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Joined waitlist successfully"),
            @ApiResponse(responseCode = "400", description = "Event not sold out or already on waitlist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<Map<String, String>> joinWaitlist(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        waitlistService.joinWaitlist(eventId, userDetails.getUser());
        return new ResponseEntity<>(Map.of("message", "Successfully joined the waitlist."), HttpStatus.CREATED);
    }

    @DeleteMapping("/{eventId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Leave event waitlist", description = "Removes the user from the waitlist for the specified event")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Left waitlist successfully"),
            @ApiResponse(responseCode = "400", description = "Not currently active on waitlist"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, String>> leaveWaitlist(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        waitlistService.leaveWaitlist(eventId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("message", "Successfully left the waitlist."));
    }

    @GetMapping("/{eventId}/count")
    @Operation(summary = "Get waitlist queue size", description = "Returns total count of attendees waiting in line for tickets")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Waitlist count returned")
    })
    public ResponseEntity<Map<String, Long>> getWaitlistCount(
            @Parameter(description = "Event ID") @PathVariable Long eventId) {
        Long count = waitlistService.getWaitlistCount(eventId);
        return ResponseEntity.ok(Map.of("waitlistCount", count));
    }

    @GetMapping("/{eventId}/status")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get user waitlist status", description = "Returns the user's current status on the waitlist (WAITING, NOTIFIED, or NONE)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status returned"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, String>> getWaitlistStatus(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String status = waitlistService.getUserWaitlistStatus(eventId, userDetails.getUser());
        return ResponseEntity.ok(Map.of("status", status));
    }
}
