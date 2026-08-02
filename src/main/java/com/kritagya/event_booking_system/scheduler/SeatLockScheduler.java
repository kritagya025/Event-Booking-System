package com.kritagya.event_booking_system.scheduler;

import com.kritagya.event_booking_system.repository.SeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class SeatLockScheduler {

    private static final Logger log = LoggerFactory.getLogger(SeatLockScheduler.class);

    private final SeatRepository seatRepository;

    public SeatLockScheduler(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void releaseExpiredSeatLocks() {
        int released = seatRepository.releaseExpiredLocks(LocalDateTime.now());
        if (released > 0) {
            log.info("Released {} expired seat locks", released);
        }
    }
}
