package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Endpoints for ticket generation, QR validation, check-in, and PDF downloads")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/booking/{bookingId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Generate tickets for booking", description = "Generates QR-coded tickets for all seats in a confirmed booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tickets generated successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<List<TicketResponseDTO>> generateTickets(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        List<TicketResponseDTO> tickets = ticketService.generateTickets(bookingId, userDetails.getUser());
        return new ResponseEntity<>(tickets, HttpStatus.CREATED);
    }

    @GetMapping("/booking/{bookingId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get tickets for booking", description = "Retrieves all issued tickets associated with a booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tickets retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<List<TicketResponseDTO>> getTicketsByBooking(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        List<TicketResponseDTO> tickets = ticketService.getTicketsByBooking(bookingId, userDetails.getUser());
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get ticket by ID", description = "Retrieves specific ticket details including QR token and validity")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket found"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<TicketResponseDTO> getTicket(
            @Parameter(description = "Ticket ID") @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        TicketResponseDTO ticket = ticketService.getTicket(id, userDetails.getUser());
        return new ResponseEntity<>(ticket, HttpStatus.OK);
    }

    @GetMapping("/validate/{qrCode}")
    @Operation(summary = "Validate ticket QR code", description = "Validates ticket status by scanning or supplying the unique QR string")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ticket is valid and verified"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired ticket QR"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<TicketResponseDTO> validateTicket(
            @Parameter(description = "Ticket QR code string") @PathVariable String qrCode) {
        TicketResponseDTO ticket = ticketService.validateTicket(qrCode);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/checkin/{qrCode}")
    @Operation(summary = "Check in attendee with QR code", description = "Marks attendee ticket as USED with timestamp upon gate scan")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check-in successful"),
            @ApiResponse(responseCode = "400", description = "Ticket already checked in or invalid"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<TicketResponseDTO> checkIn(
            @Parameter(description = "Ticket QR code string") @PathVariable String qrCode) {
        TicketResponseDTO ticket = ticketService.checkIn(qrCode);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/qrcode")
    @Operation(summary = "Download ticket QR code image", description = "Generates and returns ticket PNG QR code image")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "QR code PNG image stream"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<byte[]> getTicketQrCode(
            @Parameter(description = "Ticket ID") @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] qrCode = ticketService.generateTicketQrCode(id, userDetails != null ? userDetails.getUser() : null);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(qrCode, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download individual ticket PDF pass", description = "Generates a printable PDF ticket pass for the given ticket ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF ticket pass stream"),
            @ApiResponse(responseCode = "404", description = "Ticket not found")
    })
    public ResponseEntity<byte[]> downloadTicketPdf(
            @Parameter(description = "Ticket ID") @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] pdf = ticketService.generateTicketPdf(id, userDetails != null ? userDetails.getUser() : null);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ticket-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/booking/{bookingId}/pdf")
    @Operation(summary = "Download unified booking summary PDF pass", description = "Generates a complete PDF document containing all passes for a booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF booking summary stream"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<byte[]> downloadBookingPdf(
            @Parameter(description = "Booking ID") @PathVariable Long bookingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        byte[] pdf = ticketService.generateBookingPdf(bookingId, userDetails != null ? userDetails.getUser() : null);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "booking-" + bookingId + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
