package io.github.csci499_group8.local_hobbies.backend.dto.match;

import org.openapitools.jackson.nullable.JsonNullable;

public record SavedMatchUpdateRequest(
    JsonNullable<String> notes //nullable
) {}
