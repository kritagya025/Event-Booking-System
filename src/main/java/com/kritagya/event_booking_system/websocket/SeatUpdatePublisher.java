package com.kritagya.event_booking_system.websocket;

import com.kritagya.event_booking_system.dto.SeatUpdateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SeatUpdatePublisher {

    private static final Logger log = LoggerFactory.getLogger(SeatUpdatePublisher.class);

    private final SimpMessagingTemplate messagingTemplate;

    public SeatUpdatePublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishSeatUpdate(Long eventId, Long seatId, String status, Integer availableSeats) {
        String destination = "/topic/events/" + eventId + "/seats";
        SeatUpdateDTO payload = new SeatUpdateDTO(eventId, seatId, status, availableSeats, LocalDateTime.now());

        log.info("Publishing real-time seat update to STOMP destination {}: seatId={}, status={}, remainingSeats={}",
                destination, seatId, status, availableSeats);

        messagingTemplate.convertAndSend(destination, payload);
    }
}
