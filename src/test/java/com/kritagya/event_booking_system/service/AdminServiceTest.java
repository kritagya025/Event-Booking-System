package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.admin.*;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private AdminService adminService;

    private User user;
    private Event eventWithDate;
    private Event eventNullDate;
    private Booking confirmedBooking;
    private Booking nullDateBooking;

    @BeforeEach
    void setUp() {
        user = new User("John", "Doe", "john@test.com", "pass", "1234567890", Role.CUSTOMER);
        user.setEmailVerified(true);
        user.setId(1L);

        eventWithDate = new Event();
        ReflectionTestUtils.setField(eventWithDate, "id", 100L);
        eventWithDate.setName("Rock Fest");
        eventWithDate.setEventDate(LocalDate.now().plusDays(5));
        eventWithDate.setCategory("MUSIC");
        eventWithDate.setStatus(EventStatus.PUBLISHED);

        eventNullDate = new Event();
        ReflectionTestUtils.setField(eventNullDate, "id", 101L);
        eventNullDate.setName("Draft Fest");
        eventNullDate.setEventDate(null); // Null date draft
        eventNullDate.setCategory(null);  // Null category
        eventNullDate.setStatus(EventStatus.DRAFT);

        confirmedBooking = new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 2, new BigDecimal("100.00"), user, eventWithDate);
        ReflectionTestUtils.setField(confirmedBooking, "id", 200L);

        nullDateBooking = new Booking(null, BookingStatus.CONFIRMED, 1, new BigDecimal("50.00"), user, eventNullDate);
        ReflectionTestUtils.setField(nullDateBooking, "id", 201L);
    }

    @Test
    @DisplayName("getDashboard succeeds and handles null event dates gracefully")
    void testGetDashboard_HandlesNullEventDate() {
        when(userRepository.count()).thenReturn(1L);
        when(eventRepository.count()).thenReturn(2L);
        when(bookingRepository.count()).thenReturn(2L);
        when(bookingRepository.findAll()).thenReturn(List.of(confirmedBooking, nullDateBooking));
        when(eventRepository.findAll()).thenReturn(List.of(eventWithDate, eventNullDate));

        AdminDashboardDTO dashboard = adminService.getDashboard();

        assertThat(dashboard).isNotNull();
        assertThat(dashboard.getTotalUsers()).isEqualTo(1L);
        assertThat(dashboard.getTotalEvents()).isEqualTo(2L);
        assertThat(dashboard.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(dashboard.getUpcomingEventsCount()).isEqualTo(1L); // Only eventWithDate is upcoming
    }

    @Test
    @DisplayName("getRevenueAnalytics handles null booking dates and null event categories")
    void testGetRevenueAnalytics_NullSafe() {
        when(bookingRepository.findAll()).thenReturn(List.of(confirmedBooking, nullDateBooking));

        RevenueAnalyticsDTO analytics = adminService.getRevenueAnalytics();

        assertThat(analytics).isNotNull();
        assertThat(analytics.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(analytics.getRevenueByCategory()).containsKey("MUSIC");
        assertThat(analytics.getRevenueByCategory()).containsKey("Uncategorized");
    }

    @Test
    @DisplayName("getEventStatistics categorizes events and handles null category")
    void testGetEventStatistics_NullSafe() {
        when(eventRepository.findAll()).thenReturn(List.of(eventWithDate, eventNullDate));

        EventStatisticsDTO stats = adminService.getEventStatistics();

        assertThat(stats).isNotNull();
        assertThat(stats.getTotalEvents()).isEqualTo(2L);
        assertThat(stats.getPublishedEvents()).isEqualTo(1L);
        assertThat(stats.getDraftEvents()).isEqualTo(1L);
        assertThat(stats.getUpcomingEvents()).isEqualTo(1L);
        assertThat(stats.getEventsByCategory()).containsKey("MUSIC");
        assertThat(stats.getEventsByCategory()).containsKey("Uncategorized");
    }

    @Test
    @DisplayName("getBookingAnalytics computes correct cancellation rate")
    void testGetBookingAnalytics() {
        Booking cancelledBooking = new Booking(LocalDateTime.now(), BookingStatus.CANCELLED, 1, new BigDecimal("50.00"), user, eventWithDate);
        when(bookingRepository.findAll()).thenReturn(List.of(confirmedBooking, cancelledBooking));

        BookingAnalyticsDTO analytics = adminService.getBookingAnalytics();

        assertThat(analytics).isNotNull();
        assertThat(analytics.getTotalBookings()).isEqualTo(2L);
        assertThat(analytics.getConfirmedBookings()).isEqualTo(1L);
        assertThat(analytics.getCancelledBookings()).isEqualTo(1L);
        assertThat(analytics.getCancellationRate()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("getSystemHealth returns system diagnostic health metrics")
    void testGetSystemHealth() {
        SystemHealthDTO health = adminService.getSystemHealth();

        assertThat(health).isNotNull();
        assertThat(health.getStatus()).isEqualTo("UP");
        assertThat(health.getAvailableProcessors()).isGreaterThan(0);
        assertThat(health.getJvmTotalMemoryMB()).isGreaterThan(0);
    }
}
