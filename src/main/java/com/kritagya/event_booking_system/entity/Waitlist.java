package com.kritagya.event_booking_system.entity;

import com.kritagya.event_booking_system.enums.WaitlistStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "waitlist", indexes = {
        @Index(name = "idx_waitlist_event", columnList = "event_id"),
        @Index(name = "idx_waitlist_user_event", columnList = "user_id, event_id", unique = true)
})
public class Waitlist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistStatus status = WaitlistStatus.WAITING;

    public Waitlist() {
    }

    public Waitlist(User user, Event event) {
        this.user = user;
        this.event = event;
        this.status = WaitlistStatus.WAITING;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public WaitlistStatus getStatus() { return status; }
    public void setStatus(WaitlistStatus status) { this.status = status; }
}
