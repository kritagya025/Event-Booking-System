package com.kritagya.event_booking_system.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public class RevenueAnalyticsDTO {

    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private Map<String, BigDecimal> revenueByCategory;
    private Map<String, BigDecimal> dailyRevenueTrend;

    public RevenueAnalyticsDTO() {
    }

    public RevenueAnalyticsDTO(BigDecimal totalRevenue, BigDecimal todayRevenue, BigDecimal monthlyRevenue,
                               Map<String, BigDecimal> revenueByCategory, Map<String, BigDecimal> dailyRevenueTrend) {
        this.totalRevenue = totalRevenue;
        this.todayRevenue = todayRevenue;
        this.monthlyRevenue = monthlyRevenue;
        this.revenueByCategory = revenueByCategory;
        this.dailyRevenueTrend = dailyRevenueTrend;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(BigDecimal todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public Map<String, BigDecimal> getRevenueByCategory() {
        return revenueByCategory;
    }

    public void setRevenueByCategory(Map<String, BigDecimal> revenueByCategory) {
        this.revenueByCategory = revenueByCategory;
    }

    public Map<String, BigDecimal> getDailyRevenueTrend() {
        return dailyRevenueTrend;
    }

    public void setDailyRevenueTrend(Map<String, BigDecimal> dailyRevenueTrend) {
        this.dailyRevenueTrend = dailyRevenueTrend;
    }
}
