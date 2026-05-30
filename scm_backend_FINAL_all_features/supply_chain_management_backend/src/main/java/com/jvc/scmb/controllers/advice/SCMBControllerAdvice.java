package com.jvc.scmb.controllers.advice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jvc.scmb.dtos.ErrorDto;
import com.jvc.scmb.exceptions.BadRequestException;
import com.jvc.scmb.exceptions.NotAuthorizedException;
import com.jvc.scmb.exceptions.NotFoundException;

import lombok.extern.slf4j.Slf4j;

/**
 * Global exception handler for all REST controllers in this package.
 *
 * Every exception thrown by a controller (directly or by a deeper layer)
 * lands here and is converted into a consistent, structured ErrorDto response.
 *
 * The frontend can rely on the SAME response shape for every error,
 * regardless of whether it came from validation, missing data, auth failure,
 * or an unexpected runtime exception.
 */
@ControllerAdvice(basePackages = "com.jvc.scmb.controllers")
@ResponseBody
@Slf4j
public class SCMBControllerAdvice {

    /**
     * Handles business rule violations and bad input — returns 400 Bad Request.
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorDto> handleBadRequestException(HttpServletRequest request, BadRequestException ex) {
        log.warn("Bad request at {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorDto errorBody = ErrorDto.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles requests for resources that don't exist — returns 404 Not Found.
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorDto> handleNotFoundException(HttpServletRequest request, NotFoundException ex) {
        log.warn("Resource not found at {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorDto errorBody = ErrorDto.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles authentication and authorization failures — returns 401 Unauthorized.
     */
    @ExceptionHandler(NotAuthorizedException.class)
    public ResponseEntity<ErrorDto> handleNotAuthorizedException(HttpServletRequest request, NotAuthorizedException ex) {
        log.warn("Unauthorized access at {}: {}", request.getRequestURI(), ex.getMessage());
        ErrorDto errorBody = ErrorDto.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorBody, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles Bean Validation failures triggered by @Valid on controller methods.
     * Collects all field errors into a Map so the response clearly tells the client
     * exactly which fields failed and why.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleValidationException(HttpServletRequest request, MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        ErrorDto errorBody = ErrorDto.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Request body has one or more invalid fields")
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    /**
     * Safety net for any uncaught exception.
     * Without this, unexpected errors (e.g. NullPointerException) would leak
     * stack traces to the client. This handler returns a generic 500 response
     * with a safe message, while the full stack trace is still logged on the server.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDto> handleGenericException(HttpServletRequest request, Exception ex) {
        // Log the full exception on the server side (for developer debugging)
        log.error("Unhandled exception caught by global handler", ex);

        ErrorDto errorBody = ErrorDto.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please contact support if the problem persists.")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
