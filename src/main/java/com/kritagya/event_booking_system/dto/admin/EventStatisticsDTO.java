package com.kritagya.event_booking_system.dto.admin;

import java.util.Map;

public class EventStatisticsDTO {

    private long totalEvents;
    private long publishedEvents;
    private long draftEvents;
    private long upcomingEvents;
    private long cancelledEvents;
    private Map<String, Long> eventsByCategory;

    public EventStatisticsDTO() {
    }

    public EventStatisticsDTO(long totalEvents, long publishedEvents, long draftEvents,
                              long upcomingEvents, long cancelledEvents, Map<String, Long> eventsByCategory) {
        this.totalEvents = totalEvents;
        this.publishedEvents = publishedEvents;
        this.draftEvents = draftEvents;
        this.upcomingEvents = upcomingEvents;
        this.cancelledEvents = cancelledEvents;
        this.eventsByCategory = eventsByCategory;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getPublishedEvents() {
        return publishedEvents;
    }

    public void setPublishedEvents(long publishedEvents) {
        this.publishedEvents = publishedEvents;
    }

    public long getDraftEvents() {
        return draftEvents;
    }

    public void setDraftEvents(long draftEvents) {
        this.draftEvents = draftEvents;
    }

    public long getUpcomingEvents() {
        return upcomingEvents;
    }

    public void setUpcomingEvents(long upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }

    public long getCancelledEvents() {
        return cancelledEvents;
    }

    public void setCancelledEvents(long cancelledEvents) {
        this.cancelledEvents = cancelledEvents;
    }

    public Map<String, Long> getEventsByCategory() {
        return eventsByCategory;
    }

    public void setEventsByCategory(Map<String, Long> eventsByCategory) {
        this.eventsByCategory = eventsByCategory;
    }
}
