package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.mapper.EventMapper;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    public AdminDashboardDTO getDashboard() {
        log.info("Calculating admin dashboard metrics");
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalBookings = bookingRepository.count();

        BigDecimal totalRevenue = bookingRepository.sumTotalRevenueByStatus(BookingStatus.CONFIRMED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        BigDecimal todayRevenue = bookingRepository.sumRevenueByStatusSince(BookingStatus.CONFIRMED, startOfToday);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;

        long upcomingEventsCount = eventRepository.countByDeletedFalseAndEventDateAfter(LocalDate.now());
        long cancelledEventsCount = eventRepository.countByDeletedFalseAndStatus(EventStatus.CANCELLED);

        // Popular events: top 5 events sorted by total booked quantity
        List<Booking> allBookings = bookingRepository.findAll();
        List<Event> allEvents = eventRepository.findAll();

        Map<Long, Integer> eventBookingCounts = new HashMap<>();
        for (Booking b : allBookings) {
            if (b.getBookingStatus() == BookingStatus.CONFIRMED && b.getEvent() != null) {
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
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenueByStatus(BookingStatus.CONFIRMED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        BigDecimal todayRevenue = bookingRepository.sumRevenueByStatusSince(BookingStatus.CONFIRMED, startOfToday);
        if (todayRevenue == null) todayRevenue = BigDecimal.ZERO;

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal monthlyRevenue = bookingRepository.sumRevenueByStatusSince(BookingStatus.CONFIRMED, startOfMonth);
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;

        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        List<Object[]> categoryRevenueList = bookingRepository.sumRevenueByCategoryAndStatus(BookingStatus.CONFIRMED);
        if (categoryRevenueList != null) {
            for (Object[] row : categoryRevenueList) {
                String cat = (String) row[0];
                BigDecimal sum = (BigDecimal) row[1];
                revenueByCategory.put(cat != null ? cat : "Uncategorized", sum != null ? sum : BigDecimal.ZERO);
            }
        }

        Map<String, BigDecimal> dailyRevenueTrend = new TreeMap<>();
        List<Object[]> dateAmountList = bookingRepository.findBookingDatesAndAmountsByStatus(BookingStatus.CONFIRMED);
        if (dateAmountList != null) {
            for (Object[] row : dateAmountList) {
                LocalDateTime date = (LocalDateTime) row[0];
                BigDecimal amount = (BigDecimal) row[1];
                if (date != null && amount != null) {
                    String dateStr = date.toLocalDate().toString();
                    dailyRevenueTrend.put(dateStr, dailyRevenueTrend.getOrDefault(dateStr, BigDecimal.ZERO).add(amount));
                }
            }
        }

        return new RevenueAnalyticsDTO(totalRevenue, todayRevenue, monthlyRevenue, revenueByCategory, dailyRevenueTrend);
    }

    @Transactional(readOnly = true)
    public BookingAnalyticsDTO getBookingAnalytics() {
        long totalBookings = bookingRepository.count();
        long confirmed = bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        long cancelled = bookingRepository.countByBookingStatus(BookingStatus.CANCELLED);
        long pending = bookingRepository.countByBookingStatus(BookingStatus.PENDING);
        double cancellationRate = totalBookings > 0 ? ((double) cancelled / totalBookings) * 100.0 : 0.0;

        Map<String, Long> byStatus = new HashMap<>();
        byStatus.put("CONFIRMED", confirmed);
        byStatus.put("CANCELLED", cancelled);
        byStatus.put("PENDING", pending);

        return new BookingAnalyticsDTO(totalBookings, confirmed, cancelled, cancellationRate, byStatus);
    }

    @Transactional(readOnly = true)
    public UserStatisticsDTO getUserStatistics() {
        long totalUsers = userRepository.count();
        long verified = userRepository.countByEmailVerifiedTrue();
        long unverified = Math.max(0, totalUsers - verified);

        Map<String, Long> usersByRole = new HashMap<>();
        List<Object[]> roleCounts = userRepository.countUsersByRole();
        if (roleCounts != null) {
            for (Object[] row : roleCounts) {
                Role role = (Role) row[0];
                Long count = (Long) row[1];
                if (role != null) {
                    usersByRole.put(role.name(), count != null ? count : 0L);
                }
            }
        }

        return new UserStatisticsDTO(totalUsers, verified, unverified, usersByRole);
    }

    @Transactional(readOnly = true)
    public EventStatisticsDTO getEventStatistics() {
        long totalEvents = eventRepository.countByDeletedFalse();
        long published = eventRepository.countByDeletedFalseAndStatus(EventStatus.PUBLISHED);
        long draft = eventRepository.countByDeletedFalseAndStatus(EventStatus.DRAFT);
        long upcoming = eventRepository.countByDeletedFalseAndEventDateAfter(LocalDate.now());
        long cancelled = eventRepository.countByDeletedFalseAndStatus(EventStatus.CANCELLED);

        Map<String, Long> eventsByCategory = new HashMap<>();
        List<Object[]> categoryCounts = eventRepository.countEventsByCategory();
        if (categoryCounts != null) {
            for (Object[] row : categoryCounts) {
                String cat = (String) row[0];
                Long count = (Long) row[1];
                eventsByCategory.put(cat != null ? cat : "Uncategorized", count != null ? count : 0L);
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

    public SystemHealthDTO getSystemHealth() {
        Runtime runtime = Runtime.getRuntime();
        long uptime = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        int processors = runtime.availableProcessors();
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long maxMem = runtime.maxMemory() / (1024 * 1024);
        int activeThreads = Thread.activeCount();

        return new SystemHealthDTO(
                "UP",
                uptime,
                processors,
                freeMem,
                totalMem,
                maxMem,
                activeThreads,
                LocalDateTime.now()
        );
    }
}
