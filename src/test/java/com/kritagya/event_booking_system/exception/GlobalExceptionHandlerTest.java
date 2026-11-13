package com.kritagya.event_booking_system.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("ResourceNotFoundException returns HTTP 404")
    void handleResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Event not found");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Event not found", response.getBody().getMessage());
    }

    @Test
    @DisplayName("DuplicateResourceException returns HTTP 409")
    void handleDuplicateResource() {
        DuplicateResourceException ex = new DuplicateResourceException("Email already in use");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDuplicateResource(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Email already in use", response.getBody().getMessage());
    }

    @Test
    @DisplayName("MethodArgumentNotValidException returns HTTP 400 with field errors")
    void handleValidationErrors() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "email", "must be a well-formed email address");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationErrors(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertEquals("must be a well-formed email address", response.getBody().getDetails().get("email"));
    }

    @Test
    @DisplayName("ConstraintViolationException returns HTTP 400 with violation details")
    void handleConstraintViolation() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("quantity");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must be greater than or equal to 1");

        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleConstraintViolation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Validation constraint failed", response.getBody().getMessage());
        assertEquals("must be greater than or equal to 1", response.getBody().getDetails().get("quantity"));
    }

    @Test
    @DisplayName("MissingServletRequestParameterException returns HTTP 400")
    void handleMissingParameter() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("token", "String");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleMissingParameter(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Required parameter 'token' is missing"));
    }

    @Test
    @DisplayName("MethodArgumentTypeMismatchException returns HTTP 400")
    void handleTypeMismatch() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("id");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Parameter 'id' has invalid format or type"));
    }

    @Test
    @DisplayName("IllegalArgumentException returns HTTP 400")
    void handleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid ticket count");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid ticket count", response.getBody().getMessage());
    }

    @Test
    @DisplayName("IllegalStateException returns HTTP 400")
    void handleIllegalState() {
        IllegalStateException ex = new IllegalStateException("Booking already cancelled");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalState(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Booking already cancelled", response.getBody().getMessage());
    }

    @Test
    @DisplayName("MaxUploadSizeExceededException returns HTTP 400")
    void handleMaxUploadSizeExceeded() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(20000000);
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleMaxUploadSizeExceeded(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("File size exceeds maximum limit"));
    }

    @Test
    @DisplayName("BadCredentialsException returns HTTP 401")
    void handleBadCredentials() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBadCredentials(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid email or password", response.getBody().getMessage());
    }

    @Test
    @DisplayName("AccessDeniedException returns HTTP 403")
    void handleAccessDenied() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Access denied"));
    }

    @Test
    @DisplayName("TokenExpiredException returns HTTP 401")
    void handleTokenExpired() {
        TokenExpiredException ex = new TokenExpiredException("Token has expired");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleTokenExpired(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Token has expired", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Generic Exception returns HTTP 500")
    void handleGenericException() {
        Exception ex = new RuntimeException("Unexpected internal failure");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
    }
}
