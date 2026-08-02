package com.kritagya.event_booking_system.controller;

import com.kritagya.event_booking_system.dto.UserRequestDTO;
import com.kritagya.event_booking_system.dto.UserResponseDTO;
import com.kritagya.event_booking_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails) {
        UserResponseDTO profile = userService.getCurrentUserProfile(userDetails.getUser());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.kritagya.event_booking_system.security.CustomUserDetails userDetails,
            @Valid @RequestBody com.kritagya.event_booking_system.dto.UserProfileUpdateDTO request) {
        UserResponseDTO updatedProfile = userService.updateCurrentUserProfile(userDetails.getUser(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        UserResponseDTO user = userService.getUser(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id,
                                                      @Valid @RequestBody UserRequestDTO request) {
        UserResponseDTO user = userService.updateUser(id, request);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
