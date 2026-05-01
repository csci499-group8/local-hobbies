package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Maximum duration of an availability. The configured value cannot exceed 168
 * hours (1 week; enforced by database).
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MaxDurationHoursValidator.class)
public @interface MaxDurationHours {
    String message() default "Duration exceeds the maximum allowed hours";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}