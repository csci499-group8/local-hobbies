package io.github.csci499_group8.local_hobbies.backend.dto.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.openapitools.jackson.nullable.JsonNullable;

public class NotNullIfPresentValidator implements ConstraintValidator<NotNullIfPresent, Object> {

    @Override
    public void initialize(NotNullIfPresent constraintAnnotation) {}

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value instanceof JsonNullable<?> jsonNullable) {
            return !jsonNullable.isPresent() //no value was passed in the JSON = is valid
                || jsonNullable.get() != null; //non-null value was passed = is valid
        }

        return value != null;
    }


}
