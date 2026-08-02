package com.kritagya.event_booking_system.dto.admin;

import java.util.Map;

public class UserStatisticsDTO {

    private long totalUsers;
    private long verifiedUsers;
    private long unverifiedUsers;
    private Map<String, Long> usersByRole;

    public UserStatisticsDTO() {
    }

    public UserStatisticsDTO(long totalUsers, long verifiedUsers, long unverifiedUsers, Map<String, Long> usersByRole) {
        this.totalUsers = totalUsers;
        this.verifiedUsers = verifiedUsers;
        this.unverifiedUsers = unverifiedUsers;
        this.usersByRole = usersByRole;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getVerifiedUsers() {
        return verifiedUsers;
    }

    public void setVerifiedUsers(long verifiedUsers) {
        this.verifiedUsers = verifiedUsers;
    }

    public long getUnverifiedUsers() {
        return unverifiedUsers;
    }

    public void setUnverifiedUsers(long unverifiedUsers) {
        this.unverifiedUsers = unverifiedUsers;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }
}
