package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkin")
@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
public class CheckInController {

    private final TicketService ticketService;

    public CheckInController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/{ticketId}")
    public ResponseEntity<TicketResponseDTO> checkInTicket(@PathVariable Long ticketId) {
        TicketResponseDTO response = ticketService.checkInById(ticketId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate/{ticketId}")
    public ResponseEntity<TicketResponseDTO> validateTicket(@PathVariable Long ticketId) {
        TicketResponseDTO response = ticketService.validateTicketById(ticketId);
        return ResponseEntity.ok(response);
    }
}
