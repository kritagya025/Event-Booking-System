package com.kritagya.event_booking_system.mapper;

import com.kritagya.event_booking_system.dto.TicketResponseDTO;
import com.kritagya.event_booking_system.entity.Ticket;

public class TicketMapper {

    public static TicketResponseDTO toDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getQrCode(),
                ticket.getIssueDate(),
                ticket.getCheckInTime(),
                ticket.getTicketStatus().name(),
                ticket.getBooking().getId()
        );
    }
}
