package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkin")
@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
@Tag(name = "Check-In", description = "Endpoints for gate attendance check-in and attendee ticket validation")
@SecurityRequirement(name = "Bearer Authentication")
public class CheckInController {

    private final TicketService ticketService;

    public CheckInController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/{ticketId}")
    @Operation(summary = "Check in ticket by ID", description = "Marks attendee ticket as USED with timestamp upon gate check-in. Requires ADMIN or ORGANIZER.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check-in successful"),
            @ApiResponse(responseCode = "400", description = "Ticket already used or cancelled"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<TicketResponseDTO> checkInTicket(
            @Parameter(description = "Ticket ID") @PathVariable Long ticketId) {
        TicketResponseDTO response = ticketService.checkInById(ticketId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate/{ticketId}")
    @Operation(summary = "Validate ticket by ID", description = "Verifies ticket validity and active status before check-in. Requires ADMIN or ORGANIZER.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket is valid"),
            @ApiResponse(responseCode = "400", description = "Ticket is used or cancelled"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<TicketResponseDTO> validateTicket(
            @Parameter(description = "Ticket ID") @PathVariable Long ticketId) {
        TicketResponseDTO response = ticketService.validateTicketById(ticketId);
        return ResponseEntity.ok(response);
    }
}
