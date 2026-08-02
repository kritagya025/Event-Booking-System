package com.kritagya.event_booking_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kritagya.event_booking_system.dto.EventRequestDTO;
import com.kritagya.event_booking_system.dto.EventResponseDTO;
import com.kritagya.event_booking_system.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EventService eventService;

    private EventResponseDTO eventResponseDTO;
    private EventRequestDTO eventRequestDTO;

    @BeforeEach
    void setUp() {
        eventResponseDTO = new EventResponseDTO(1L, "Concert", "Music event",
                LocalDate.now().plusDays(10), LocalTime.of(18, 0), LocalTime.of(22, 0),
                "MUSIC", "PUBLISHED", BigDecimal.valueOf(100), 50, LocalDate.now().plusDays(5),
                1L, "Stadium", 2L, "Organizer");

        eventRequestDTO = new EventRequestDTO();
        eventRequestDTO.setName("Concert");
        eventRequestDTO.setDescription("Music event");
        eventRequestDTO.setEventDate(LocalDate.now().plusDays(10));
        eventRequestDTO.setStartTime(LocalTime.of(18, 0));
        eventRequestDTO.setEndTime(LocalTime.of(22, 0));
        eventRequestDTO.setCategory("MUSIC");
        eventRequestDTO.setStatus("PUBLISHED");
        eventRequestDTO.setTicketPrice(BigDecimal.valueOf(100));
        eventRequestDTO.setAvailableSeats(50);
        eventRequestDTO.setVenueId(1L);
    }

    @Test
    @DisplayName("GET /api/events should return paginated list of events publicly")
    void getAllEvents_Public() throws Exception {
        when(eventService.getAllEvents(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(eventResponseDTO)));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Concert"));
    }

    @Test
    @DisplayName("GET /api/events/{id} should return single event publicly")
    void getEventById_Public() throws Exception {
        when(eventService.getEvent(1L)).thenReturn(eventResponseDTO);

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Concert"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/events should be forbidden for CUSTOMER role")
    void createEvent_ForbiddenForCustomer() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequestDTO)))
                .andExpect(status().isForbidden());
    }
}
