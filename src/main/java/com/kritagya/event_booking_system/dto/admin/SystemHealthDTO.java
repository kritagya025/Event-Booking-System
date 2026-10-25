package com.kritagya.event_booking_system.dto.admin;

import java.time.LocalDateTime;

public class SystemHealthDTO {

    private String status;
    private long uptimeSeconds;
    private int availableProcessors;
    private long jvmFreeMemoryMB;
    private long jvmTotalMemoryMB;
    private long jvmMaxMemoryMB;
    private int activeJvmThreads;
    private LocalDateTime timestamp;

    public SystemHealthDTO() {
    }

    public SystemHealthDTO(String status, long uptimeSeconds, int availableProcessors,
                           long jvmFreeMemoryMB, long jvmTotalMemoryMB, long jvmMaxMemoryMB,
                           int activeJvmThreads, LocalDateTime timestamp) {
        this.status = status;
        this.uptimeSeconds = uptimeSeconds;
        this.availableProcessors = availableProcessors;
        this.jvmFreeMemoryMB = jvmFreeMemoryMB;
        this.jvmTotalMemoryMB = jvmTotalMemoryMB;
        this.jvmMaxMemoryMB = jvmMaxMemoryMB;
        this.activeJvmThreads = activeJvmThreads;
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public void setUptimeSeconds(long uptimeSeconds) {
        this.uptimeSeconds = uptimeSeconds;
    }

    public int getAvailableProcessors() {
        return availableProcessors;
    }

    public void setAvailableProcessors(int availableProcessors) {
        this.availableProcessors = availableProcessors;
    }

    public long getJvmFreeMemoryMB() {
        return jvmFreeMemoryMB;
    }

    public void setJvmFreeMemoryMB(long jvmFreeMemoryMB) {
        this.jvmFreeMemoryMB = jvmFreeMemoryMB;
    }

    public long getJvmTotalMemoryMB() {
        return jvmTotalMemoryMB;
    }

    public void setJvmTotalMemoryMB(long jvmTotalMemoryMB) {
        this.jvmTotalMemoryMB = jvmTotalMemoryMB;
    }

    public long getJvmMaxMemoryMB() {
        return jvmMaxMemoryMB;
    }

    public void setJvmMaxMemoryMB(long jvmMaxMemoryMB) {
        this.jvmMaxMemoryMB = jvmMaxMemoryMB;
    }

    public int getActiveJvmThreads() {
        return activeJvmThreads;
    }

    public void setActiveJvmThreads(int activeJvmThreads) {
        this.activeJvmThreads = activeJvmThreads;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
