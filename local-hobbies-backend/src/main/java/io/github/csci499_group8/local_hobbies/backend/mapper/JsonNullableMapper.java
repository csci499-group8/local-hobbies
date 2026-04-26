package io.github.csci499_group8.local_hobbies.backend.mapper;

import org.mapstruct.Condition;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

@Component
public class JsonNullableMapper {

    public <T> T unwrap(JsonNullable<T> jsonNullable) {
        return jsonNullable != null && jsonNullable.isPresent()
            ? jsonNullable.get()
            : null;
    }

    /**
     * Map T to the target (call unwrap()) if T is present; otherwise, skip mapping
     */
    @Condition
    public <T> boolean isPresent(JsonNullable<T> jsonNullable) {
        return jsonNullable != null && jsonNullable.isPresent();
    }
}
