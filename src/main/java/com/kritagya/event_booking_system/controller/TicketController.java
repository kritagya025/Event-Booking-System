package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.service.TicketService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
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

    @GetMapping("/validate/{qrCode}")
    public ResponseEntity<TicketResponseDTO> validateTicket(@PathVariable String qrCode) {
        TicketResponseDTO ticket = ticketService.validateTicket(qrCode);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/checkin/{qrCode}")
    public ResponseEntity<TicketResponseDTO> checkIn(@PathVariable String qrCode) {
        TicketResponseDTO ticket = ticketService.checkIn(qrCode);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/qrcode")
    public ResponseEntity<byte[]> getTicketQrCode(@PathVariable Long id) {
        byte[] qrCode = ticketService.generateTicketQrCode(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(qrCode, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id) {
        byte[] pdf = ticketService.generateTicketPdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
