package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.List;

@Mapper(componentModel = "spring",
        imports = { LocalDate.class, Period.class },
        uses = { JsonNullableMapper.class, LocationMapper.class })
public abstract class UserMapper {

    @Autowired
    protected JsonNullableMapper jsonNullableMapper;

    @Autowired
    protected LocationMapper locationMapper;

    @Value("${application.user.profile-photo-placeholder-url}")
    protected String profilePhotoPlaceholderUrl;

    // --- toEntity mappings ---

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "username", source = "request.username")
    @Mapping(target = "password", source = "passwordHash")
    @Mapping(target = "email", source = "request.email")
    @Mapping(target = "lastSessionTime", source = "creationTime")
    public abstract User toEntity(AuthSignupRequest request, String passwordHash, OffsetDateTime creationTime);

    // --- updateEntity mappings ---

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "name", expression = "java(jsonNullableMapper.unwrap(request.name(), user.getName()))")
    @Mapping(target = "birthDate", expression = "java(jsonNullableMapper.unwrap(request.birthDate(), user.getBirthDate()))")
    @Mapping(target = "locationPoint", expression = "java(jsonNullableMapper.unwrap(request.location(), user.getLocationPoint(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "locationApproximate", source = "locationApproximate")
    @Mapping(target = "publicContactInfo", expression = "java(jsonNullableMapper.unwrap(request.publicContactInfo(), user.getPublicContactInfo()))")
    @Mapping(target = "genderMatched", expression = "java(jsonNullableMapper.unwrap(request.genderMatched(), user.getGenderMatched()))")
    @Mapping(target = "showAge", expression = "java(jsonNullableMapper.unwrap(request.showAge(), user.getShowAge()))")
    @Mapping(target = "showGenderDisplayed", expression = "java(jsonNullableMapper.unwrap(request.showGenderDisplayed(), user.getShowGenderDisplayed()))")
    public abstract void updateEntity(UserOnboardingRequest request,
                                      String locationApproximate,
                                      @MappingTarget User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", expression = "java(jsonNullableMapper.unwrap(request.email(), user.getEmail()))")
    @Mapping(target = "lastSessionTime", ignore = true)
    @Mapping(target = "onboardingComplete", ignore = true)
    @Mapping(target = "name", expression = "java(jsonNullableMapper.unwrap(request.name(), user.getName()))")
    @Mapping(target = "birthDate", expression = "java(jsonNullableMapper.unwrap(request.birthDate(), user.getBirthDate()))")
    @Mapping(target = "genderDisplayed", expression = "java(jsonNullableMapper.unwrap(request.genderDisplayed(), user.getGenderDisplayed()))")
    @Mapping(target = "bio", expression = "java(jsonNullableMapper.unwrap(request.bio(), user.getBio()))")
    @Mapping(target = "locationPoint", expression = "java(jsonNullableMapper.unwrap(request.location(), user.getLocationPoint(), locationMapper::mapGeoJsonPointToPoint))")
    @Mapping(target = "locationApproximate", source = "locationApproximate")
    @Mapping(target = "publicContactInfo", expression = "java(jsonNullableMapper.unwrap(request.publicContactInfo(), user.getPublicContactInfo()))")
    @Mapping(target = "profilePhotoKey", expression = "java(jsonNullableMapper.unwrap(request.profilePhotoKey(), user.getProfilePhotoKey()))")
    @Mapping(target = "genderMatched", expression = "java(jsonNullableMapper.unwrap(request.genderMatched(), user.getGenderMatched()))")
    @Mapping(target = "showAge", expression = "java(jsonNullableMapper.unwrap(request.showAge(), user.getShowAge()))")
    @Mapping(target = "showGenderDisplayed", expression = "java(jsonNullableMapper.unwrap(request.showGenderDisplayed(), user.getShowGenderDisplayed()))")
    public abstract void updateEntity(UserUpdateRequest request,
                                      String locationApproximate,
                                      @MappingTarget User user);

    // --- toResponse mappings ---

    @Mapping(target = "locationPoint", source = "user.locationPoint") //automatically maps by calling LocationMapper method
    @Mapping(target = "profilePhotoUrl", source = "profilePhotoUrl", qualifiedByName = "useResolveUrl")
    public abstract UserResponse toResponse(User user, String profilePhotoUrl);

    @Mapping(target = "age", expression = "java(mapAge(user))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGenderDisplayed(user))")
    @Mapping(target = "profilePhotoUrl", source = "profilePhotoUrl", qualifiedByName = "useResolveUrl")
    public abstract CurrentUserProfileResponse toCurrentProfileResponse(User user, String profilePhotoUrl,
                                                                        List<HobbyResponse> hobbies,
                                                                        List<HobbyPhotoResponse> hobbyPhotos);

    @Mapping(target = "age", expression = "java(mapAge(otherUser))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGenderDisplayed(otherUser))")
    @Mapping(target = "profilePhotoUrl", source = "profilePhotoUrl", qualifiedByName = "useResolveUrl")
    public abstract OtherUserProfileResponse toOtherProfileResponse(
            User otherUser, String profilePhotoUrl, List<HobbyResponse> hobbies,
            List<HobbyPhotoResponse> hobbyPhotos, boolean isSavedMatch,
            List<HobbyOverlapResponse> overlappingHobbies,
            List<AvailabilityOverlapResponse> overlappingAvailabilities);

    // --- private helper methods ---

    protected Integer mapAge(User user) {
        if (!user.getShowAge()) return null;
        return Period.between(user.getBirthDate(), LocalDate.now()).getYears();
    }

    protected String mapGenderDisplayed(User user) {
        if (!user.getShowGenderDisplayed()) return null;
        return user.getGenderDisplayed();
    }

    @Named("useResolveUrl")
    protected String resolveUrl(String photoUrl) {
        return (photoUrl != null && !photoUrl.isBlank())
                ? photoUrl
                : profilePhotoPlaceholderUrl;
    }

}
