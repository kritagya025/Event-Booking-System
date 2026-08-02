package com.kritagya.event_booking_system.entity;

import com.kritagya.event_booking_system.enums.DiscountType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupon", indexes = {
        @Index(name = "idx_coupon_code", columnList = "code", unique = true)
})
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    private LocalDate expiryDate;
    private Integer usageLimit;
    private Integer usedCount = 0;
    private BigDecimal minBookingAmount = BigDecimal.ZERO;
    private boolean active = true;

    public Coupon() {
    }

    public Coupon(String code, DiscountType discountType, BigDecimal discountValue,
                  LocalDate expiryDate, Integer usageLimit, BigDecimal minBookingAmount) {
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.expiryDate = expiryDate;
        this.usageLimit = usageLimit;
        this.minBookingAmount = minBookingAmount != null ? minBookingAmount : BigDecimal.ZERO;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public BigDecimal getMinBookingAmount() {
        return minBookingAmount;
    }

    public void setMinBookingAmount(BigDecimal minBookingAmount) {
        this.minBookingAmount = minBookingAmount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
