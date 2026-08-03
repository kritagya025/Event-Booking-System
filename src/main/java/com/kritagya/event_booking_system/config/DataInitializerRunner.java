package com.kritagya.event_booking_system.config;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.Seat;
import com.kritagya.event_booking_system.entity.Venue;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.SeatStatus;
import com.kritagya.event_booking_system.enums.SeatType;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.SeatRepository;
import com.kritagya.event_booking_system.repository.VenueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializerRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerRunner.class);

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;

    public DataInitializerRunner(EventRepository eventRepository, VenueRepository venueRepository, SeatRepository seatRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    public void run(String... args) {
        if (eventRepository.count() == 0) {
            log.info("[DataInitializer] Database contains 0 events. Seeding initial dummy events and venue seats into database...");

            Venue venue1 = venueRepository.save(new Venue("Metro Arena Center", "450 Innovation Way, San Francisco, CA", 15000, "Premier multi-purpose entertainment arena"));
            Venue venue2 = venueRepository.save(new Venue("Silicon Valley Convention Center", "100 Tech Blvd, San Jose, CA", 8000, "State-of-the-art tech conference center"));
            Venue venue3 = venueRepository.save(new Venue("Royal Opera House", "12 Broadway Ave, New York, NY", 3000, "Historic theater for arts & music"));
            Venue venue4 = venueRepository.save(new Venue("Apex eSports Dome", "88 Cyber Way, Austin, TX", 5000, "High-tech gaming arena"));

            // Seed seats for venues
            seedSeatsForVenue(venue1);
            seedSeatsForVenue(venue2);
            seedSeatsForVenue(venue3);
            seedSeatsForVenue(venue4);

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

            eventRepository.saveAll(List.of(e1, e2, e3, e4));
            log.info("[DataInitializer] Successfully seeded 4 dummy events, venues, and venue seats into database.");
        }
    }

    private void seedSeatsForVenue(Venue venue) {
        String[] rows = {"A", "B", "C", "D", "E"};
        List<Seat> seats = new ArrayList<>();

        for (String row : rows) {
            for (int num = 1; num <= 8; num++) {
                Seat seat = new Seat();
                seat.setRowNumber(row);
                seat.setSeatNumber(row + num);
                seat.setSeatType(row.equals("A") ? SeatType.VIP : SeatType.REGULAR);
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setVenue(venue);
                seats.add(seat);
            }
        }
        seatRepository.saveAll(seats);
    }
}
