package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.Duration;

public class MaxDurationHoursValidator implements ConstraintValidator<MaxDurationHours, Duration> {
    private long maxHours;

    @Override
    public void initialize(MaxDurationHours constraintAnnotation) {
        this.maxHours = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(Duration value, ConstraintValidatorContext context) {
        if (value == null) return true;

        return !value.isNegative() && value.toHours() <= maxHours;
    }
}