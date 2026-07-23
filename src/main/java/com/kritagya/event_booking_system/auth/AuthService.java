package com.kritagya.event_booking_system.auth;

import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.enums.Role;
import com.kritagya.event_booking_system.exception.DuplicateEmailException;
import com.kritagya.event_booking_system.repository.UserRepository;
import com.kritagya.event_booking_system.security.CustomUserDetails;
import com.kritagya.event_booking_system.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                Role.CUSTOMER
        );

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponseDTO(token, savedUser.getEmail(), savedUser.getRole().name());
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponseDTO(
                token,
                userDetails.getUsername(),
                userDetails.getUser().getRole().name()
        );
    }
}
