package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.MatchSearchResultResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.SavedMatchCreationRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.match.SavedMatchResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.SavedMatchUpdateRequest;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MatchMapper {

    SavedMatch toEntity(SavedMatchCreationRequest request, Integer userId);

    void updateEntity(SavedMatchUpdateRequest request, @MappingTarget SavedMatch match);

    SavedMatchResponse toResponse(SavedMatch savedMatch);

    MatchSearchResultResponse toResponse(User matchedUser, List<AvailabilityOverlapResponse> overlaps)

}
