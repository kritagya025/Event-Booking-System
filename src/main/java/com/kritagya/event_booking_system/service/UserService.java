package com.kritagya.event_booking_system.service;

import com.kritagya.event_booking_system.dto.UserRequestDTO;
import com.kritagya.event_booking_system.dto.UserResponseDTO;
import com.kritagya.event_booking_system.entity.User;
import com.kritagya.event_booking_system.exception.DuplicateEmailException;
import com.kritagya.event_booking_system.exception.UserNotFoundException;
import com.kritagya.event_booking_system.mapper.UserMapper;
import com.kritagya.event_booking_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = UserMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: id={}, email={}, role={}", savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        return UserMapper.toDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setPhone(request.getPhone());
        user.setRole(com.kritagya.event_booking_system.enums.Role.valueOf(request.getRole()));

        User updatedUser = userRepository.save(user);
        log.info("User profile updated: id={}, email={}", id, updatedUser.getEmail());
        return UserMapper.toDTO(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUserProfile(User user) {
        return UserMapper.toDTO(user);
    }

    @Transactional
    public UserResponseDTO updateCurrentUserProfile(User currentUser, com.kritagya.event_booking_system.dto.UserProfileUpdateDTO request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException(currentUser.getId()));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        User updatedUser = userRepository.save(user);
        log.info("Current user profile updated: id={}", user.getId());
        return UserMapper.toDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
        log.info("User deleted: id={}", id);
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long id, com.kritagya.event_booking_system.enums.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        log.info("User role updated: id={}, newRole={}", id, role);
        return UserMapper.toDTO(updatedUser);
    }
}

