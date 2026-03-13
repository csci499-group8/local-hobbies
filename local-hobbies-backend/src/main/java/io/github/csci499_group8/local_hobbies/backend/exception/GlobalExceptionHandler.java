package io.github.csci499_group8.local_hobbies.backend.exception;

import io.github.csci499_group8.local_hobbies.backend.dto.common.GlobalError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.context.support.DefaultMessageSourceResolvable;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //400 BAD REQUEST
    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            ConstraintViolationException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<GlobalError> handleBadRequest(Exception ex, HttpServletRequest request) {
        String message;
        if (ex instanceof MethodArgumentNotValidException validEx) { //if exception was thrown during DTO validation
            //message = string explaining all invalid DTO fields
            message = validEx.getBindingResult().getAllErrors().stream()
                             .map(DefaultMessageSourceResolvable::getDefaultMessage)
                             .collect(Collectors.joining(", "));
        } else if (ex instanceof ConstraintViolationException constraintEx) {
            //message = string explaining all invalid @PathVariables and @RequestParams
            message = constraintEx.getConstraintViolations().stream()
                                  .map(ConstraintViolation::getMessage)
                                  .collect(Collectors.joining(", "));
        } else {
            message = ex.getMessage();
        }

        return buildResponse("BAD_REQUEST", message, HttpStatus.BAD_REQUEST, request);
    }

    //401 UNAUTHORIZED
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<GlobalError> handleUnauthorized(Exception ex, HttpServletRequest request) {
        return buildResponse("UNAUTHORIZED", ex.getMessage(), HttpStatus.UNAUTHORIZED, request);
    }

    //403 FORBIDDEN
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<GlobalError> handleForbidden(Exception ex, HttpServletRequest request) {
        return buildResponse("FORBIDDEN", "Insufficient permissions.", HttpStatus.FORBIDDEN, request);
    }

    //404 NOT FOUND
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<GlobalError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildResponse("RESOURCE_NOT_FOUND", ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    //409 CONFLICT
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<GlobalError> handleConflict(IllegalStateException ex, HttpServletRequest request) {
        return buildResponse("CONFLICT", ex.getMessage(), HttpStatus.CONFLICT, request);
    }

    //500 INTERNAL SERVER ERROR
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalError> handleGeneralError(Exception ex, HttpServletRequest request) {
        //log exception for debugging
        ex.printStackTrace();

        return buildResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred.",
                             HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    private ResponseEntity<GlobalError> buildResponse(String code, String message,
                                                      HttpStatus status, HttpServletRequest request) {
        GlobalError error = new GlobalError(code,
                                            message,
                                            OffsetDateTime.now(),
                                            request.getRequestURI());
        return new ResponseEntity<>(error, status);
    }
}