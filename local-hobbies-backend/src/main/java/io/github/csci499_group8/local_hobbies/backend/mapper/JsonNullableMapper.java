package io.github.csci499_group8.local_hobbies.backend.mapper;

import org.mapstruct.Condition;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class JsonNullableMapper {

    //unwrap method for sources that do not need to be transformed to another type
    public <T> T unwrap(JsonNullable<T> source, T currentValue) {
        if (source != null && source.isPresent()) { //if source value was input
            return source.get(); //return source value (including null)
        }
        return currentValue; //return mapping target's current value
    }

    //unwrap method for sources that must be transformed to another type
    public <S, T> T unwrap(JsonNullable<S> source, T currentValue, Function<S, T> transformer) {
        if (source != null && source.isPresent()) { //if source value was input
            return transformer.apply(source.get()); //return transformed source value (including null)
        }

        return currentValue; //return mapping target's current value
    }

    /*
    @Condition does not work to prevent the field from being mapped if isPresent() = false;
    if !isPresent(), an else { set field = null; } statement is generated
     */
//    public <T> T unwrap(JsonNullable<T> jsonNullable) {
//        return jsonNullable != null && jsonNullable.isPresent()
//            ? jsonNullable.get()
//            : null;
//    }
//
//    /**
//     * Map T to the target (call unwrap()) if T is present; otherwise, skip mapping
//     */
//    @Condition
//    public <T> boolean isPresent(JsonNullable<T> jsonNullable) {
//        return jsonNullable != null && jsonNullable.isPresent();
//    }
}
