package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public AdminService(UserRepository userRepository,
                        EventRepository eventRepository,
                        BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "adminStats", key = "'dashboard'")
    public AdminDashboardDTO getDashboard() {
        log.info("Calculating admin dashboard metrics");
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalBookings = bookingRepository.count();

        List<Booking> allBookings = bookingRepository.findAll();
        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        BigDecimal todayRevenue = allBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED && b.getBookingDate().isAfter(startOfToday))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Event> allEvents = eventRepository.findAll();
        long upcomingEventsCount = allEvents.stream()
                .filter(e -> !e.isDeleted() && e.getEventDate().isAfter(LocalDate.now()))
                .count();

        long cancelledEventsCount = allEvents.stream()
                .filter(e -> e.getStatus() == EventStatus.CANCELLED)
                .count();

        // Popular events: top 5 events sorted by total booked quantity
        Map<Long, Integer> eventBookingCounts = new HashMap<>();
        for (Booking b : allBookings) {
            if (b.getBookingStatus() == BookingStatus.CONFIRMED) {
                eventBookingCounts.put(b.getEvent().getId(),
                        eventBookingCounts.getOrDefault(b.getEvent().getId(), 0) + b.getQuantity());
            }
        }

        List<EventResponseDTO> popularEvents = allEvents.stream()
                .filter(e -> !e.isDeleted())
                .sorted((e1, e2) -> Integer.compare(
                        eventBookingCounts.getOrDefault(e2.getId(), 0),
                        eventBookingCounts.getOrDefault(e1.getId(), 0)))
                .limit(5)
                .map(EventMapper::toDTO)
                .collect(Collectors.toList());

        return new AdminDashboardDTO(
                totalUsers, totalEvents, totalBookings,
                totalRevenue, todayRevenue,
                upcomingEventsCount, cancelledEventsCount, popularEvents
        );
    }

    @Transactional(readOnly = true)
    public RevenueAnalyticsDTO getRevenueAnalytics() {
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = confirmedBookings.stream()
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        BigDecimal todayRevenue = confirmedBookings.stream()
                .filter(b -> b.getBookingDate().isAfter(startOfToday))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal monthlyRevenue = confirmedBookings.stream()
                .filter(b -> b.getBookingDate().isAfter(startOfMonth))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        for (Booking b : confirmedBookings) {
            String category = b.getEvent().getCategory();
            revenueByCategory.put(category,
                    revenueByCategory.getOrDefault(category, BigDecimal.ZERO).add(b.getTotalAmount()));
        }

        Map<String, BigDecimal> dailyRevenueTrend = new TreeMap<>();
        for (Booking b : confirmedBookings) {
            String dateStr = b.getBookingDate().toLocalDate().toString();
            dailyRevenueTrend.put(dateStr,
                    dailyRevenueTrend.getOrDefault(dateStr, BigDecimal.ZERO).add(b.getTotalAmount()));
        }

        return new RevenueAnalyticsDTO(totalRevenue, todayRevenue, monthlyRevenue, revenueByCategory, dailyRevenueTrend);
    }

    @Transactional(readOnly = true)
    public BookingAnalyticsDTO getBookingAnalytics() {
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long confirmed = allBookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).count();
        long cancelled = allBookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();
        double cancellationRate = totalBookings > 0 ? ((double) cancelled / totalBookings) * 100.0 : 0.0;

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("CONFIRMED", confirmed);
        byStatus.put("CANCELLED", cancelled);
        byStatus.put("PENDING", allBookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.PENDING).count());

        return new BookingAnalyticsDTO(totalBookings, confirmed, cancelled, cancellationRate, byStatus);
    }

    @Transactional(readOnly = true)
    public UserStatisticsDTO getUserStatistics() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long verified = users.stream().filter(User::isEmailVerified).count();
        long unverified = totalUsers - verified;

        Map<String, Long> usersByRole = new HashMap<>();
        for (User u : users) {
            String role = u.getRole().name();
            usersByRole.put(role, usersByRole.getOrDefault(role, 0L) + 1);
        }

        return new UserStatisticsDTO(totalUsers, verified, unverified, usersByRole);
    }

    @Transactional(readOnly = true)
    public EventStatisticsDTO getEventStatistics() {
        List<Event> events = eventRepository.findAll();
        long totalEvents = events.stream().filter(e -> !e.isDeleted()).count();
        long published = events.stream().filter(e -> !e.isDeleted() && e.getStatus() == EventStatus.PUBLISHED).count();
        long draft = events.stream().filter(e -> !e.isDeleted() && e.getStatus() == EventStatus.DRAFT).count();
        long upcoming = events.stream().filter(e -> !e.isDeleted() && e.getEventDate().isAfter(LocalDate.now())).count();
        long cancelled = events.stream().filter(e -> e.getStatus() == EventStatus.CANCELLED).count();

        Map<String, Long> eventsByCategory = new HashMap<>();
        for (Event e : events) {
            if (!e.isDeleted()) {
                eventsByCategory.put(e.getCategory(), eventsByCategory.getOrDefault(e.getCategory(), 0L) + 1);
            }
        }

        return new EventStatisticsDTO(totalEvents, published, draft, upcoming, cancelled, eventsByCategory);
    }

    @Transactional(readOnly = true)
    public ReportsDTO getFullReport() {
        return new ReportsDTO(
                LocalDateTime.now(),
                getDashboard(),
                getRevenueAnalytics(),
                getBookingAnalytics(),
                getUserStatistics(),
                getEventStatistics()
        );
    }
}
