package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Component
public class WithinDaysValidator implements ConstraintValidator<WithinDays, Object> {
    private static int maxNumDays;

    /**
     * Hibernate instantiates the validator with a no-args constructor before Spring
     * can inject @Value. Configuring a LocalValidatorFactoryBean fails because the
     * configuration also occurs too late. By calling a setter to initialize a
     * static maxNumDays variable, Spring dependency injection applies to the
     * Hibernate validator that was created earlier.
     */
    @Value("${application.availability.scheduling-window-days}")
    public void setMaxNumMinutes(int value) {
        WithinDaysValidator.maxNumDays = value;
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

        boolean isValid = !dateToCheck.isBefore(now) && !dateToCheck.isAfter(now.plusDays(maxNumDays));

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Date must be between today and " + maxNumDays + " days in the future"
            ).addConstraintViolation();
        }

        return isValid;
    }

}