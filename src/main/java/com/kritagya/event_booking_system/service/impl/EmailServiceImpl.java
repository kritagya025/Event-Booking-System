package com.kritagya.event_booking_system.service.impl;

import com.kritagya.event_booking_system.entity.Booking;
import com.kritagya.event_booking_system.entity.Event;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@eventbookingsystem.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendBookingConfirmationEmail(User user, Booking booking) {
        Event event = booking.getEvent();
        String subject = "Booking Confirmation - " + event.getName();

        String htmlContent = "<html><body>" +
                "<h2>Booking Confirmed!</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>Your booking for <strong>" + event.getName() + "</strong> has been confirmed.</p>" +
                "<ul>" +
                "<li><strong>Booking ID:</strong> " + booking.getId() + "</li>" +
                "<li><strong>Quantity:</strong> " + booking.getQuantity() + " ticket(s)</li>" +
                "<li><strong>Total Amount:</strong> $" + booking.getTotalAmount() + "</li>" +
                "<li><strong>Event Date:</strong> " + event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "</li>" +
                "<li><strong>Venue:</strong> " + event.getVenue().getName() + "</li>" +
                "</ul>" +
                "<p>Thank you for choosing Event Booking System!</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendBookingCancellationEmail(User user, Booking booking) {
        Event event = booking.getEvent();
        String subject = "Booking Cancellation - " + event.getName();

        String htmlContent = "<html><body>" +
                "<h2>Booking Cancelled</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>Your booking (ID: " + booking.getId() + ") for <strong>" + event.getName() + "</strong> has been cancelled.</p>" +
                "<p>If you did not request this cancellation, please contact customer support immediately.</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendEventReminderEmail(User user, Booking booking) {
        Event event = booking.getEvent();
        String subject = "Upcoming Event Reminder - " + event.getName();

        String htmlContent = "<html><body>" +
                "<h2>Event Reminder!</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>This is a reminder that your event <strong>" + event.getName() + "</strong> is scheduled for tomorrow!</p>" +
                "<ul>" +
                "<li><strong>Date:</strong> " + event.getEventDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")) + "</li>" +
                "<li><strong>Time:</strong> " + event.getStartTime() + " - " + event.getEndTime() + "</li>" +
                "<li><strong>Venue:</strong> " + event.getVenue().getName() + " (" + event.getVenue().getAddress() + ")</li>" +
                "</ul>" +
                "<p>Please have your QR code / PDF ticket ready at entry.</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendPasswordResetEmail(User user, String resetToken) {
        String subject = "Reset Your Password - Event Booking System";
        String resetLink = baseUrl + "/api/auth/reset-password?token=" + resetToken;

        String htmlContent = "<html><body>" +
                "<h2>Password Reset Request</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>We received a request to reset your password. Click the link below to set a new password:</p>" +
                "<p><a href=\"" + resetLink + "\">Reset Password</a></p>" +
                "<p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Async
    @Override
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendEmailVerificationEmail(User user, String verificationToken) {
        String subject = "Verify Your Email - Event Booking System";
        String verificationLink = baseUrl + "/api/auth/verify-email?token=" + verificationToken;

        String htmlContent = "<html><body>" +
                "<h2>Welcome to Event Booking System!</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>Please verify your email address by clicking the link below:</p>" +
                "<p><a href=\"" + verificationLink + "\">Verify Email Address</a></p>" +
                "<p>Thank you!</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Override
    @Async
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendWaitlistPromotionEmail(User user, com.kritagya.event_booking_system.entity.Event event) {
        String subject = "A Seat has Opened Up! You are Promoted - " + event.getName();

        String htmlContent = "<html><body>" +
                "<h2>Great News from Event Booking System!</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>A seat has become available for <strong>" + event.getName() + "</strong>!</p>" +
                "<p>You have been promoted from the waitlist. Please log in now to secure your booking.</p>" +
                "<p>Thank you!</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Override
    @Async
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendCouponNotificationEmail(User user, com.kritagya.event_booking_system.entity.Coupon coupon) {
        String subject = "Exclusive Discount Code: " + coupon.getCode();

        String htmlContent = "<html><body>" +
                "<h2>Special Offer For You!</h2>" +
                "<p>Dear " + user.getFirstName() + ",</p>" +
                "<p>Use promo code <strong>" + coupon.getCode() + "</strong> to get a special discount on your next booking!</p>" +
                "<p>Discount: " + coupon.getDiscountValue() + " (" + coupon.getDiscountType() + ")</p>" +
                "<p>Thank you!</p>" +
                "</body></html>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email successfully sent to: {} | Subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {} | Subject: {} | Error: {}", to, subject, e.getMessage());
        } catch (Exception e) {
            log.warn("SMTP mail server unreachable. Logged email for {}: {} | Content: {}", to, subject, htmlContent);
        }
    }
}
