package io.github.csci499_group8.local_hobbies.backend.dto.match;

import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyExperienceLevel;
import io.github.csci499_group8.local_hobbies.backend.model.enums.UserGenderMatched;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

public record MatchSearchRequest(
    @NotBlank String hobby,
    @NotNull @Min(0) Integer radiusKilometers,
    @NotNull @Min(0) Integer minimumOverlapMinutes, //TODO: @MaxDurationHours to minutes
    @NotNull @Valid SearchFilters filters,
    @NotNull List<String> hardFilters,
    @NotNull List<String> softFilters
) {
    public record SearchFilters(
        List<UserGenderMatched> genders,
        @Min(13) Integer minAge,
        @Max(120) Integer maxAge,
        //TODO: @Min(2) @Max(5) Integer groupSize,
        HobbyExperienceLevel experienceLevel
        //TODO: AvailabilityType availabilityType
    ) {}

    @AssertTrue(message = "Hard and soft filters must be a subset of available filter fields")
    private boolean isFilterSubsetValid() {
        //TODO: convert values to enum
        Set<String> validKeys = Set.of(
            "genders", "minAge", "maxAge", "experienceLevel"
        );

        //check if all elements in both lists exist in validKeys
        return validKeys.containsAll(hardFilters) && validKeys.containsAll(softFilters);
    }

    @AssertTrue(message = "Filters cannot be both hard and soft, and all selected filters must have values.")
    private boolean isFilterConfigurationValid() {
        //check that no filter exists in both lists
        boolean isDisjoint = Collections.disjoint(hardFilters, softFilters);
        if (!isDisjoint) return false;

        //check that every hard and soft filter has a value in the filters object
        return Stream.concat(hardFilters.stream(), softFilters.stream())
                     .allMatch(this::isFilterValueSet);
    }

    private boolean isFilterValueSet(String filterName) {
        return switch (filterName) {
            case "genders" -> filters.genders() != null && !filters.genders().isEmpty();
            case "minAge" -> filters.minAge() != null;
            case "maxAge" -> filters.maxAge() != null;
            case "experienceLevel" -> filters.experienceLevel() != null;
            default -> false;
        };
    }
}
