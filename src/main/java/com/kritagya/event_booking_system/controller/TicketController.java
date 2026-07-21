package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<List<TicketResponseDTO>> generateTickets(@PathVariable Long bookingId) {
        List<TicketResponseDTO> tickets = ticketService.generateTickets(bookingId);
        return new ResponseEntity<>(tickets, HttpStatus.CREATED);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByBooking(@PathVariable Long bookingId) {
        List<TicketResponseDTO> tickets = ticketService.getTicketsByBooking(bookingId);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicket(@PathVariable Long id) {
        TicketResponseDTO ticket = ticketService.getTicket(id);
        return new ResponseEntity<>(ticket, HttpStatus.OK);
    }
}
