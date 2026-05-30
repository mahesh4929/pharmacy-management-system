package com.jvc.scmb.dtos;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Structured error response returned by SCMBControllerAdvice for every API error.
 *
 * Every error response has the same shape so the frontend can rely on a consistent contract:
 *   - timestamp: when the error occurred (server time)
 *   - status: HTTP status code (e.g. 400, 404)
 *   - error: short category of the error (e.g. "Bad Request", "Validation Failed")
 *   - message: human-readable description of what went wrong
 *   - path: the request URI that caused the error
 *   - fieldErrors: per-field validation errors, present only when @Valid fails
 *
 * @JsonInclude(NON_NULL) hides fields that are null in the response, keeping it clean.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorDto {

    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> fieldErrors;
}
