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
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.AreaBreakType;
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

    // High-Vibrancy Neo-Brutalist Color Palette
    private static final DeviceRgb COLOR_OBSIDIAN_BG = new DeviceRgb(10, 10, 14);     // #0A0A0E Deep Jet Black
    private static final DeviceRgb COLOR_MIDNIGHT_CARD = new DeviceRgb(18, 20, 32);   // #121420 Deep Midnight Navy
    private static final DeviceRgb COLOR_SLATE_CONTAINER = new DeviceRgb(26, 30, 46); // #1A1E2E Slate Container
    private static final DeviceRgb COLOR_ACID_YELLOW = new DeviceRgb(254, 240, 42);   // #FEF02A Electric Acid Yellow
    private static final DeviceRgb COLOR_ELECTRIC_CYAN = new DeviceRgb(0, 240, 255);  // #00F0FF Laser Cyber Cyan
    private static final DeviceRgb COLOR_NEON_MAGENTA = new DeviceRgb(255, 0, 110);   // #FF006E Hot Neon Magenta
    private static final DeviceRgb COLOR_SUNSET_ORANGE = new DeviceRgb(255, 107, 0);  // #FF6B00 Sunset Orange
    private static final DeviceRgb COLOR_EMERALD_GREEN = new DeviceRgb(16, 230, 140); // #10E68C Laser Gate Emerald
    private static final DeviceRgb COLOR_PURE_WHITE = new DeviceRgb(255, 255, 255);   // #FFFFFF Crisp White
    private static final DeviceRgb COLOR_CRISP_SNOW = new DeviceRgb(248, 250, 252);   // #F8FAFC Inverted Stub White
    private static final DeviceRgb COLOR_TEXT_DIM = new DeviceRgb(148, 163, 184);     // #94A3B8 Slate Text
    private static final DeviceRgb COLOR_BORDER_CYAN = new DeviceRgb(0, 240, 255);    // #00F0FF
    private static final DeviceRgb COLOR_BORDER_MUTED = new DeviceRgb(51, 65, 85);    // #334155

    private static class PageBackgroundHandler implements com.itextpdf.kernel.events.IEventHandler {
        @Override
        public void handleEvent(com.itextpdf.kernel.events.Event event) {
            com.itextpdf.kernel.events.PdfDocumentEvent docEvent = (com.itextpdf.kernel.events.PdfDocumentEvent) event;
            com.itextpdf.kernel.pdf.PdfPage page = docEvent.getPage();
            com.itextpdf.kernel.pdf.canvas.PdfCanvas canvas = new com.itextpdf.kernel.pdf.canvas.PdfCanvas(
                    page.newContentStreamBefore(), page.getResources(), docEvent.getDocument());
            com.itextpdf.kernel.geom.Rectangle area = page.getPageSize();
            canvas.saveState()
                    .setFillColor(COLOR_OBSIDIAN_BG)
                    .rectangle(area.getLeft(), area.getBottom(), area.getWidth(), area.getHeight())
                    .fill()
                    .restoreState();
        }
    }

    private Table createHazardTape(float height) {
        Table hazard = new Table(UnitValue.createPercentArray(new float[]{
                4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f,
                4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f,
                4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.16f, 4.32f
        })).useAllAvailableWidth();
        for (int h = 0; h < 24; h++) {
            DeviceRgb color;
            if (h % 4 == 0) {
                color = COLOR_ACID_YELLOW;
            } else if (h % 4 == 1) {
                color = COLOR_OBSIDIAN_BG;
            } else if (h % 4 == 2) {
                color = COLOR_NEON_MAGENTA;
            } else {
                color = COLOR_OBSIDIAN_BG;
            }
            Cell c = new Cell().setHeight(height).setBorder(Border.NO_BORDER).setBackgroundColor(color);
            hazard.addCell(c);
        }
        return hazard;
    }

    private Table createExecutiveHeader(Booking booking, Event event, int totalTickets) {
        Table header = new Table(UnitValue.createPercentArray(new float[]{62, 38}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_MIDNIGHT_CARD)
                .setBorder(new SolidBorder(COLOR_ELECTRIC_CYAN, 2f))
                .setPadding(6f)
                .setMarginBottom(8f);

        Paragraph leftP = new Paragraph()
                .add(new Text("EVENTHUB ").setFontSize(13).setBold().setFontColor(COLOR_PURE_WHITE))
                .add(new Text(" VIP PASS NETWORK ").setFontSize(7.5f).setBold().setBackgroundColor(COLOR_ACID_YELLOW).setFontColor(COLOR_OBSIDIAN_BG))
                .add(new Text(" VERIFIED ").setFontSize(7f).setBold().setBackgroundColor(COLOR_EMERALD_GREEN).setFontColor(COLOR_OBSIDIAN_BG))
                .add(new Text("\nORDER NO: #EHB-" + booking.getId() + "  |  ISSUED: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) + "  |  OFFICIAL PASS").setFontSize(6.5f).setFontColor(COLOR_TEXT_DIM))
                .setMargin(0);
        header.addCell(new Cell().add(leftP).setBorder(Border.NO_BORDER).setPadding(4f));

        String totalPaid = booking.getTotalAmount() != null ? "$" + booking.getTotalAmount() : "$0.00";
        Paragraph rightP = new Paragraph()
                .add(new Text("CONFIRMED CLEARANCE\n").setFontSize(6.5f).setFontColor(COLOR_ELECTRIC_CYAN))
                .add(new Text(totalTickets + (totalTickets > 1 ? " PASSES ISSUED" : " PASS ISSUED") + "  |  " + totalPaid).setFontSize(9.5f).setBold().setFontColor(COLOR_ACID_YELLOW))
                .setTextAlignment(TextAlignment.RIGHT).setMargin(0);
        header.addCell(new Cell().add(rightP).setBorder(Border.NO_BORDER).setPadding(4f));

        return header;
    }

    private Table createGateProtocolBox() {
        Table protocolBox = new Table(UnitValue.createPercentArray(new float[]{34, 33, 33}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_MIDNIGHT_CARD)
                .setBorder(new SolidBorder(COLOR_BORDER_MUTED, 1.5f))
                .setPadding(6f)
                .setMarginTop(8f)
                .setMarginBottom(4f);

        // Column 1: Gate Entry Protocol (Electric Cyan Theme)
        Cell c1 = new Cell().setBorder(Border.NO_BORDER).setBorderTop(new SolidBorder(COLOR_ELECTRIC_CYAN, 3f)).setPadding(5f);
        c1.add(new Paragraph("01 // TURNSTILE ENTRY")
                .setFontSize(8f).setBold().setFontColor(COLOR_ELECTRIC_CYAN).setMarginBottom(3f));
        c1.add(new Paragraph("[>] Present this physical pass or display on mobile screen at 100% brightness.\n[>] Align optical QR code or 1D barcode with gate scanner.\n[>] Walk through turnstile when indicator turns GREEN.")
                .setFontSize(6.5f).setFontColor(COLOR_PURE_WHITE).setMultipliedLeading(1.25f));
        protocolBox.addCell(c1);

        // Column 2: Admission & Identity Rules (Neon Magenta Theme)
        Cell c2 = new Cell().setBorder(new DashedBorder(COLOR_BORDER_MUTED, 1f)).setBorderTop(new SolidBorder(COLOR_NEON_MAGENTA, 3f)).setBorderBottom(Border.NO_BORDER).setPadding(5f);
        c2.add(new Paragraph("02 // ADMISSION POLICY")
                .setFontSize(8f).setBold().setFontColor(COLOR_NEON_MAGENTA).setMarginBottom(3f));
        c2.add(new Paragraph("[*] Government-issued photo ID required matching accredited attendee name.\n[*] Single-entry pass. Duplicate scans trigger automatic security lockout.\n[*] Issued wristbands must remain intact for re-entry.")
                .setFontSize(6.5f).setFontColor(COLOR_PURE_WHITE).setMultipliedLeading(1.25f));
        protocolBox.addCell(c2);

        // Column 3: Zero Overbooking & Support (Laser Emerald Theme)
        Cell c3 = new Cell().setBorder(Border.NO_BORDER).setBorderTop(new SolidBorder(COLOR_EMERALD_GREEN, 3f)).setPadding(5f);
        c3.add(new Paragraph("03 // ZERO OVERBOOKING")
                .setFontSize(8f).setBold().setFontColor(COLOR_EMERALD_GREEN).setMarginBottom(3f));
        c3.add(new Paragraph("[#] Distributed real-time inventory locking eliminates double-booking.\n[#] Cryptographically signed gate token with SHA-256 verification.\n[#] On-site Gate Dispatch: support@eventhub.live")
                .setFontSize(6.5f).setFontColor(COLOR_PURE_WHITE).setMultipliedLeading(1.25f));
        protocolBox.addCell(c3);

        return protocolBox;
    }

    private byte[] loadEventImageBytes(Event event) {
        if (event != null && event.getBannerImageUrl() != null && !event.getBannerImageUrl().isBlank()) {
            String url = event.getBannerImageUrl().trim();
            try {
                if (url.startsWith("/") || url.contains(":\\") || url.startsWith("uploads") || url.startsWith("frontend")) {
                    java.io.File file = new java.io.File(url);
                    if (file.exists() && file.canRead()) {
                        return java.nio.file.Files.readAllBytes(file.toPath());
                    }
                }
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    try (java.io.InputStream in = new java.net.URL(url).openStream()) {
                        return in.readAllBytes();
                    }
                }
            } catch (Exception e) {
                log.debug("Could not load custom event banner from {}: {}", url, e.getMessage());
            }
        }

        String resourcePath = "/images/concert.jpg";
        if (event != null && event.getCategory() != null) {
            String cat = event.getCategory().toUpperCase();
            if (cat.contains("TECH") || cat.contains("CONFERENCE") || cat.contains("SUMMIT") || cat.contains("WORKSHOP")) {
                resourcePath = "/images/tech.jpg";
            }
        }

        try (java.io.InputStream in = getClass().getResourceAsStream(resourcePath)) {
            if (in != null) {
                return in.readAllBytes();
            }
        } catch (Exception e) {
            log.debug("Could not load classpath image {}: {}", resourcePath, e.getMessage());
        }

        try {
            java.io.File fallback = new java.io.File("frontend/public/images/concert.jpg");
            if (fallback.exists()) {
                return java.nio.file.Files.readAllBytes(fallback.toPath());
            }
        } catch (Exception ignored) {}

        return null;
    }

    private void renderBrutalistTicketPass(Document document, Ticket ticket, Booking booking, Event event,
                                           com.kritagya.event_booking_system.entity.Seat seat,
                                           int ticketIndex, int totalTickets) throws Exception {
        String serialCode = "EHB-" + (event.getId() != null ? event.getId() : "2026") + "-" + ticket.getId();
        String attendeeName = (booking.getUser().getFirstName() + " " + booking.getUser().getLastName()).toUpperCase();
        String seatNum = seat != null ? seat.getSeatNumber() : "GA-" + (ticketIndex + 1);
        String seatTypeStr = seat != null && seat.getSeatType() != null ? seat.getSeatType().name() : "GENERAL";
        String dateStr = event.getEventDate() != null ? event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")).toUpperCase() : "SEASON 2026";
        String timeStr = (event.getStartTime() != null ? event.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")) : "TBD");
        String venueName = event.getVenue() != null ? event.getVenue().getName().toUpperCase() : "MAIN ARENA";
        String venueAddr = event.getVenue() != null && event.getVenue().getAddress() != null ? event.getVenue().getAddress().toUpperCase() : "CENTRAL SECTOR";

        // Outer Container Card Table (Electric Cyan & Acid Yellow Dual Framing)
        Table passCard = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_MIDNIGHT_CARD)
                .setBorder(new SolidBorder(COLOR_ACID_YELLOW, 2.5f))
                .setMarginBottom(8f);

        // 1. Top Hazard Warning Tape
        passCard.addCell(new Cell().add(createHazardTape(5.5f)).setPadding(0).setBorder(Border.NO_BORDER));

        // 2. Main 2-Panel Structure: [ Left Main Pass (70%) | Center Perforation (2%) | Right Inverted Gate Stub (28%) ]
        Table twoPanel = new Table(UnitValue.createPercentArray(new float[]{70, 2, 28}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setPadding(0);

        // ==================== LEFT MAIN PASS PANEL ====================
        Cell leftPanel = new Cell().setBorder(Border.NO_BORDER).setPadding(6f);

        // A. Header Row: Brand + Season + Serial
        Table headerRow = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER);

        Paragraph brandP = new Paragraph()
                .add(new Text("EVENTHUB ").setFontSize(14).setBold().setFontColor(COLOR_PURE_WHITE))
                .add(new Text(" VIP PASS ").setFontSize(7.5f).setBold().setBackgroundColor(COLOR_ACID_YELLOW).setFontColor(COLOR_OBSIDIAN_BG))
                .add(new Text(" ALL-ACCESS ").setFontSize(7f).setBold().setBackgroundColor(COLOR_NEON_MAGENTA).setFontColor(COLOR_PURE_WHITE))
                .setMargin(0);
        Paragraph subBrand = new Paragraph("AUTHENTICATED ADMISSION GATEWAY // REVENUE PASS")
                .setFontSize(6.5f).setFontColor(COLOR_TEXT_DIM).setMarginTop(1f).setMarginBottom(0);
        headerRow.addCell(new Cell().add(brandP).add(subBrand).setBorder(Border.NO_BORDER));

        Paragraph serialP = new Paragraph()
                .add(new Text("SERIAL: " + serialCode + "\n").setFontSize(8f).setBold().setFontColor(COLOR_ACID_YELLOW))
                .add(new Text("STATUS: " + ticket.getTicketStatus().name() + " // VERIFIED").setFontSize(6.5f).setFontColor(COLOR_EMERALD_GREEN))
                .setTextAlignment(TextAlignment.RIGHT).setMargin(0);
        headerRow.addCell(new Cell().add(serialP).setBorder(Border.NO_BORDER));
        leftPanel.add(headerRow);

        // B. Full-Color Event Background Artwork Banner
        byte[] bannerBytes = loadEventImageBytes(event);
        if (bannerBytes != null && bannerBytes.length > 0) {
            try {
                ImageData bannerImgData = ImageDataFactory.create(bannerBytes);
                Image bannerImg = new Image(bannerImgData)
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMaxHeight(85f)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);

                Table bannerContainer = new Table(UnitValue.createPercentArray(new float[]{100}))
                        .useAllAvailableWidth()
                        .setBackgroundColor(COLOR_OBSIDIAN_BG)
                        .setBorder(new SolidBorder(COLOR_ELECTRIC_CYAN, 1.5f))
                        .setMarginTop(3f)
                        .setMarginBottom(3f)
                        .setPadding(0);
                bannerContainer.addCell(new Cell().add(bannerImg).setBorder(Border.NO_BORDER).setPadding(0));
                leftPanel.add(bannerContainer);
            } catch (Exception e) {
                log.debug("Event banner image render notice: {}", e.getMessage());
            }
        }

        // Event Hero Box (Rich Slate Container with Electric Cyan Accent Border)
        Table heroBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_SLATE_CONTAINER)
                .setBorder(new SolidBorder(COLOR_BORDER_MUTED, 1f))
                .setBorderLeft(new SolidBorder(COLOR_ELECTRIC_CYAN, 3.5f))
                .setPadding(4f)
                .setMarginBottom(4f);

        Paragraph heroTitle = new Paragraph(event.getName().toUpperCase())
                .setFontSize(14).setBold().setFontColor(COLOR_PURE_WHITE).setMargin(0);
        Paragraph heroCategory = new Paragraph("LIVE ARENA CONCERT // OFFICIAL TOUR // ADMIT ONE")
                .setFontSize(6.5f).setBold().setFontColor(COLOR_ELECTRIC_CYAN).setMarginTop(1f).setMarginBottom(0);
        heroBox.addCell(new Cell().add(heroTitle).add(heroCategory).setBorder(Border.NO_BORDER));
        leftPanel.add(heroBox);

        // C. 3-Column Coordinates Grid with Distinct Color Identifiers
        Table coordsGrid = new Table(UnitValue.createPercentArray(new float[]{34, 34, 32}))
                .useAllAvailableWidth()
                .setBorder(Border.NO_BORDER)
                .setMarginBottom(4f);

        // Box 1: Date & Showtime (Electric Cyan theme)
        Cell dateCell = new Cell()
                .setBackgroundColor(new DeviceRgb(20, 28, 48))
                .setBorder(new SolidBorder(COLOR_ELECTRIC_CYAN, 1.2f))
                .setPadding(3.5f);
        dateCell.add(new Paragraph("DATE & SHOWTIME:").setFontSize(6f).setBold().setFontColor(COLOR_ELECTRIC_CYAN).setMargin(0));
        dateCell.add(new Paragraph(dateStr).setFontSize(8.5f).setBold().setFontColor(COLOR_ACID_YELLOW).setMargin(0));
        dateCell.add(new Paragraph("DOORS: 18:30 // START: " + timeStr).setFontSize(6.5f).setFontColor(COLOR_PURE_WHITE).setMargin(0));
        coordsGrid.addCell(dateCell);

        // Box 2: Venue & Auditorium (Neon Magenta theme)
        Cell venueCell = new Cell()
                .setBackgroundColor(new DeviceRgb(36, 20, 36))
                .setBorder(new SolidBorder(COLOR_NEON_MAGENTA, 1.2f))
                .setPadding(3.5f);
        venueCell.add(new Paragraph("VENUE & AUDITORIUM:").setFontSize(6f).setBold().setFontColor(COLOR_NEON_MAGENTA).setMargin(0));
        venueCell.add(new Paragraph(venueName).setFontSize(8.5f).setBold().setFontColor(COLOR_PURE_WHITE).setMargin(0));
        venueCell.add(new Paragraph(venueAddr).setFontSize(6.5f).setFontColor(COLOR_TEXT_DIM).setMargin(0));
        coordsGrid.addCell(venueCell);

        // Box 3: Clearance Sector (Laser Emerald theme)
        Cell clearCell = new Cell()
                .setBackgroundColor(new DeviceRgb(16, 36, 30))
                .setBorder(new SolidBorder(COLOR_EMERALD_GREEN, 1.2f))
                .setPadding(3.5f);
        clearCell.add(new Paragraph("CLEARANCE SECTOR:").setFontSize(6f).setBold().setFontColor(COLOR_EMERALD_GREEN).setMargin(0));
        clearCell.add(new Paragraph("TIER: " + seatTypeStr).setFontSize(8.5f).setBold().setFontColor(COLOR_ACID_YELLOW).setMargin(0));
        clearCell.add(new Paragraph("GATE 01 // NORTH ENTRY").setFontSize(6.5f).setFontColor(COLOR_ELECTRIC_CYAN).setMargin(0));
        coordsGrid.addCell(clearCell);

        leftPanel.add(coordsGrid);

        // D. Seat Master Banner (Electric Acid Yellow Hero Block with Jet Black Typography)
        Table seatMaster = new Table(UnitValue.createPercentArray(new float[]{65, 35}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_ACID_YELLOW)
                .setBorder(new SolidBorder(COLOR_OBSIDIAN_BG, 2f))
                .setPadding(4f)
                .setMarginBottom(4f);

        Paragraph seatTitleP = new Paragraph()
                .add(new Text("CONFIRMED SEAT ASSIGNMENT\n").setFontSize(6.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG))
                .add(new Text(seatNum).setFontSize(13.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG))
                .setMargin(0);
        seatMaster.addCell(new Cell().add(seatTitleP).setBorder(Border.NO_BORDER));

        Paragraph tierP = new Paragraph()
                .add(new Text("SECTOR TIER\n").setFontSize(6.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG))
                .add(new Text("VIP RESERVED").setFontSize(8.5f).setBold().setBackgroundColor(COLOR_NEON_MAGENTA).setFontColor(COLOR_PURE_WHITE))
                .setTextAlignment(TextAlignment.RIGHT).setMargin(0);
        seatMaster.addCell(new Cell().add(tierP).setBorder(Border.NO_BORDER));
        leftPanel.add(seatMaster);

        // E. Attendee Clearance & Order Reference Row
        Table attendeeRow = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_SLATE_CONTAINER)
                .setBorder(new SolidBorder(COLOR_BORDER_MUTED, 1f))
                .setPadding(3.5f)
                .setMarginBottom(4f);

        Paragraph holderP = new Paragraph()
                .add(new Text("ACCREDITED ATTENDEE:\n").setFontSize(6f).setFontColor(COLOR_TEXT_DIM))
                .add(new Text(attendeeName + "\n").setFontSize(8.5f).setBold().setFontColor(COLOR_PURE_WHITE))
                .add(new Text(booking.getUser().getEmail().toUpperCase()).setFontSize(6.5f).setFontColor(COLOR_ELECTRIC_CYAN))
                .setMargin(0);
        attendeeRow.addCell(new Cell().add(holderP).setBorder(Border.NO_BORDER));

        Paragraph orderRefP = new Paragraph()
                .add(new Text("BOOKING ORDER ID:\n").setFontSize(6f).setFontColor(COLOR_TEXT_DIM))
                .add(new Text("#EHB-" + booking.getId() + "\n").setFontSize(8.5f).setBold().setFontColor(COLOR_ACID_YELLOW))
                .add(new Text("TICKET PASS " + (ticketIndex + 1) + " OF " + totalTickets).setFontSize(6.5f).setFontColor(COLOR_EMERALD_GREEN))
                .setTextAlignment(TextAlignment.RIGHT).setMargin(0);
        attendeeRow.addCell(new Cell().add(orderRefP).setBorder(Border.NO_BORDER));
        leftPanel.add(attendeeRow);

        // F. Multi-Colored Security Badges (STRICTLY NO EMOJIS)
        Paragraph badgesP = new Paragraph()
                .add(new Text("[ 10-MIN CART LOCK ]  ").setFontSize(6.5f).setBold().setFontColor(COLOR_ACID_YELLOW))
                .add(new Text("[ ZERO OVERBOOKING ]  ").setFontSize(6.5f).setBold().setFontColor(COLOR_EMERALD_GREEN))
                .add(new Text("[ SHA-256 ENCRYPTED ]  ").setFontSize(6.5f).setBold().setFontColor(COLOR_ELECTRIC_CYAN))
                .add(new Text("[ PHOTO ID REQ ]").setFontSize(6.5f).setBold().setFontColor(COLOR_NEON_MAGENTA))
                .setMargin(0);
        leftPanel.add(badgesP);

        twoPanel.addCell(leftPanel);

        // ==================== CENTER PERFORATION NOTCH ====================
        Cell perfDivider = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderLeft(new DashedBorder(COLOR_ELECTRIC_CYAN, 1.5f))
                .setPadding(0);
        twoPanel.addCell(perfDivider);

        // ==================== RIGHT INVERTED GATE TURNSTILE STUB ====================
        // High-Contrast Inverted Crisp Snow White Background (#F8FAFC)
        Cell rightStub = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(COLOR_CRISP_SNOW)
                .setPadding(5f);

        Paragraph stubHead = new Paragraph("GATE TURNSTILE STUB")
                .setFontSize(8f).setBold().setFontColor(COLOR_OBSIDIAN_BG).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        Paragraph stubAdmit = new Paragraph("ADMIT ONE // SCAN AT GATE")
                .setFontSize(6f).setBold().setFontColor(COLOR_NEON_MAGENTA).setTextAlignment(TextAlignment.CENTER).setMarginBottom(2f);
        rightStub.add(stubHead);
        rightStub.add(stubAdmit);

        if (bannerBytes != null && bannerBytes.length > 0) {
            try {
                ImageData thumbData = ImageDataFactory.create(bannerBytes);
                Image thumbImg = new Image(thumbData)
                        .setWidth(UnitValue.createPercentValue(100))
                        .setMaxHeight(34f)
                        .setHorizontalAlignment(HorizontalAlignment.CENTER);
                Table thumbBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                        .useAllAvailableWidth()
                        .setBorder(new SolidBorder(COLOR_OBSIDIAN_BG, 1f))
                        .setPadding(0)
                        .setMarginBottom(3f);
                thumbBox.addCell(new Cell().add(thumbImg).setBorder(Border.NO_BORDER).setPadding(0));
                rightStub.add(thumbBox);
            } catch (Exception ignored) {}
        }

        // Stub Seat Banner (Electric Acid Yellow with Jet Black Text)
        Table stubSeatBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(COLOR_ACID_YELLOW)
                .setBorder(new SolidBorder(COLOR_OBSIDIAN_BG, 1.2f))
                .setPadding(2f)
                .setMarginBottom(4f);
        stubSeatBox.addCell(new Cell().add(new Paragraph("SEAT: " + seatNum)
                .setFontSize(9.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG).setTextAlignment(TextAlignment.CENTER).setMargin(0))
                .setBorder(Border.NO_BORDER));
        rightStub.add(stubSeatBox);

        // Optical QR Token Container (Sharp Black Border on Crisp White)
        Table qrBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(ColorConstants.WHITE)
                .setBorder(new SolidBorder(COLOR_OBSIDIAN_BG, 1.5f))
                .setPadding(2f)
                .setMarginBottom(4f);

        byte[] qrBytes = qrCodeService.generateQrCodeImage(ticket.getQrCode());
        if (qrBytes != null && qrBytes.length > 0) {
            ImageData imgData = ImageDataFactory.create(qrBytes);
            Image qrImg = new Image(imgData).setWidth(68).setHeight(68).setHorizontalAlignment(HorizontalAlignment.CENTER);
            qrBox.addCell(new Cell().add(qrImg).setBorder(Border.NO_BORDER).setPadding(1f));
        }
        Paragraph qrLabel = new Paragraph("OPTICAL GATE TOKEN")
                .setFontSize(5.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        qrBox.addCell(new Cell().add(qrLabel).setBorder(Border.NO_BORDER));
        rightStub.add(qrBox);

        // Scannable 1D Barcode Container (Real Code-128)
        Table barcodeBox = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setBackgroundColor(ColorConstants.WHITE)
                .setBorder(new SolidBorder(COLOR_OBSIDIAN_BG, 1.2f))
                .setPadding(2f)
                .setMarginBottom(3f);

        byte[] barcodeBytes = null;
        try {
            barcodeBytes = qrCodeService.generateBarcode128Image(serialCode, 140, 26);
        } catch (Exception e) {
            log.debug("Code-128 barcode fallback: {}", e.getMessage());
        }

        if (barcodeBytes != null && barcodeBytes.length > 0) {
            ImageData bcImgData = ImageDataFactory.create(barcodeBytes);
            Image bcImg = new Image(bcImgData).setWidth(105).setHeight(20).setHorizontalAlignment(HorizontalAlignment.CENTER);
            barcodeBox.addCell(new Cell().add(bcImg).setBorder(Border.NO_BORDER).setPadding(1f));
        } else {
            Paragraph simBc = new Paragraph("|| | ||| | || |||| | ||| | || | ||||")
                    .setFontSize(7.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG).setTextAlignment(TextAlignment.CENTER).setMargin(0);
            barcodeBox.addCell(new Cell().add(simBc).setBorder(Border.NO_BORDER));
        }

        Paragraph bcSerial = new Paragraph("* " + serialCode + " *")
                .setFontSize(5.5f).setBold().setFontColor(COLOR_OBSIDIAN_BG).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        barcodeBox.addCell(new Cell().add(bcSerial).setBorder(Border.NO_BORDER));
        rightStub.add(barcodeBox);

        Paragraph stubFoot = new Paragraph("SINGLE USE // TURNSTILE SCAN")
                .setFontSize(5.5f).setBold().setFontColor(new DeviceRgb(71, 85, 105)).setTextAlignment(TextAlignment.CENTER).setMargin(0);
        rightStub.add(stubFoot);

        twoPanel.addCell(rightStub);
        passCard.addCell(new Cell().add(twoPanel).setBorder(Border.NO_BORDER).setPadding(0));

        // 3. Tear Line Notice (NO EMOJIS, High-Contrast Accent)
        Paragraph tearP = new Paragraph("--------------------- TEAR / SCAN AT GATE TURNSTILE ---------------------")
                .setFontSize(6.5f).setFontColor(COLOR_ELECTRIC_CYAN).setTextAlignment(TextAlignment.CENTER).setMarginTop(3f).setMarginBottom(2f);
        passCard.addCell(new Cell().add(tearP).setBorder(Border.NO_BORDER));

        // 4. Security Microprint Line
        Paragraph microP = new Paragraph("EVENTHUB INFRASTRUCTURE // SECURE SHA-256 DIGITAL GATE CREDENTIAL // NON-TRANSFERABLE ADMISSION PASS")
                .setFontSize(5.5f).setFontColor(COLOR_TEXT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginBottom(3f);
        passCard.addCell(new Cell().add(microP).setBorder(Border.NO_BORDER));

        // 5. Bottom Hazard Warning Tape
        passCard.addCell(new Cell().add(createHazardTape(5.5f)).setPadding(0).setBorder(Border.NO_BORDER));

        document.add(passCard);
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
            pdf.addEventHandler(com.itextpdf.kernel.events.PdfDocumentEvent.START_PAGE, new PageBackgroundHandler());
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);
            document.setMargins(20f, 20f, 20f, 20f);

            // Executive Pass Header
            document.add(createExecutiveHeader(booking, event, 1));

            com.kritagya.event_booking_system.entity.Seat seat = null;
            if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
                seat = booking.getSeats().get(0);
            }

            // Ticket Pass Card
            renderBrutalistTicketPass(document, ticket, booking, event, seat, 0, 1);

            // Gate Protocol Guide
            document.add(createGateProtocolBox());

            // Page Microprint Footer
            Paragraph pageFooter = new Paragraph("EVENTHUB OFFICIAL DIGITAL ADMISSION DOCUMENT // SEASON 2026 // ALL RIGHTS RESERVED")
                    .setFontSize(5.5f).setFontColor(COLOR_TEXT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginTop(4f);
            document.add(pageFooter);

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
            pdf.addEventHandler(com.itextpdf.kernel.events.PdfDocumentEvent.START_PAGE, new PageBackgroundHandler());
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);
            document.setMargins(20f, 20f, 20f, 20f);

            int totalValidTickets = (int) tickets.stream().filter(t -> t.getTicketStatus() != TicketStatus.CANCELLED).count();

            if (totalValidTickets == 1) {
                document.add(createExecutiveHeader(booking, event, totalValidTickets));
                Ticket t = tickets.get(0);
                com.kritagya.event_booking_system.entity.Seat seat = null;
                if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
                    seat = booking.getSeats().get(0);
                }
                renderBrutalistTicketPass(document, t, booking, event, seat, 0, 1);
                document.add(createGateProtocolBox());
                Paragraph pageFooter = new Paragraph("EVENTHUB OFFICIAL DIGITAL ADMISSION DOCUMENT // SEASON 2026 // ALL RIGHTS RESERVED")
                        .setFontSize(5.5f).setFontColor(COLOR_TEXT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginTop(4f);
                document.add(pageFooter);
            } else {
                int renderedCount = 0;
                for (int i = 0; i < tickets.size(); i++) {
                    Ticket t = tickets.get(i);
                    if (t.getTicketStatus() == TicketStatus.CANCELLED) {
                        continue;
                    }
                    if (renderedCount > 0 && renderedCount % 2 == 0) {
                        document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
                    }
                    if (renderedCount % 2 == 0) {
                        document.add(createExecutiveHeader(booking, event, totalValidTickets));
                    }
                    com.kritagya.event_booking_system.entity.Seat seat = null;
                    if (booking.getSeats() != null && i < booking.getSeats().size()) {
                        seat = booking.getSeats().get(i);
                    }
                    renderBrutalistTicketPass(document, t, booking, event, seat, renderedCount, totalValidTickets);
                    renderedCount++;
                }
                document.add(createGateProtocolBox());
                Paragraph pageFooter = new Paragraph("EVENTHUB OFFICIAL DIGITAL ADMISSION DOCUMENT // SEASON 2026 // ALL RIGHTS RESERVED")
                        .setFontSize(5.5f).setFontColor(COLOR_TEXT_DIM).setTextAlignment(TextAlignment.CENTER).setMarginTop(4f);
                document.add(pageFooter);
            }

            document.close();
            log.info("Generated high-fidelity brutalist booking PDF for booking ID: {} with {} tickets", bookingId, totalValidTickets);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate booking PDF for booking ID: {}", bookingId, e);
            throw new RuntimeException("Failed to generate booking PDF", e);
        }
    }
}
