package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.service.CalendarService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalendarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalendarService calendarService;

    @Test
    @DisplayName("GET /api/events/{id}/calendar.ics returns iCalendar attachment")
    void downloadCalendarIcs_Success() throws Exception {
        String fakeIcs = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nSUMMARY:Concert\r\nEND:VCALENDAR\r\n";
        when(calendarService.generateICalendar(10L)).thenReturn(fakeIcs);

        mockMvc.perform(get("/api/events/10/calendar.ics"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"event-10.ics\""))
                .andExpect(content().contentType("text/calendar"))
                .andExpect(content().string(fakeIcs));
    }

    @Test
    @DisplayName("GET /api/events/{id}/google-calendar-link returns Google Calendar URL")
    void getGoogleCalendarLink_Success() throws Exception {
        String mockUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Test";
        when(calendarService.generateGoogleCalendarLink(10L)).thenReturn(mockUrl);

        mockMvc.perform(get("/api/events/10/google-calendar-link"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.googleCalendarUrl").value(mockUrl));
    }
}
