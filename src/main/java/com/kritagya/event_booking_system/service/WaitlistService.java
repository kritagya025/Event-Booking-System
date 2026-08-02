package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.entity.Waitlist;
import com.kritagya.event_booking_system.enums.WaitlistStatus;
import com.kritagya.event_booking_system.exception.EventNotFoundException;
import com.kritagya.event_booking_system.repository.EventRepository;
import com.kritagya.event_booking_system.repository.WaitlistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WaitlistService {

    private static final Logger log = LoggerFactory.getLogger(WaitlistService.class);

    private final WaitlistRepository waitlistRepository;
    private final EventRepository eventRepository;
    private final EmailService emailService;

    public WaitlistService(WaitlistRepository waitlistRepository,
                           EventRepository eventRepository,
                           EmailService emailService) {
        this.waitlistRepository = waitlistRepository;
        this.eventRepository = eventRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void joinWaitlist(Long eventId, User user) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (waitlistRepository.existsByUserIdAndEventIdAndStatus(user.getId(), eventId, WaitlistStatus.WAITING)) {
            throw new IllegalArgumentException("You are already on the waitlist for this event.");
        }

        Waitlist waitlist = new Waitlist(user, event);
        waitlistRepository.save(waitlist);

        log.info("User {} joined waitlist for event {}", user.getEmail(), eventId);
    }

    @Transactional
    public void leaveWaitlist(Long eventId, User user) {
        Optional<Waitlist> optionalWaitlist = waitlistRepository.findByUserIdAndEventId(user.getId(), eventId);

        if (optionalWaitlist.isEmpty()) {
            throw new IllegalArgumentException("You are not on the waitlist for this event.");
        }

        Waitlist waitlist = optionalWaitlist.get();
        waitlist.setStatus(WaitlistStatus.CANCELLED);
        waitlistRepository.save(waitlist);

        log.info("User {} left waitlist for event {}", user.getEmail(), eventId);
    }

    @Transactional
    public void autoPromoteFirstWaitingUser(Long eventId) {
        List<Waitlist> waitingUsers = waitlistRepository
                .findByEventIdAndStatusOrderByCreatedAtAsc(eventId, WaitlistStatus.WAITING);

        if (waitingUsers.isEmpty()) {
            log.info("No users on waitlist for event {}", eventId);
            return;
        }

        Waitlist firstInLine = waitingUsers.get(0);
        firstInLine.setStatus(WaitlistStatus.NOTIFIED);
        waitlistRepository.save(firstInLine);

        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            try {
                emailService.sendWaitlistPromotionEmail(firstInLine.getUser(), event);
            } catch (Exception e) {
                log.error("Failed to send waitlist promotion email to user {}: {}",
                        firstInLine.getUser().getEmail(), e.getMessage());
            }
        }

        log.info("Auto-promoted user {} from waitlist for event {}",
                firstInLine.getUser().getEmail(), eventId);
    }

    @Transactional(readOnly = true)
    public Long getWaitlistCount(Long eventId) {
        return waitlistRepository.countByEventIdAndStatus(eventId, WaitlistStatus.WAITING);
    }
}
