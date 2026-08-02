package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.User;

public interface EmailService {

    void sendBookingConfirmationEmail(User user, Booking booking);

    void sendBookingCancellationEmail(User user, Booking booking);

    void sendEventReminderEmail(User user, Booking booking);

    void sendPasswordResetEmail(User user, String resetToken);

    void sendEmailVerificationEmail(User user, String verificationToken);

    void sendWaitlistPromotionEmail(User user, com.kritagya.event_booking_system.entity.Event event);

    void sendCouponNotificationEmail(User user, com.kritagya.event_booking_system.entity.Coupon coupon);
}
