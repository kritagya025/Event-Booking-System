package com.kritagya.event_booking_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kritagya.event_booking_system.dto.PaymentRequestDTO;
import com.kritagya.event_booking_system.dto.PaymentResponseDTO;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.service.PaymentService;
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
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    private CustomUserDetails customerDetails;
    private CustomUserDetails adminDetails;
    private PaymentResponseDTO sampleResponse;

    @BeforeEach
    void setUp() {
        User customer = new User("Alice", "Smith", "alice@example.com", "pass", "1234567890", Role.CUSTOMER);
        customer.setId(10L);
        customerDetails = new CustomUserDetails(customer);

        User admin = new User("Admin", "Root", "admin@example.com", "pass", "0987654321", Role.ADMIN);
        admin.setId(1L);
        adminDetails = new CustomUserDetails(admin);

        sampleResponse = new PaymentResponseDTO(
                100L,
                BigDecimal.valueOf(250.00),
                "CREDIT_CARD",
                "COMPLETED",
                "TXN-123456",
                50L
        );
    }

    @Test
    @DisplayName("POST /api/payments creates payment successfully and returns 201")
    void createPayment_Success() throws Exception {
        PaymentRequestDTO request = new PaymentRequestDTO(50L, "CREDIT_CARD");

        when(paymentService.createPayment(any(PaymentRequestDTO.class), any(User.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/payments")
                        .with(user(customerDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.amount").value(250.00))
                .andExpect(jsonPath("$.paymentMethod").value("CREDIT_CARD"))
                .andExpect(jsonPath("$.paymentStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.transactionId").value("TXN-123456"))
                .andExpect(jsonPath("$.bookingId").value(50));

        verify(paymentService).createPayment(any(PaymentRequestDTO.class), any(User.class));
    }

    @Test
    @DisplayName("POST /api/payments returns 400 when validation fails")
    void createPayment_ValidationFailure() throws Exception {
        PaymentRequestDTO invalidRequest = new PaymentRequestDTO(null, "");

        mockMvc.perform(post("/api/payments")
                        .with(user(customerDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/payments/{id} returns payment response for owner")
    void getPayment_Success() throws Exception {
        when(paymentService.getPayment(eq(100L), any(User.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/payments/100")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.transactionId").value("TXN-123456"));

        verify(paymentService).getPayment(eq(100L), any(User.class));
    }

    @Test
    @DisplayName("GET /api/payments/booking/{bookingId} returns payment for specified booking")
    void getPaymentByBooking_Success() throws Exception {
        when(paymentService.getPaymentByBooking(eq(50L), any(User.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(get("/api/payments/booking/50")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(50))
                .andExpect(jsonPath("$.amount").value(250.00));

        verify(paymentService).getPaymentByBooking(eq(50L), any(User.class));
    }

    @Test
    @DisplayName("GET /api/payments returns list of payments for ADMIN")
    void getAllPayments_AdminSuccess() throws Exception {
        when(paymentService.getAllPayments()).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/payments")
                        .with(user(adminDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(100));

        verify(paymentService).getAllPayments();
    }

    @Test
    @DisplayName("GET /api/payments returns 403 Forbidden for non-ADMIN user")
    void getAllPayments_CustomerForbidden() throws Exception {
        mockMvc.perform(get("/api/payments")
                        .with(user(customerDetails)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/payments/{id}/refund refunds payment successfully")
    void refundPayment_Success() throws Exception {
        PaymentResponseDTO refundedResponse = new PaymentResponseDTO(
                100L,
                BigDecimal.valueOf(250.00),
                "CREDIT_CARD",
                "REFUNDED",
                "TXN-123456",
                50L
        );

        when(paymentService.refundPayment(eq(100L), any(User.class)))
                .thenReturn(refundedResponse);

        mockMvc.perform(patch("/api/payments/100/refund")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));

        verify(paymentService).refundPayment(eq(100L), any(User.class));
    }

    @Test
    @DisplayName("PATCH /api/payments/booking/{bookingId}/refund refunds payment by booking ID")
    void refundPaymentByBooking_Success() throws Exception {
        PaymentResponseDTO refundedResponse = new PaymentResponseDTO(
                100L,
                BigDecimal.valueOf(250.00),
                "CREDIT_CARD",
                "REFUNDED",
                "TXN-123456",
                50L
        );

        when(paymentService.refundPaymentByBooking(eq(50L), any(User.class)))
                .thenReturn(refundedResponse);

        mockMvc.perform(patch("/api/payments/booking/50/refund")
                        .with(user(customerDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(50))
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));

        verify(paymentService).refundPaymentByBooking(eq(50L), any(User.class));
    }
}
