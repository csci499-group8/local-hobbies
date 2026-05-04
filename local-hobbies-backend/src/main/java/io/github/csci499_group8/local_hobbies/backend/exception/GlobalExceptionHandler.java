package io.github.csci499_group8.local_hobbies.backend.exception;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GlobalError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    //TODO: sanitize error messages

    //TODO: replace string of invalid fields with Map<String, String> fieldErrors so frontend can map to input fields
    //400 BAD REQUEST
    @ExceptionHandler({
            //application errors
            HttpMessageNotReadableException.class, //JSON errors
            MethodArgumentTypeMismatchException.class, //path attribute type errors
            //user errors
            MethodArgumentNotValidException.class, //DTO constraint errors
            ConstraintViolationException.class, //method-level constraint errors
            IllegalArgumentException.class
    })
    public ResponseEntity<GlobalError> handleBadRequest(Exception ex, HttpServletRequest request) {
        String message = switch (ex) {
            case HttpMessageNotReadableException e -> {
                log.error("Malformed JSON request at {}: {}", request.getRequestURI(), e.getMessage());
                yield "Request body is improperly formatted";
            }
            case MethodArgumentTypeMismatchException e -> {
                log.error("Invalid path attribute type at {}: {}", request.getRequestURI(), e.getMessage());
                yield "Request path contains invalid type";
            }
            case MethodArgumentNotValidException e -> {
                String m = e.getBindingResult().getAllErrors().stream()
                            .map(DefaultMessageSourceResolvable::getDefaultMessage)
                            .collect(Collectors.joining(", "));
                log.warn("Invalid request body fields at {}: {}", request.getRequestURI(), m);
                yield "Input is invalid. Please check input fields.";
            }
            case ConstraintViolationException e -> {
                String m = e.getConstraintViolations().stream()
                            .map(ConstraintViolation::getMessage)
                            .collect(Collectors.joining(", "));
                log.warn("Invalid request non-body parameters at {}: {}", request.getRequestURI(), m);
                yield "Input is invalid. Please check input fields.";
            }
            default -> { //IllegalArgumentException; message composed in lower layer
                log.info("Bad request at {}: {}", request.getRequestURI(), ex.getMessage());
                yield ex.getMessage();
            }
        };

        return buildResponse("BAD_REQUEST", message, HttpStatus.BAD_REQUEST, request);
    }

    //401 UNAUTHORIZED
    @ExceptionHandler({
        AuthenticationException.class,
        UnauthorizedException.class,
        UsernameNotFoundException.class
    })
    public ResponseEntity<GlobalError> handleUnauthorized(Exception ex, HttpServletRequest request) {
        log.info("Unauthorized exception at {}: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse("UNAUTHORIZED", ex.getMessage(), HttpStatus.UNAUTHORIZED, request);
    }

    //403 FORBIDDEN
    @ExceptionHandler({
        AccessDeniedException.class,
        OnboardingIncompleteException.class
    })
    public ResponseEntity<GlobalError> handleForbidden(Exception ex, HttpServletRequest request) {
        String code;
        String message;
        if (ex instanceof OnboardingIncompleteException) {
            code = "ONBOARDING_INCOMPLETE";
            message = ex.getMessage();
        } else {
            code = "FORBIDDEN";
            message = "The request could not be completed due to insufficient permissions to access this resource";
        }

        log.info("Forbidden exception at {}: {}", request.getRequestURI(), message);
        return buildResponse(code, message, HttpStatus.FORBIDDEN, request);
    }

    //404 NOT FOUND
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<GlobalError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.info("Not found exception at {}: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse("RESOURCE_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    //405 METHOD NOT ALLOWED
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class) //CRUD type errors
    public ResponseEntity<GlobalError> handleMethodNotAllowed(IllegalStateException ex, HttpServletRequest request) {
        log.error("Request method exception at {}: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse("METHOD_NOT_ALLOWED", ex.getMessage(), HttpStatus.METHOD_NOT_ALLOWED, request);
    }

    //409 CONFLICT
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<GlobalError> handleConflict(IllegalStateException ex, HttpServletRequest request) {
        log.info("Conflict exception at {}: {}", request.getRequestURI(), ex.getMessage());

        return buildResponse("CONFLICT", ex.getMessage(), HttpStatus.CONFLICT, request);
    }

    //500 INTERNAL SERVER ERROR
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalError> handleGeneralError(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: ", request.getRequestURI(), ex);

        return buildResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred",
                             HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    private ResponseEntity<GlobalError> buildResponse(String code, String message,
                                                      HttpStatus status, HttpServletRequest request) {
        GlobalError error = new GlobalError(code,
                                            message,
                                            OffsetDateTime.now(),
                                            request.getRequestURI());
        return ResponseEntity.status(status).body(error);
    }
}
