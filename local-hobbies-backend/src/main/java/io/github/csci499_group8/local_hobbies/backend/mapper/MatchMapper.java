package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.match.*;
import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.MutualMatchProjection;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.SavedMatchProjection;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring",
        uses = { JsonNullableMapper.class })
public abstract class MatchMapper {

    @Autowired
    protected JsonNullableMapper jsonNullableMapper;

    @Value("${application.user.profile-photo-placeholder-url}")
    protected String profilePhotoPlaceholderUrl;

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "creationTime", ignore = true)
    public abstract SavedMatch toEntity(SavedMatchCreationRequest request, UUID userId);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "notes", expression = "java(jsonNullableMapper.unwrap(request.notes(), match.getNotes()))")
    public abstract void updateEntity(SavedMatchUpdateRequest request, @MappingTarget SavedMatch match);

    @Mapping(target = "id", source = "savedMatch.id")
    @Mapping(target = "savedUser", expression = "java(mapToMatchedUser(savedUser, savedUserProfilePhotoUrl))")
    public abstract SavedMatchResponse toSavedMatchResponse(SavedMatch savedMatch,
                                                            User savedUser,
                                                            String savedUserProfilePhotoUrl,
                                                            List<HobbyOverlapResponse> overlappingHobbies);

    @Mapping(target = "id", source = "projection.savedMatch.id")
    @Mapping(target = "savedUser", expression = "java(mapToMatchedUser(projection.getSavedUser(), savedUserProfilePhotoUrl))")
    @Mapping(target = "notes", source = "projection.savedMatch.notes")
    @Mapping(target = "creationTime", source = "projection.savedMatch.creationTime")
    public abstract SavedMatchResponse toSavedMatchResponse(SavedMatchProjection projection,
                                                            String savedUserProfilePhotoUrl,
                                                            List<HobbyOverlapResponse> overlappingHobbies);

    @Mapping(target = "matchedUser", expression = "java(mapToMatchedUser(matchedUser, matchedUserProfilePhotoUrl))")
    public abstract MatchSearchResultResponse toSearchResultResponse(User matchedUser,
                                                                     String matchedUserProfilePhotoUrl,
                                                                     MatchSearchResultResponse.MatchDistanceType distanceType,
                                                                     Double distanceKilometers,
                                                                     List<AvailabilityOverlapResponse> overlappingAvailabilities);

    @Mapping(target = "currentUserMatchId", source = "projection.currentUserSavedMatch.id")
    @Mapping(target = "savedUser", expression = "java(mapToMatchedUser(projection.getSavedUser(), savedUserProfilePhotoUrl))")
    @Mapping(target = "notes", source = "projection.currentUserSavedMatch.notes")
    @Mapping(target = "mutualMatchTime", source = "projection.mutualMatchTime")
    public abstract MutualMatchResponse toMutualMatchResponse(MutualMatchProjection projection,
                                                              String savedUserProfilePhotoUrl,
                                                              List<HobbyOverlapResponse> overlappingHobbies);

    // --- private helper methods ---

    @Mapping(target = "profilePhotoUrl", source = "profilePhotoUrl", qualifiedByName = "useResolveUrl")
    protected abstract MatchedUser mapToMatchedUser(User user, String profilePhotoUrl);


    @Named("useResolveUrl")
    protected String resolveUrl(String photoUrl) {
        return (photoUrl != null && !photoUrl.isBlank())
                ? photoUrl
                : profilePhotoPlaceholderUrl;
    }

}
