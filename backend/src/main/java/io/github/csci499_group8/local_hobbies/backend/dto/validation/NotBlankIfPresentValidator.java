package io.github.csci499_group8.local_hobbies.backend.dto.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.util.StringUtils;

public class NotBlankIfPresentValidator implements ConstraintValidator<NotBlankIfPresent, Object> {

    @Override
    public void initialize(NotBlankIfPresent constraintAnnotation) {}

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value instanceof JsonNullable<?> jsonNullable) {
            return !jsonNullable.isPresent() //no value was passed in the JSON = is valid
                    || StringUtils.hasText((String) jsonNullable.get()); //non-blank value was passed = is valid
        }

        return value != null;
    }

}
