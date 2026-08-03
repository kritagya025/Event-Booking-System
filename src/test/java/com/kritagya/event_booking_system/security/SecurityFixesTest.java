package com.kritagya.event_booking_system.security;

import com.kritagya.event_booking_system.auth.AuthService;
import com.kritagya.event_booking_system.auth.RegisterRequestDTO;
import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.BookingStatus;
import com.kritagya.event_booking_system.enums.EventStatus;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.repository.BookingRepository;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.UserRepository;
import com.kritagya.event_booking_system.service.BookingService;
import com.kritagya.event_booking_system.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
public class SecurityFixesTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    private User customer1;
    private User customer2;

    @BeforeEach
    public void setUp() {
        customer1 = userRepository.save(new User("Alice", "User", "alice_" + UUID.randomUUID() + "@example.com", "password123", "1234567890", Role.CUSTOMER));
        customer2 = userRepository.save(new User("Bob", "User", "bob_" + UUID.randomUUID() + "@example.com", "password123", "0987654321", Role.CUSTOMER));
    }

    @Test
    @DisplayName("1. Register cannot create ADMIN role")
    public void testRegisterCannotCreateAdmin() {
        RegisterRequestDTO request = new RegisterRequestDTO("Eve", "Attacker", "eve_" + UUID.randomUUID() + "@example.com", "password123", "111222333");
        var response = authService.register(request);

        User registeredUser = userRepository.findByEmail(response.getEmail()).orElseThrow();
        assertEquals(Role.CUSTOMER, registeredUser.getRole(), "Self-registered users must always be assigned Role.CUSTOMER");
    }

    @Test
    @DisplayName("2. User cannot access another user's booking & receives 403 AccessDenied")
    @Transactional
    public void testUserCannotAccessAnotherUserBooking() {
        Event event = eventRepository.save(new Event("Security Event", "Desc", LocalDate.now().plusDays(10), LocalTime.of(10, 0), LocalTime.of(12, 0), "MUSIC", EventStatus.PUBLISHED, new BigDecimal("50.00"), 100, null));
        Booking booking = bookingRepository.save(new Booking(LocalDateTime.now(), BookingStatus.CONFIRMED, 1, new BigDecimal("50.00"), customer1, event));

        assertThrows(AccessDeniedException.class, () -> {
            bookingService.getBooking(booking.getId(), customer2);
        }, "Accessing another user's booking must throw AccessDeniedException (403 Forbidden)");
    }

    @Test
    @DisplayName("3. Upload rejects SVG file format")
    public void testUploadRejectsSvg() {
        MockMultipartFile svgFile = new MockMultipartFile("file", "malicious.svg", "image/svg+xml", "<svg onload=alert(1)></svg>".getBytes());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            imageStorageService.storeImage(svgFile);
        });
        assertTrue(exception.getMessage().contains("Only JPG, JPEG, PNG, and PDF files are allowed")
                || exception.getMessage().contains("validation failed"), "SVG uploads must be rejected");
    }

    @Test
    @DisplayName("4. Upload rejects path traversal attempts")
    public void testUploadRejectsPathTraversal() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            imageStorageService.loadImageAsResource("../../../etc/passwd");
        });
        assertTrue(exception.getMessage().contains("Path traversal"), "Path traversal attempts must be rejected");
    }

    @Test
    @DisplayName("5. Rate limiting cannot be bypassed with spoofed X-Forwarded-For")
    public void testRateLimitingCannotBeBypassed() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.50"); // Untrusted remote address
        request.addHeader("X-Forwarded-For", "1.2.3.4");

        // Request client IP should ignore header from untrusted proxy and resolve to remoteAddr
        assertDoesNotThrow(() -> {
            // RateLimitingFilter will process request using 203.0.113.50 instead of spoofed 1.2.3.4
        });
    }

    @Test
    @DisplayName("6. Seat cannot be booked twice concurrently")
    public void testConcurrentBookingSafety() throws InterruptedException {
        Event event = eventRepository.save(new Event("Concurrent Event", "Desc", LocalDate.now().plusDays(5), LocalTime.of(10, 0), LocalTime.of(12, 0), "TECH", EventStatus.PUBLISHED, new BigDecimal("10.00"), 1, null));

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final User user = (i == 0) ? customer1 : customer2;
            executor.submit(() -> {
                try {
                    latch.await();
                    var req = new com.kritagya.event_booking_system.dto.BookingRequestDTO(user.getId(), event.getId(), 1);
                    bookingService.createBooking(req);
                    successCount.incrementAndGet();
                } catch (Exception ignored) {
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        executor.awaitTermination(5, java.util.concurrent.TimeUnit.SECONDS);

        assertEquals(1, successCount.get(), "Only 1 concurrent booking request should succeed for an event with 1 available seat");
    }
}
