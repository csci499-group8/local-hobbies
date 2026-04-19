package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MaxDurationHoursValidator.class)
public @interface MaxDurationHours {
    String message() default "Duration cannot exceed {value} hours";
    long value(); //number of hours (can be fractional)
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}