package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = { JsonNullableMapper.class })
public abstract class MatchMapper {

    @Autowired
    protected JsonNullableMapper jsonNullableMapper;

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "hobbyName", source = "request.hobby")
    @Mapping(target = "creationTime", ignore = true)
    public abstract SavedMatch toEntity(SavedMatchCreationRequest request, Integer userId);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "notes", expression = "java(jsonNullableMapper.unwrap(request.notes(), match.getNotes()))")
    public abstract void updateEntity(SavedMatchUpdateRequest request, @MappingTarget SavedMatch match);

    @Mapping(target = "id", source = "savedMatch.id")
    @Mapping(target = "savedUser", source = "savedUser") //automatically maps by calling mapToMatchedUser()
    @Mapping(target = "hobby", source = "savedMatch.hobbyName")
    public abstract SavedMatchResponse toSavedMatchResponse(SavedMatch savedMatch, User savedUser);

    @Mapping(target = "overlappingAvailabilities", source = "overlaps")
    public abstract MatchSearchResultResponse toSearchResultResponse(User matchedUser,
                                                                     MatchSearchResultResponse.MatchDistanceType distanceType,
                                                                     Double distanceKilometers,
                                                                     List<AvailabilityOverlapResponse> overlaps);

    //helper method
    protected abstract MatchedUser mapToMatchedUser(User user);

}
