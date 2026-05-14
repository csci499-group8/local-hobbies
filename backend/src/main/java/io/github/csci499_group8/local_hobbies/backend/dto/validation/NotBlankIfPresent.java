package io.github.csci499_group8.local_hobbies.backend.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotBlankIfPresentValidator.class)
@Documented
public @interface NotBlankIfPresent {
    String message() default "Field must not be blank if the field is included in the request";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
