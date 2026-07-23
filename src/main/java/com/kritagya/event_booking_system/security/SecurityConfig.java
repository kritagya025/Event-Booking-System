package com.kritagya.event_booking_system.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          CustomUserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/venues", "/api/venues/**").permitAll()

                        // Event management — ADMIN and ORGANIZER only
                        .requestMatchers(HttpMethod.POST, "/api/events").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyRole("ADMIN", "ORGANIZER")

                        // Venue management — ADMIN and ORGANIZER only
                        .requestMatchers(HttpMethod.POST, "/api/venues").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.PUT, "/api/venues/**").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.DELETE, "/api/venues/**").hasAnyRole("ADMIN", "ORGANIZER")

                        // Seat management — ADMIN and ORGANIZER only
                        .requestMatchers(HttpMethod.POST, "/api/seats").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.PUT, "/api/seats/**").hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers(HttpMethod.DELETE, "/api/seats/**").hasAnyRole("ADMIN", "ORGANIZER")

                        // Booking — ADMIN and CUSTOMER can create and cancel
                        .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("ADMIN", "CUSTOMER")
                        .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/cancel").hasAnyRole("ADMIN", "CUSTOMER")

                        // Payment — ADMIN and CUSTOMER can create
                        .requestMatchers(HttpMethod.POST, "/api/payments").hasAnyRole("ADMIN", "CUSTOMER")

                        // Ticket generation — ADMIN and CUSTOMER
                        .requestMatchers(HttpMethod.POST, "/api/tickets/**").hasAnyRole("ADMIN", "CUSTOMER")

                        // User management — ADMIN only
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
