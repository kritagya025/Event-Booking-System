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

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.DashedLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.DashedBorder;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

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

    // Neo-Brutalist PDF Color Palette
    private static final DeviceRgb COLOR_ASPHALT_BG = new DeviceRgb(14, 14, 17);
    private static final DeviceRgb COLOR_ASPHALT_CARD = new DeviceRgb(22, 22, 28);
    private static final DeviceRgb COLOR_ASPHALT_INNER = new DeviceRgb(28, 28, 36);
    private static final DeviceRgb COLOR_ACID_YELLOW = new DeviceRgb(226, 241, 60);
    private static final DeviceRgb COLOR_NEON_MAGENTA = new DeviceRgb(255, 31, 109);
    private static final DeviceRgb COLOR_GRIT_WHITE = new DeviceRgb(245, 245, 240);
    private static final DeviceRgb COLOR_GRIT_DIM = new DeviceRgb(144, 146, 158);
    private static final DeviceRgb COLOR_BORDER = new DeviceRgb(55, 65, 81);

    private void renderBrutalistTicketPass(Document document, Ticket ticket, Booking booking, Event event,
                                           com.kritagya.event_booking_system.entity.Seat seat,
                                           int ticketIndex, int totalTickets) throws Exception {
        // Outer Container Card Table
        Table passBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_ASPHALT_CARD)
                .setBorder(new SolidBorder(COLOR_GRIT_WHITE, 2f))
                .setMarginBottom(16f);

        // 1. Top Hazard Tape Banner
        Table hazardTop = new Table(UnitValue.createPercentArray(new float[]{
                8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.33f, 8.37f
        })).useAllAvailableWidth();
        for (int h = 0; h < 12; h++) {
            Cell c = new Cell().setHeight(5f).setBorder(Border.NO_BORDER)
                    .setBackgroundColor(h % 2 == 0 ? COLOR_ACID_YELLOW : COLOR_ASPHALT_BG);
            hazardTop.addCell(c);
        }
        passBox.addCell(new Cell().add(hazardTop).setPadding(0).setBorder(Border.NO_BORDER));

        // 2. Brand Header Block
        Table brandHeader = new Table(UnitValue.createPercentArray(new float[]{65, 35}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setPadding(6f);

        Paragraph brandP = new Paragraph()
                .add(new Text("EVENTHUB ").setFontSize(16).setBold().setFontColor(COLOR_GRIT_WHITE))
                .add(new Text(" VIP PASS ").setFontSize(8).setBold().setBackgroundColor(COLOR_ACID_YELLOW).setFontColor(COLOR_ASPHALT_BG))
                .setMargin(0);
        Paragraph subBrand = new Paragraph("AUTHENTICATED ADMISSION GATEWAY // REVENUE PASS")
                .setFontSize(7).setFontColor(COLOR_GRIT_DIM).setMarginTop(1f).setMarginBottom(0);

        brandHeader.addCell(new Cell().add(brandP).add(subBrand).setBorder(Border.NO_BORDER).setPadding(4f));

        String serialCode = "EHB-" + (event.getId() != null ? event.getId() : "2026") + "-" + ticket.getId();
        Paragraph seasonP = new Paragraph()
                .add(new Text(" SEASON 2026 // ALL-ACCESS ").setFontSize(7.5f).setBold().setBackgroundColor(COLOR_NEON_MAGENTA).setFontColor(COLOR_GRIT_WHITE))
                .setTextAlignment(TextAlignment.RIGHT).setMargin(0);
        Paragraph serialP = new Paragraph(serialCode)
                .setFontSize(8.5f).setBold().setFontColor(COLOR_ACID_YELLOW).setTextAlignment(TextAlignment.RIGHT).setMarginTop(2f).setMarginBottom(0);

        brandHeader.addCell(new Cell().add(seasonP).add(serialP).setBorder(Border.NO_BORDER).setPadding(4f));
        passBox.addCell(new Cell().add(brandHeader).setBorder(Border.NO_BORDER).setPadding(2f));

        // 3. Event Hero Banner Box
        Table eventBanner = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_ASPHALT_INNER)
                .setBorder(new SolidBorder(COLOR_BORDER, 1f))
                .setMarginLeft(6f).setMarginRight(6f).setMarginBottom(5f);

        Paragraph eventTitle = new Paragraph(event.getName().toUpperCase())
                .setFontSize(13).setBold().setFontColor(COLOR_GRIT_WHITE).setMargin(3f);
        eventBanner.addCell(new Cell().add(eventTitle).setBorder(Border.NO_BORDER));

        Table metaRow = new Table(UnitValue.createPercentArray(new float[]{35, 38, 27}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setPadding(3f);

        String dateStr = event.getEventDate() != null ? event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) : "SEASON 2026";
        String timeStr = (event.getStartTime() != null ? event.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "TBD");
        Paragraph dateP = new Paragraph()
                .add(new Text("DATE & SHOWTIME:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text(dateStr + " @ " + timeStr).setFontSize(8.5f).setBold().setFontColor(COLOR_ACID_YELLOW));
        metaRow.addCell(new Cell().add(dateP).setBorder(Border.NO_BORDER));

        String venueName = event.getVenue() != null ? event.getVenue().getName() : "MAIN ARENA";
        String venueAddr = event.getVenue() != null && event.getVenue().getAddress() != null ? event.getVenue().getAddress() : "CENTRAL SECTOR";
        Paragraph venueP = new Paragraph()
                .add(new Text("VENUE / AUDITORIUM:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text(venueName + "\n" + venueAddr).setFontSize(7.5f).setFontColor(COLOR_GRIT_WHITE));
        metaRow.addCell(new Cell().add(venueP).setBorder(Border.NO_BORDER));

        String seatTypeStr = seat != null && seat.getSeatType() != null ? seat.getSeatType().name() : "GENERAL";
        Paragraph tierP = new Paragraph()
                .add(new Text("CLEARANCE SECTOR:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text("TIER: " + seatTypeStr + " // GATE 01").setFontSize(7.5f).setBold().setFontColor(COLOR_GRIT_WHITE));
        metaRow.addCell(new Cell().add(tierP).setBorder(Border.NO_BORDER));

        eventBanner.addCell(new Cell().add(metaRow).setBorder(Border.NO_BORDER));
        passBox.addCell(new Cell().add(eventBanner).setBorder(Border.NO_BORDER).setPadding(2f));

        // 4. Core Split: Attendee Details & QR Optical Gate Stub
        Table coreTable = new Table(UnitValue.createPercentArray(new float[]{65, 35}))
                .useAllAvailableWidth()
                .setMarginLeft(6f).setMarginRight(6f).setMarginBottom(5f)
                .setBorder(Border.NO_BORDER);

        // Left Container
        Table leftInfo = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_ASPHALT_INNER)
                .setBorder(new SolidBorder(COLOR_BORDER, 1f))
                .setPadding(5f);

        String attendeeName = (booking.getUser().getFirstName() + " " + booking.getUser().getLastName()).toUpperCase();
        Paragraph holderP = new Paragraph()
                .add(new Text("ACCREDITED HOLDER:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text(attendeeName + "\n").setFontSize(10.5f).setBold().setFontColor(COLOR_GRIT_WHITE))
                .add(new Text(booking.getUser().getEmail().toUpperCase()).setFontSize(7f).setFontColor(COLOR_GRIT_DIM))
                .setMargin(2f);
        leftInfo.addCell(new Cell().add(holderP).setBorder(Border.NO_BORDER));

        // Seat Allocation & Status Row
        Table seatTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setMarginTop(3f);

        String seatNum = seat != null ? seat.getSeatNumber() : "GA-" + (ticketIndex + 1);
        Paragraph seatP = new Paragraph()
                .add(new Text("SEAT ALLOCATION:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text(seatNum).setFontSize(12f).setBold().setFontColor(COLOR_ACID_YELLOW));
        seatTable.addCell(new Cell().add(seatP).setBorder(Border.NO_BORDER));

        Paragraph statusP = new Paragraph()
                .add(new Text("ADMISSION STATUS:\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                .add(new Text(ticket.getTicketStatus().name() + " // VERIFIED").setFontSize(8.5f).setBold().setFontColor(COLOR_GRIT_WHITE));
        seatTable.addCell(new Cell().add(statusP).setBorder(Border.NO_BORDER));

        leftInfo.addCell(new Cell().add(seatTable).setBorder(Border.NO_BORDER));

        // Guarantees Ribbon
        Paragraph guarP = new Paragraph("⚡ 10-MIN CART LOCK   🛡️ ZERO OVERBOOKING   🎟️ OFFLINE GATE VERIFIED")
                .setFontSize(6f).setFontColor(COLOR_ACID_YELLOW).setMarginTop(3f).setMarginBottom(1f);
        leftInfo.addCell(new Cell().add(guarP).setBorder(Border.NO_BORDER));

        coreTable.addCell(new Cell().add(leftInfo).setBorder(Border.NO_BORDER).setPaddingRight(4f));

        // Right QR Optical Gate Stub
        Table rightStub = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(ColorConstants.WHITE)
                .setBorder(new SolidBorder(COLOR_GRIT_WHITE, 1.5f))
                .setPadding(3f);

        byte[] qrBytes = qrCodeService.generateQrCodeImage(ticket.getQrCode());
        ImageData imgData = ImageDataFactory.create(qrBytes);
        Image qrImg = new Image(imgData).setWidth(75).setHeight(75).setHorizontalAlignment(HorizontalAlignment.CENTER);

        rightStub.addCell(new Cell().add(qrImg).setBorder(Border.NO_BORDER).setPadding(1f));

        Paragraph stubLabel = new Paragraph("OPTICAL GATE TOKEN")
                .setFontSize(6.5f).setBold().setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        Paragraph stubCode = new Paragraph(ticket.getQrCode().length() > 22 ? ticket.getQrCode().substring(0, 22) + "..." : ticket.getQrCode())
                .setFontSize(5.5f).setFontColor(ColorConstants.DARK_GRAY).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        Paragraph stubBarcode = new Paragraph("|| | ||| | || |||| | ||| | || | ||||")
                .setFontSize(7f).setBold().setFontColor(ColorConstants.BLACK).setTextAlignment(TextAlignment.CENTER).setMargin(1f);

        rightStub.addCell(new Cell().add(stubLabel).add(stubCode).add(stubBarcode).setBorder(Border.NO_BORDER).setPadding(1f));
        coreTable.addCell(new Cell().add(rightStub).setBorder(Border.NO_BORDER).setPaddingLeft(4f));

        passBox.addCell(new Cell().add(coreTable).setBorder(Border.NO_BORDER).setPadding(2f));

        // 5. Perforation Tear Line
        Paragraph perfP = new Paragraph("✂  - - - - - - - - - - - - - - DETACH AT GATE TURNSTILE FOR PHYSICAL SCAN - - - - - - - - - - - - - -  ✂")
                .setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginTop(2f).setMarginBottom(2f);
        passBox.addCell(new Cell().add(perfP).setBorder(Border.NO_BORDER));

        // 6. Security Microprint Footer
        Paragraph microP = new Paragraph("EVENTHUB INFRASTRUCTURE // SECURE SHA-256 DIGITAL GATE CREDENTIAL // NON-TRANSFERABLE PASS // EHB-2026")
                .setFontSize(5.5f).setFontColor(COLOR_GRIT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginBottom(3f);
        passBox.addCell(new Cell().add(microP).setBorder(Border.NO_BORDER));

        // 7. Bottom Hazard Tape
        passBox.addCell(new Cell().add(hazardTop).setPadding(0).setBorder(Border.NO_BORDER));

        document.add(passBox);
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
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);
            document.setMargins(24f, 24f, 24f, 24f);

            com.kritagya.event_booking_system.entity.Seat seat = null;
            if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
                seat = booking.getSeats().get(0);
            }

            renderBrutalistTicketPass(document, ticket, booking, event, seat, 0, 1);

            document.close();
            log.info("Generated high-fidelity brutalist PDF pass for ticket ID: {}", ticketId);
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
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);
            document.setMargins(20f, 20f, 20f, 20f);

            // Executive Booking Summary Header Table
            Table summaryBox = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(COLOR_ASPHALT_BG)
                    .setBorder(new SolidBorder(COLOR_ACID_YELLOW, 2f))
                    .setPadding(6f)
                    .setMarginBottom(12f);

            Paragraph sumTitle = new Paragraph()
                    .add(new Text("EVENTHUB BOOKING CONFIRMATION\n").setFontSize(12).setBold().setFontColor(COLOR_ACID_YELLOW))
                    .add(new Text("ORDER #EHB-" + booking.getId() + " • " + (booking.getUser().getFirstName() + " " + booking.getUser().getLastName()).toUpperCase()).setFontSize(8.5f).setFontColor(COLOR_GRIT_WHITE));
            summaryBox.addCell(new Cell().add(sumTitle).setBorder(Border.NO_BORDER).setPadding(3f));

            String totalPaid = booking.getTotalAmount() != null ? "$" + booking.getTotalAmount() : "$0.00";
            Paragraph sumRight = new Paragraph()
                    .add(new Text("TOTAL CONFIRMED ADMISSION\n").setFontSize(6.5f).setFontColor(COLOR_GRIT_DIM))
                    .add(new Text(tickets.size() + " PASSES ISSUED • " + totalPaid).setFontSize(9.5f).setBold().setFontColor(COLOR_GRIT_WHITE))
                    .setTextAlignment(TextAlignment.RIGHT);
            summaryBox.addCell(new Cell().add(sumRight).setBorder(Border.NO_BORDER).setPadding(3f));

            document.add(summaryBox);

            // Render each ticket pass
            for (int i = 0; i < tickets.size(); i++) {
                Ticket t = tickets.get(i);
                if (t.getTicketStatus() == TicketStatus.CANCELLED) {
                    continue;
                }
                com.kritagya.event_booking_system.entity.Seat seat = null;
                if (booking.getSeats() != null && i < booking.getSeats().size()) {
                    seat = booking.getSeats().get(i);
                }
                renderBrutalistTicketPass(document, t, booking, event, seat, i, tickets.size());
            }

            document.close();
            log.info("Generated high-fidelity brutalist booking PDF for booking ID: {} with {} tickets", bookingId, tickets.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate booking PDF for booking ID: {}", bookingId, e);
            throw new RuntimeException("Failed to generate booking PDF", e);
        }
    }
}
