package io.github.csci499_group8.local_hobbies.backend.dto.match.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MaxOverlapMinutesValidator implements ConstraintValidator<MaxOverlapMinutes, Integer> {
    private static int maxNumMinutes;

    /**
     * Hibernate instantiates the validator with a no-args constructor before Spring
     * can inject @Value. Configuring a LocalValidatorFactoryBean fails because the
     * configuration also occurs too late. By calling a setter to initialize a
     * static maxNumMinutes variable, Spring dependency injection applies to the
     * Hibernate validator that was created earlier.
     */
    @Value("#{${application.availability.max-duration-hours} * 60}")
    public void setMaxNumMinutes(int value) {
        MaxOverlapMinutesValidator.maxNumMinutes = value;
    }

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) return true;

        boolean isValid = value >= 0 && value <= maxNumMinutes;

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Overlap must be a positive value and cannot exceed " + maxNumMinutes + " minutes"
            ).addConstraintViolation();
        }

        return isValid;    }
}
