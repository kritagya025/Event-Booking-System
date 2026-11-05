package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Ticket;
import com.kritagya.event_booking_system.enums.TicketStatus;
import com.kritagya.event_booking_system.exception.BookingNotFoundException;
import com.kritagya.event_booking_system.exception.ResourceNotFoundException;
import com.kritagya.event_booking_system.mapper.TicketMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final QrCodeService qrCodeService;

    public TicketService(TicketRepository ticketRepository, BookingRepository bookingRepository,
            QrCodeService qrCodeService) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public List<TicketResponseDTO> generateTickets(Long bookingId) {
        return generateTickets(bookingId, null);
    }

    @Transactional
    public List<TicketResponseDTO> generateTickets(Long bookingId, com.kritagya.event_booking_system.entity.User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (currentUser != null && !booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to generate tickets for this booking.");
        }

        // Prevent duplicate ticket generation
        List<Ticket> existingTickets = ticketRepository.findByBookingId(bookingId);
        if (!existingTickets.isEmpty()) {
            log.info("Tickets already exist for booking ID: {}, returning {} existing tickets", bookingId, existingTickets.size());
            return existingTickets.stream()
                    .map(TicketMapper::toDTO)
                    .collect(Collectors.toList());
        }

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < booking.getQuantity(); i++) {
            String ticketCode = "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Ticket ticket = new Ticket(
                    ticketCode,
                    LocalDateTime.now(),
                    TicketStatus.ACTIVE,
                    booking);
            tickets.add(ticket);
        }

        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        log.info("Generated {} tickets for booking ID: {}", savedTickets.size(), bookingId);
        return savedTickets.stream()
                .map(TicketMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByBooking(Long bookingId) {
        return getTicketsByBooking(bookingId, null);
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByBooking(Long bookingId, com.kritagya.event_booking_system.entity.User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (currentUser != null && !booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view tickets for this booking.");
        }

        return ticketRepository.findByBookingId(bookingId)
                .stream()
                .map(TicketMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicket(Long id) {
        return getTicket(id, null);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicket(Long id, com.kritagya.event_booking_system.entity.User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (currentUser != null && !ticket.getBooking().getUser().getId().equals(currentUser.getId()) 
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN 
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ORGANIZER) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view this ticket.");
        }

        return TicketMapper.toDTO(ticket);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO validateTicket(String qrCode) {
        log.debug("Validating ticket with QR code: {}", qrCode);
        Ticket ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with QR code: " + qrCode));

        if (ticket.getTicketStatus() == TicketStatus.USED) {
            throw new IllegalArgumentException("Ticket has already been used");
        }
        if (ticket.getTicketStatus() == TicketStatus.CANCELLED) {
            throw new IllegalArgumentException("Ticket has been cancelled");
        }

        return TicketMapper.toDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO checkIn(String qrCode) {
        Ticket ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with QR code: " + qrCode));

        if (ticket.getTicketStatus() == TicketStatus.USED) {
            log.warn("Ticket check-in rejected - already used. QR code: {}", qrCode);
            throw new IllegalArgumentException("Ticket has already been used for check-in");
        }
        if (ticket.getTicketStatus() == TicketStatus.CANCELLED) {
            log.warn("Ticket check-in rejected - cancelled. QR code: {}", qrCode);
            throw new IllegalArgumentException("Cannot check in a cancelled ticket");
        }

        ticket.setTicketStatus(TicketStatus.USED);
        ticket.setCheckInTime(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket checked in successfully. QR code: {}, Booking ID: {}", qrCode, ticket.getBooking().getId());
        return TicketMapper.toDTO(savedTicket);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO validateTicketById(Long ticketId) {
        log.debug("Validating ticket by ID: {}", ticketId);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (ticket.getTicketStatus() == TicketStatus.USED) {
            log.warn("Ticket validation rejected - already used. Ticket ID: {}", ticketId);
            throw new IllegalArgumentException("Ticket has already been used");
        }
        if (ticket.getTicketStatus() == TicketStatus.CANCELLED) {
            log.warn("Ticket validation rejected - cancelled. Ticket ID: {}", ticketId);
            throw new IllegalArgumentException("Ticket has been cancelled");
        }

        return TicketMapper.toDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO checkInById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (ticket.getTicketStatus() == TicketStatus.USED) {
            log.warn("Ticket check-in rejected - already used. Ticket ID: {}", ticketId);
            throw new IllegalArgumentException("Ticket has already been used for check-in");
        }
        if (ticket.getTicketStatus() == TicketStatus.CANCELLED) {
            log.warn("Ticket check-in rejected - cancelled. Ticket ID: {}", ticketId);
            throw new IllegalArgumentException("Cannot check in a cancelled ticket");
        }

        ticket.setTicketStatus(TicketStatus.USED);
        ticket.setCheckInTime(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket checked in successfully. Ticket ID: {}, Booking ID: {}", ticketId, ticket.getBooking().getId());
        return TicketMapper.toDTO(savedTicket);
    }

    public byte[] generateTicketQrCode(Long ticketId) {
        return generateTicketQrCode(ticketId, null);
    }

    public byte[] generateTicketQrCode(Long ticketId, com.kritagya.event_booking_system.entity.User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser != null && !ticket.getBooking().getUser().getId().equals(currentUser.getId())
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ORGANIZER) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to view QR code for this ticket.");
        }

        return qrCodeService.generateQrCodeImage(ticket.getQrCode());
    }

    public byte[] generateTicketPdf(Long ticketId) {
        return generateTicketPdf(ticketId, null);
    }

    public byte[] generateTicketPdf(Long ticketId, com.kritagya.event_booking_system.entity.User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (currentUser != null && !ticket.getBooking().getUser().getId().equals(currentUser.getId())
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to download PDF for this ticket.");
        }

        if (ticket.getTicketStatus() == TicketStatus.CANCELLED || ticket.getBooking().getBookingStatus() == com.kritagya.event_booking_system.enums.BookingStatus.CANCELLED) {
            log.warn("PDF generation rejected - ticket or booking cancelled. Ticket ID: {}", ticketId);
            throw new IllegalStateException("Cannot download PDF for a cancelled ticket");
        }

        Booking booking = ticket.getBooking();
        Event event = booking.getEvent();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Create PDF using iText
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(baos);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf);

            // Title
            document.add(new com.itextpdf.layout.element.Paragraph("EVENT TICKET")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Event details
            document.add(new com.itextpdf.layout.element.Paragraph("Event: " + event.getName())
                    .setFontSize(16).setBold());
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Date: " + event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Time: " + event.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
                            + " - " + event.getEndTime().format(DateTimeFormatter.ofPattern("hh:mm a"))));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Venue: " + event.getVenue().getName()));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Address: " + event.getVenue().getAddress()));

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Ticket details
            document.add(new com.itextpdf.layout.element.Paragraph("Ticket Code: " + ticket.getQrCode())
                    .setFontSize(14).setBold());
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Status: " + ticket.getTicketStatus().name()));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Issued: " + ticket.getIssueDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"))));

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Booking info
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Booked by: " + booking.getUser().getFirstName() + " " + booking.getUser().getLastName()));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Booking ID: " + booking.getId()));

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // QR Code image
            byte[] qrCodeBytes = qrCodeService.generateQrCodeImage(ticket.getQrCode());
            com.itextpdf.io.image.ImageData imageData = com.itextpdf.io.image.ImageDataFactory.create(qrCodeBytes);
            com.itextpdf.layout.element.Image qrImage = new com.itextpdf.layout.element.Image(imageData);
            qrImage.setWidth(150);
            qrImage.setHeight(150);
            qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
            document.add(qrImage);

            document.add(new com.itextpdf.layout.element.Paragraph("Scan this QR code at the venue entrance")
                    .setFontSize(10)
                    .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

            document.close();
            log.info("Generated PDF for ticket ID: {}", ticketId);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate ticket PDF for ticket ID: {}", ticketId, e);
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }
    }

    public byte[] generateBookingPdf(Long bookingId) {
        return generateBookingPdf(bookingId, null);
    }

    public byte[] generateBookingPdf(Long bookingId, com.kritagya.event_booking_system.entity.User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (currentUser != null && !booking.getUser().getId().equals(currentUser.getId())
                && currentUser.getRole() != com.kritagya.event_booking_system.enums.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: You are not authorized to download PDF for this booking.");
        }

        if (booking.getBookingStatus() == com.kritagya.event_booking_system.enums.BookingStatus.CANCELLED) {
            log.warn("PDF generation rejected - booking cancelled. Booking ID: {}", bookingId);
            throw new IllegalStateException("Cannot generate PDF for a cancelled booking");
        }

        List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
        if (tickets.isEmpty()) {
            generateTickets(bookingId);
            tickets = ticketRepository.findByBookingId(bookingId);
        }

        Event event = booking.getEvent();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(baos);
            com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf);

            document.add(new com.itextpdf.layout.element.Paragraph("EVENT BOOKING CONFIRMATION & TICKETS")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            document.add(new com.itextpdf.layout.element.Paragraph("Event: " + event.getName())
                    .setFontSize(14).setBold());
            if (event.getEventDate() != null) {
                document.add(new com.itextpdf.layout.element.Paragraph(
                        "Date: " + event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))));
            }
            if (event.getStartTime() != null && event.getEndTime() != null) {
                document.add(new com.itextpdf.layout.element.Paragraph(
                        "Time: " + event.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
                                + " - " + event.getEndTime().format(DateTimeFormatter.ofPattern("hh:mm a"))));
            }
            if (event.getVenue() != null) {
                document.add(new com.itextpdf.layout.element.Paragraph(
                        "Venue: " + event.getVenue().getName() + " (" + event.getVenue().getAddress() + ")"));
            }

            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Customer: " + booking.getUser().getFirstName() + " " + booking.getUser().getLastName()
                            + " (" + booking.getUser().getEmail() + ")"));
            document.add(new com.itextpdf.layout.element.Paragraph(
                    "Booking ID: #" + booking.getId() + " | Status: " + booking.getBookingStatus()
                            + " | Total Amount: $" + booking.getTotalAmount()));

            document.add(new com.itextpdf.layout.element.Paragraph("\n--- TICKETS ---").setFontSize(12).setBold());

            for (int i = 0; i < tickets.size(); i++) {
                Ticket t = tickets.get(i);
                if (t.getTicketStatus() == TicketStatus.CANCELLED) {
                    continue;
                }
                document.add(new com.itextpdf.layout.element.Paragraph(
                        "Ticket #" + (i + 1) + " | Code: " + t.getQrCode() + " | Status: " + t.getTicketStatus())
                        .setFontSize(11).setBold());

                if (booking.getSeats() != null && i < booking.getSeats().size()) {
                    com.kritagya.event_booking_system.entity.Seat seat = booking.getSeats().get(i);
                    document.add(new com.itextpdf.layout.element.Paragraph(
                            "Seat: " + seat.getSeatNumber() + " (" + seat.getSeatType() + ")"));
                }

                byte[] qrCodeBytes = qrCodeService.generateQrCodeImage(t.getQrCode());
                com.itextpdf.io.image.ImageData imageData = com.itextpdf.io.image.ImageDataFactory.create(qrCodeBytes);
                com.itextpdf.layout.element.Image qrImage = new com.itextpdf.layout.element.Image(imageData);
                qrImage.setWidth(120);
                qrImage.setHeight(120);
                qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
                document.add(qrImage);
                document.add(new com.itextpdf.layout.element.Paragraph("\n"));
            }

            document.close();
            log.info("Generated booking PDF for booking ID: {} with {} tickets", bookingId, tickets.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate booking PDF for booking ID: {}", bookingId, e);
            throw new RuntimeException("Failed to generate booking PDF", e);
        }
    }
}
