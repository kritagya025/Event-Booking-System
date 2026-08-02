package com.kritagya.event_booking_system.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AuditLogger {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT_LOGGER");

    public void logLogin(String email, boolean success, String ipAddress) {
        auditLog.info("[AUDIT] EVENT=LOGIN | EMAIL={} | SUCCESS={} | IP={} | TIMESTAMP={}",
                email, success, ipAddress, LocalDateTime.now());
    }

    public void logBookingCreated(Long bookingId, String userEmail, Long eventId, int quantity, Object amount) {
        auditLog.info("[AUDIT] EVENT=BOOKING_CREATED | BOOKING_ID={} | USER={} | EVENT_ID={} | QUANTITY={} | AMOUNT={} | TIMESTAMP={}",
                bookingId, userEmail, eventId, quantity, amount, LocalDateTime.now());
    }

    public void logBookingCancelled(Long bookingId, String userEmail, Long eventId) {
        auditLog.info("[AUDIT] EVENT=BOOKING_CANCELLED | BOOKING_ID={} | USER={} | EVENT_ID={} | TIMESTAMP={}",
                bookingId, userEmail, eventId, LocalDateTime.now());
    }

    public void logEventCreated(Long eventId, String eventName, String organizerEmail) {
        auditLog.info("[AUDIT] EVENT=EVENT_CREATED | EVENT_ID={} | NAME={} | ORGANIZER={} | TIMESTAMP={}",
                eventId, eventName, organizerEmail, LocalDateTime.now());
    }

    public void logEventUpdated(Long eventId, String eventName, String updatedBy) {
        auditLog.info("[AUDIT] EVENT=EVENT_UPDATED | EVENT_ID={} | NAME={} | UPDATED_BY={} | TIMESTAMP={}",
                eventId, eventName, updatedBy, LocalDateTime.now());
    }

    public void logPaymentProcessed(Long paymentId, Long bookingId, String method, String status, Object amount) {
        auditLog.info("[AUDIT] EVENT=PAYMENT_PROCESSED | PAYMENT_ID={} | BOOKING_ID={} | METHOD={} | STATUS={} | AMOUNT={} | TIMESTAMP={}",
                paymentId, bookingId, method, status, amount, LocalDateTime.now());
    }
}
