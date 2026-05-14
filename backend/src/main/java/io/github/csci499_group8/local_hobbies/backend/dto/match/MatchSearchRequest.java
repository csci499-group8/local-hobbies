package io.github.csci499_group8.local_hobbies.backend.dto.match;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import io.github.csci499_group8.local_hobbies.backend.dto.match.validation.MaxOverlapMinutes;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record MatchSearchRequest(
    @NotNull HobbyName hobby,
    @NotNull @Min(0) Integer radiusKilometers,
    @NotNull @Min(0) @MaxOverlapMinutes Integer minimumOverlapMinutes,
    @NotNull @Valid List<MatchSearchFilter> filters //may be empty
) {
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
        @JsonSubTypes.Type(GendersFilter.class),
        @JsonSubTypes.Type(MinAgeFilter.class),
        @JsonSubTypes.Type(MaxAgeFilter.class),
        @JsonSubTypes.Type(ExperienceLevelFilter.class)
    })
    public sealed interface MatchSearchFilter permits GendersFilter, MinAgeFilter,
                                                      MaxAgeFilter, ExperienceLevelFilter {
        boolean isHard();
    }

    @JsonTypeName("Genders")
    public record GendersFilter(
        @NotEmpty List<UserGenderMatched> genders,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {}

    @JsonTypeName("Minimum age")
    public record MinAgeFilter(
        @NotNull @Min(13) Integer minAge,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {}

    @JsonTypeName("Maximum age")
    public record MaxAgeFilter(
        @NotNull @Max(120) Integer maxAge,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {}

    @JsonTypeName("Experience level")
    public record ExperienceLevelFilter(
        @NotNull HobbyExperienceLevel experienceLevel,
        @NotNull boolean isHard
    ) implements MatchSearchFilter {}
}
