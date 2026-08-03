package com.kritagya.event_booking_system.config;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.enums.SeatType;
import com.kritagya.event_booking_system.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@org.springframework.context.annotation.Profile("dev")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
public class DataInitializerRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerRunner.class);

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final WishlistRepository wishlistRepository;
    private final WaitlistRepository waitlistRepository;
    private final ReviewRepository reviewRepository;

    public DataInitializerRunner(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            SeatRepository seatRepository,
            BookingRepository bookingRepository,
            TicketRepository ticketRepository,
            WishlistRepository wishlistRepository,
            WaitlistRepository waitlistRepository,
            ReviewRepository reviewRepository
    ) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.wishlistRepository = wishlistRepository;
        this.waitlistRepository = waitlistRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[DataInitializer] Cleaning database to ensure ONLY the 4 primary dummy events exist...");

        Set<String> dummyNames = Set.of(
                "Neon Horizon Cyber Music Festival 2026",
                "Global AI & Autonomous Tech Summit 2026",
                "Phantom of the Opera — Broadway Revival",
                "Grand Prix eSports World Championship"
        );

        // 1. Delete all non-dummy events created during test runs
        List<Event> allEvents = eventRepository.findAll();
        for (Event event : allEvents) {
            if (!dummyNames.contains(event.getName())) {
                log.info("[DataInitializer] Removing extra/test event: '{}' (ID: {})", event.getName(), event.getId());
                purgeEventDependencies(event.getId());
                eventRepository.delete(event);
            }
        }

        // 2. Ensure venues exist across India, USA, UK, Europe, Australia, and Asia
        Venue venue1 = getOrCreateVenue("Metro Arena Center", "450 Innovation Way, San Francisco, CA, USA", 15000, "Premier multi-purpose entertainment arena");
        Venue venue2 = getOrCreateVenue("Silicon Valley Convention Center", "100 Tech Blvd, San Jose, CA, USA", 8000, "State-of-the-art tech conference center");
        Venue venue3 = getOrCreateVenue("Royal Opera House", "12 Broadway Ave, New York, NY, USA", 3000, "Historic theater for arts & music");
        Venue venue4 = getOrCreateVenue("Apex eSports Dome", "88 Cyber Way, Austin, TX, USA", 5000, "High-tech gaming arena");
        
        // India Venues
        getOrCreateVenue("Jio World Centre", "BKC, Mumbai, Maharashtra, India", 16000, "World-class convention & exhibition centre");
        getOrCreateVenue("Jawaharlal Nehru Stadium", "Pragati Vihar, New Delhi, India", 60000, "Iconic multi-purpose sports stadium");
        getOrCreateVenue("Bangalore International Exhibition Centre (BIEC)", "10th Mile, Tumkur Road, Bangalore, India", 20000, "Premier trade & event venue");
        getOrCreateVenue("Hyderabad International Convention Centre (HICC)", "Hitec City, Hyderabad, Telangana, India", 10000, "South Asia's finest convention center");
        getOrCreateVenue("Narendra Modi Stadium", "Motera, Ahmedabad, Gujarat, India", 132000, "World's largest cricket & event stadium");

        // UK & Europe Venues
        getOrCreateVenue("Wembley Stadium", "London, HA9 0WS, United Kingdom", 90000, "Legendary sports & concert arena");
        getOrCreateVenue("The O2 Arena", "Peninsula Square, London, United Kingdom", 20000, "Top world entertainment destination");
        getOrCreateVenue("Accor Arena", "8 Boulevard de Bercy, Paris, France", 20300, "Premier European concert & indoor sports hall");
        getOrCreateVenue("Uber Arena", "Mercedes-Platz 1, Berlin, Germany", 17000, "Modern European entertainment venue");

        // Australia & Asia Venues
        getOrCreateVenue("Sydney Opera House", "Bennelong Point, Sydney, Australia", 5700, "UNESCO World Heritage performing arts center");
        getOrCreateVenue("Tokyo Dome", "1 Chome-3-61 Koraku, Bunkyo City, Tokyo, Japan", 55000, "Famous multi-purpose dome stadium");

        // Seed seats for primary 4 event venues matching venue capacity
        seedSeatsForVenue(venue1, 120);
        seedSeatsForVenue(venue2, 45);
        seedSeatsForVenue(venue3, 40);
        seedSeatsForVenue(venue4, 300);

        // 3. Ensure the 4 primary dummy events exist
        Set<String> remainingNames = new HashSet<>();
        for (Event e : eventRepository.findAll()) {
            remainingNames.add(e.getName());
        }

        if (!remainingNames.contains("Neon Horizon Cyber Music Festival 2026")) {
            Event e1 = new Event(
                    "Neon Horizon Cyber Music Festival 2026",
                    "Experience 3 days of immersive electronic music, holographic stages, and world-class laser shows.",
                    LocalDate.of(2026, 9, 15),
                    LocalTime.of(19, 0),
                    LocalTime.of(23, 30),
                    "MUSIC",
                    EventStatus.PUBLISHED,
                    new BigDecimal("85.00"),
                    120,
                    venue1
            );
            e1.setBannerImageUrl("/images/concert.png");
            eventRepository.save(e1);
        }

        if (!remainingNames.contains("Global AI & Autonomous Tech Summit 2026")) {
            Event e2 = new Event(
                    "Global AI & Autonomous Tech Summit 2026",
                    "Keynotes from leading AI researchers, robotics live demonstrations, and executive networking sessions.",
                    LocalDate.of(2026, 10, 2),
                    LocalTime.of(9, 0),
                    LocalTime.of(18, 0),
                    "TECH",
                    EventStatus.PUBLISHED,
                    new BigDecimal("299.00"),
                    45,
                    venue2
            );
            e2.setBannerImageUrl("/images/tech.png");
            eventRepository.save(e2);
        }

        if (!remainingNames.contains("Phantom of the Opera — Broadway Revival")) {
            Event e3 = new Event(
                    "Phantom of the Opera — Broadway Revival",
                    "The iconic award-winning musical returns with an all-new cast and breathtaking orchestral arrangements.",
                    LocalDate.of(2026, 11, 20),
                    LocalTime.of(20, 0),
                    LocalTime.of(22, 30),
                    "THEATER",
                    EventStatus.PUBLISHED,
                    new BigDecimal("120.00"),
                    0,
                    venue3
            );
            e3.setBannerImageUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80");
            eventRepository.save(e3);
        }

        if (!remainingNames.contains("Grand Prix eSports World Championship")) {
            Event e4 = new Event(
                    "Grand Prix eSports World Championship",
                    "Top simulator racing drivers compete for the $500,000 prize pool live on stage in front of thousands.",
                    LocalDate.of(2026, 12, 5),
                    LocalTime.of(14, 0),
                    LocalTime.of(21, 0),
                    "SPORTS",
                    EventStatus.PUBLISHED,
                    new BigDecimal("45.00"),
                    300,
                    venue4
            );
            e4.setBannerImageUrl("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80");
            eventRepository.save(e4);
        }

        log.info("[DataInitializer] Database reset finished. Total events active in database: {}", eventRepository.count());
    }

    private void purgeEventDependencies(Long eventId) {
        ticketRepository.deleteByEventId(eventId);
        bookingRepository.deleteByEventId(eventId);
        wishlistRepository.deleteByEventId(eventId);
        waitlistRepository.deleteByEventId(eventId);
        reviewRepository.deleteByEventId(eventId);
    }

    private Venue getOrCreateVenue(String name, String address, int capacity, String description) {
        List<Venue> existing = venueRepository.findAll();
        for (Venue v : existing) {
            if (v.getName().equalsIgnoreCase(name)) {
                return v;
            }
        }
        return venueRepository.save(new Venue(name, address, capacity, description));
    }

    private void seedSeatsForVenue(Venue venue, int targetCapacity) {
        List<Seat> existingSeats = seatRepository.findByVenueId(venue.getId());
        if (existingSeats.size() >= targetCapacity) return;

        Set<String> existingNumbers = new HashSet<>();
        for (Seat s : existingSeats) {
            existingNumbers.add(s.getSeatNumber());
        }

        int seatsPerRow = 10;
        int totalRows = (int) Math.ceil((double) targetCapacity / seatsPerRow);
        List<Seat> newSeats = new ArrayList<>();
        int currentCount = existingSeats.size();

        for (int r = 0; r < totalRows; r++) {
            String rowLetter = getRowLetter(r);
            SeatType seatType = (r == 0) ? SeatType.VIP : SeatType.REGULAR;

            for (int num = 1; num <= seatsPerRow; num++) {
                if (currentCount + newSeats.size() >= targetCapacity) break;
                String seatNum = rowLetter + num;
                if (!existingNumbers.contains(seatNum)) {
                    Seat seat = new Seat();
                    seat.setRowNumber(rowLetter);
                    seat.setSeatNumber(seatNum);
                    seat.setSeatType(seatType);
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seat.setVenue(venue);
                    newSeats.add(seat);
                }
            }
        }
        if (!newSeats.isEmpty()) {
            seatRepository.saveAll(newSeats);
        }
    }

    private String getRowLetter(int index) {
        if (index < 26) {
            return String.valueOf((char) ('A' + index));
        } else {
            return "A" + (char) ('A' + (index - 26));
        }
    }
}
