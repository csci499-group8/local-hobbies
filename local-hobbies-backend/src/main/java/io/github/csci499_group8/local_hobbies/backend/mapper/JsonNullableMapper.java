package io.github.csci499_group8.local_hobbies.backend.mapper;

import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class JsonNullableMapper {

    /**
     * Unwrap method for sources that do not need to be transformed to another type.
     * unwrap() is explicitly called in @Mapper annotations because @Condition
     * JsonNullableMapper.isPresent() does not work to prevent the field from being mapped if
     * isPresent() = false. Instead, if !isPresent(), an else { set field = null; }
     * statement is generated.
     */
    public <T> T unwrap(JsonNullable<T> source, T currentValue) {
        if (source != null && source.isPresent()) { //if source value was input
            return source.get(); //return source value (including null)
        }
        return currentValue; //return mapping target's current value
    }

    /**
     * unwrap method for sources that must be transformed to another type. unwrap()
     * is explicitly called in @Mapper annotations because @Condition JsonNullableMapper.isPresent()
     * does not work to prevent the field from being mapped if isPresent() = false.
     * Instead, if !isPresent(), an else { set field = null; } statement is generated.
     */
    public <S, T> T unwrap(JsonNullable<S> source, T currentValue, Function<S, T> transformer) {
        if (source != null && source.isPresent()) { //if source value was input
            return transformer.apply(source.get()); //return transformed source value (including null)
        }

        return currentValue; //return mapping target's current value
    }

}
