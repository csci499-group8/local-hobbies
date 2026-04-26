package io.github.csci499_group8.local_hobbies.backend.dto.match;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record MatchSearchRequest(
    @NotNull HobbyName hobby,
    @NotNull @Min(0) Integer radiusKilometers,
    @NotNull @Min(0) Integer minimumOverlapMinutes, //TODO: @MaxDurationHours to minutes
    @NotNull @Valid List<MatchSearchFilter> filters //may be empty
) {
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
        @JsonSubTypes.Type(value = GendersFilter.class, name = "GENDERS"),
        @JsonSubTypes.Type(value = MinAgeFilter.class, name = "MIN_AGE"),
        @JsonSubTypes.Type(value = MaxAgeFilter.class, name = "MAX_AGE"),
        @JsonSubTypes.Type(value = ExperienceLevelFilter.class, name = "EXPERIENCE_LEVEL")
    })
    public sealed interface MatchSearchFilter permits GendersFilter, MinAgeFilter,
                                                      MaxAgeFilter, ExperienceLevelFilter {
        boolean isHard();
    }

    public record GendersFilter(
        @NotEmpty List<UserGenderMatched> genders,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {
    }

    public record MinAgeFilter(
        @NotNull @Min(13) Integer minAge,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {
    }

    public record MaxAgeFilter(
        @NotNull @Max(120) Integer maxAge,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {
    }

    public record ExperienceLevelFilter(
        @NotNull HobbyExperienceLevel experienceLevel,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {
    }
}
