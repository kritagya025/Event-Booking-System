package com.kritagya.event_booking_system.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Event Booking System API")
                        .version("1.0.0")
                        .description("Production-grade RESTful API for event ticket booking management. "
                                + "Features real-time seat allocation, JWT authentication with RBAC, "
                                + "QR code ticket validation, iCalendar exports, and audit logging.")
                        .contact(new Contact()
                                .name("EventHub Platform Engineering")
                                .email("support@eventhub.com")
                                .url("https://github.com/kritagya025/Event-Booking-System"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .tags(List.of(
                        new Tag().name("Bookings").description("Booking creation, cancellation, and retrieval"),
                        new Tag().name("Events").description("Event lifecycle, discovery, and management"),
                        new Tag().name("Calendar").description("iCalendar (.ics) exports and Google Calendar sync"),
                        new Tag().name("Images").description("Banner and venue image storage and serving"),
                        new Tag().name("Tickets").description("Ticket issuance, PDF generation, and QR retrieval"),
                        new Tag().name("Authentication").description("User registration, login, and token refresh")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .name("Bearer Authentication")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT Bearer token obtained from /api/auth/login")));
    }
}
