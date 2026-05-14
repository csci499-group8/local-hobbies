package io.github.csci499_group8.local_hobbies.backend.dto.availability.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class MaxDurationHoursValidator implements ConstraintValidator<MaxDurationHours, Duration> {
    private static long maxNumHours;

    /**
     * Hibernate instantiates the validator with a no-args constructor before Spring
     * can inject @Value. Configuring a LocalValidatorFactoryBean fails because the
     * configuration also occurs too late. By calling a setter to initialize a
     * static maxNumHours variable, Spring dependency injection applies to the
     * Hibernate validator that was created earlier.
     */
    @Value("${application.availability.max-duration-hours}")
    public void setMaxNumHours(long value) {
        MaxDurationHoursValidator.maxNumHours = value;
    }

    @Override
    public boolean isValid(Duration value, ConstraintValidatorContext context) {
        if (value == null) return true;

        boolean isValid = !value.isNegative() && value.toHours() <= maxNumHours;

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Duration must be a positive value and cannot exceed " + maxNumHours + " hours"
            ).addConstraintViolation();
        }

        return isValid;
    }
}