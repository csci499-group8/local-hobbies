package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.model.enums.MatchDistanceType;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = { JsonNullableMapper.class })
public abstract class MatchMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "hobbyName", source = "request.hobby")
    @Mapping(target = "creationTime", ignore = true)
    public abstract SavedMatch toEntity(SavedMatchCreationRequest request, Integer userId);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "notes", source = "notes")
    public abstract void updateEntity(SavedMatchUpdateRequest request, @MappingTarget SavedMatch match);

    @Mapping(target = "id", source = "savedMatch.id")
    @Mapping(target = "savedUser", source = "savedUser") //automatically maps by calling mapToMatchedUser()
    @Mapping(target = "hobby", source = "savedMatch.hobbyName")
    public abstract SavedMatchResponse toSavedMatchResponse(SavedMatch savedMatch, User savedUser);

    @Mapping(target = "overlappingAvailabilities", source = "overlaps")
    public abstract MatchSearchResultResponse toSearchResultResponse(User matchedUser,
                                                     MatchDistanceType distanceType,
                                                     Double distanceKilometers,
                                                     List<AvailabilityOverlapResponse> overlaps);

    //helper method
    protected abstract MatchedUser mapToMatchedUser(User user);

}
