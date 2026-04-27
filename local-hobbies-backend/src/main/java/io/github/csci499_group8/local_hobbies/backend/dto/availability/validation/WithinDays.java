package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = WithinDaysValidator.class)
public @interface WithinDays {
    String message() default "Date is outside the allowed scheduling window";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
