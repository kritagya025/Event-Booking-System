package com.kritagya.event_booking_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kritagya.event_booking_system.dto.BookingRequestDTO;
import com.kritagya.event_booking_system.dto.BookingResponseDTO;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookingService bookingService;

    private CustomUserDetails customerDetails;
    private CustomUserDetails adminDetails;
    private BookingResponseDTO sampleResponse;

    @BeforeEach
    void setUp() {
        User customer = new User("Alice", "Smith", "alice@example.com", "pass", "1234567890", Role.CUSTOMER);
        customer.setId(10L);
        customerDetails = new CustomUserDetails(customer);

        User admin = new User("Admin", "Root", "admin@example.com", "pass", "0987654321", Role.ADMIN);
        admin.setId(1L);
        adminDetails = new CustomUserDetails(admin);

        sampleResponse = new BookingResponseDTO(100L, LocalDateTime.now(), "CONFIRMED", 2,
                BigDecimal.valueOf(150.00), 10L, "Alice Smith", 5L, "Live Festival");
    }

    @Test
    @DisplayName("POST /api/bookings creates booking and overrides userId for non-admin customer")
    void createBooking_CustomerSuccess() throws Exception {
        BookingRequestDTO request = new BookingRequestDTO(999L, 5L, 2);
        when(bookingService.createBooking(any(BookingRequestDTO.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/bookings")
                        .with(user(customerDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.bookingStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.quantity").value(2))
                .andExpect(jsonPath("$.userId").value(10));

        // Ensure non-admin request userId was overridden to authenticated customer ID (10L)
        verify(bookingService).createBooking(org.mockito.ArgumentMatchers.argThat(dto -> dto.getUserId().equals(10L)));
    }

    @Test
    @DisplayName("GET /api/bookings allows ADMIN to view all bookings")
    void getAllBookings_AdminSuccess() throws Exception {
        when(bookingService.getAllBookings()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings")
                        .with(user(adminDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100));
    }

    @Test
    @DisplayName("GET /api/bookings returns 403 Forbidden for non-admin CUSTOMER")
    void getAllBookings_CustomerForbidden() throws Exception {
        mockMvc.perform(get("/api/bookings")
                        .with(user(customerDetails)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/bookings/{id} returns booking details for authenticated user")
    void getBooking_Success() throws Exception {
        when(bookingService.getBooking(eq(100L), any(User.class))).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/bookings/100")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.eventName").value("Live Festival"));
    }

    @Test
    @DisplayName("GET /api/bookings/user/{userId} allows user to view their own bookings")
    void getBookingsByUser_OwnSuccess() throws Exception {
        when(bookingService.getBookingsByUser(10L)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/bookings/user/10")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(10));
    }

    @Test
    @DisplayName("GET /api/bookings/user/{userId} returns 403 Forbidden when customer views other user's bookings")
    void getBookingsByUser_OtherUserForbidden() throws Exception {
        mockMvc.perform(get("/api/bookings/user/999")
                        .with(user(customerDetails)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/bookings/{id}/cancel allows cancelling booking")
    void cancelBooking_Success() throws Exception {
        sampleResponse.setBookingStatus("CANCELLED");
        when(bookingService.cancelBooking(eq(100L), any(User.class))).thenReturn(sampleResponse);

        mockMvc.perform(patch("/api/bookings/100/cancel")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.bookingStatus").value("CANCELLED"));
    }
}
