package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.common.GeoJsonPoint;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.mapstruct.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
@RequiredArgsConstructor
public abstract class UserMapper {

    private final GeometryFactory geometryFactory;

    // --- toEntity mappings ---

    //signup request creates user
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "username", source = "request.username")
    @Mapping(target = "password", source = "passwordHash")
    @Mapping(target = "email", source = "request.email")
    public abstract User toEntity(AuthSignupRequest request, String passwordHash);

    // --- updateEntity mappings ---

    //onboarding request updates user
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "name", source = "name")
    @Mapping(target = "birthDate", source = "birthDate")
    @Mapping(target = "locationPoint", expression = "java(mapLocationPoint(request.location()))")
    @Mapping(target = "publicContactInfo", source = "publicContactInfo")
    @Mapping(target = "genderMatched", source = "genderMatched")
    public abstract void updateEntity(UserOnboardingRequest request, String locationApproximate, @MappingTarget User user);

    //update request updates user
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "lastSessionTime", ignore = true)
    @Mapping(target = "onboardingComplete", ignore = true)
    @Mapping(target = "locationPoint", expression = "java(mapLocationPoint(request.location()))")
    public abstract void updateEntity(UserUpdateRequest request, String locationApproximate, @MappingTarget User user);

    // --- toResponse mappings ---

    //user maps to user response
    public abstract UserResponse toResponse(User user);

    //user + hobby info maps to current user profile response
    @Mapping(target = "age", expression = "java(mapAge(user))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGender(user))")
    public abstract CurrentUserProfileResponse toCurrentProfileResponse(
        User user, List<HobbyResponse> hobbies, List<HobbyPhotoResponse> hobbyPhotos);

    //user + hobby info + overlap info maps to other user profile response
    @Mapping(target = "age", expression = "java(mapAge(user))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGender(user))")
    public abstract OtherUserProfileResponse toOtherProfileResponse(
            UserResponse otherUser, List<HobbyResponse> hobbies, List<HobbyPhotoResponse> hobbyPhotos,
            boolean isSavedMatch, List<HobbyOverlapResponse> overlappingHobbies,
            List<AvailabilityOverlapResponse> overlappingAvailabilities);

    // --- private helper methods ---

    private Point mapLocationPoint(GeoJsonPoint point) {
        if (point.getLatitude() == null || point.getLongitude() == null) return null;
        return geometryFactory.createPoint(new Coordinate(point.getLongitude(), point.getLatitude()));
    }

    private Integer mapAge(User user) {
        if (!user.isShowAge()) return null;
        return Period.between(user.getBirthDate(), LocalDate.now()).getYears();
    }

    private String mapGenderDisplayed(User user) {
        if (!user.isShowGenderDisplayed()) return null;
        return user.getGenderDisplayed();
    }

}

TODO:
//TODO:
/**
 * It is impossible to distinguish between empty fields and fields
 * set to null. Solution: use Optional fields in the DTO.
 *
 * Example:
 * public record UserUpdateRequest(
 *     Optional<String> name,
 *     Optional<String> location
 * ) {}
 *
 * Now you can distinguish:
 * DTO value	        Meaning
 * Optional.empty()	    set field to null
 * Optional.of(value)	update value
 * null	                field not provided
 *
 * MapStruct supports this with custom mappings.
 */