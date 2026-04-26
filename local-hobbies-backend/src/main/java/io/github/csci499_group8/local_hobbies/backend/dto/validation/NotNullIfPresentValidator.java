package io.github.csci499_group8.local_hobbies.backend.dto.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.openapitools.jackson.nullable.JsonNullable;

public class NotNullIfPresentValidator implements ConstraintValidator<NotNullIfPresent, JsonNullable<?>> {

    @Override
    public void initialize(NotNullIfPresent constraintAnnotation) {}

    @Override
    public boolean isValid(JsonNullable<?> value, ConstraintValidatorContext context) {
        if (value == null) { //if JsonNullable wrapper is null (field is absent)
            return true;
        }

        //return if value is present and not null
        return (value.isPresent() && value.get() != null);
    }

}
