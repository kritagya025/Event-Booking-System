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
    public ResponseEntity<List<TicketResponseDTO>> generateTickets(
            @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        List<TicketResponseDTO> tickets = ticketService.generateTickets(bookingId, userDetails.getUser());
        return new ResponseEntity<>(tickets, HttpStatus.CREATED);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByBooking(
            @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        List<TicketResponseDTO> tickets = ticketService.getTicketsByBooking(bookingId, userDetails.getUser());
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicket(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        TicketResponseDTO ticket = ticketService.getTicket(id, userDetails.getUser());
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
    public ResponseEntity<byte[]> getTicketQrCode(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] qrCode = ticketService.generateTicketQrCode(id, userDetails.getUser());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(qrCode, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadTicketPdf(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] pdf = ticketService.generateTicketPdf(id, userDetails.getUser());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/booking/{bookingId}/pdf")
    public ResponseEntity<byte[]> downloadBookingPdf(
            @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] pdf = ticketService.generateBookingPdf(bookingId, userDetails.getUser());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "booking-" + bookingId + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
