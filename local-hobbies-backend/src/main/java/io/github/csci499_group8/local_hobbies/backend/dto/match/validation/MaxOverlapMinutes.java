package io.github.csci499_group8.local_hobbies.backend.dto.match.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MaxOverlapMinutesValidator.class)
public @interface MaxOverlapMinutes {
    String message() default "Overlap duration exceeds the maximum allowed minutes";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}