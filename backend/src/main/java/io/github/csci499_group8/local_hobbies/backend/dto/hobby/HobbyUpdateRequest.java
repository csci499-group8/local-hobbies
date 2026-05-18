package io.github.csci499_group8.local_hobbies.backend.dto.hobby;

import io.github.csci499_group8.local_hobbies.backend.dto.validation.NotNullIfPresent;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import org.openapitools.jackson.nullable.JsonNullable;

public record HobbyUpdateRequest(
    @NotNullIfPresent JsonNullable<HobbyExperienceLevel> experienceLevel
) {}
