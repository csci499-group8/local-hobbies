package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class WithinDaysValidator implements ConstraintValidator<WithinDays, Object> {
    private int maxDays;

    @Override
    public void initialize(WithinDays constraintAnnotation) {
        this.maxDays = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) return true;

        LocalDate dateToCheck;

        if (value instanceof LocalDate localDate) {
            dateToCheck = localDate;
        } else if (value instanceof OffsetDateTime offsetDateTime) {
            dateToCheck = offsetDateTime.toLocalDate();
        } else {
            throw new IllegalArgumentException(
                    "@WithinDays constraint can only be applied to LocalDate or OffsetDateTime");
        }

        LocalDate now = LocalDate.now();
        return !dateToCheck.isBefore(now) && !dateToCheck.isAfter(now.plusDays(maxDays));
    }

}