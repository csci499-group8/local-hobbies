package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.auth.AuthSignupRequest;
import io.github.csci499_group8.local_hobbies.backend.dto.availability.AvailabilityOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyOverlapResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyPhotoResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.hobby.HobbyResponse;
import io.github.csci499_group8.local_hobbies.backend.dto.user.*;
import io.github.csci499_group8.local_hobbies.backend.model.User;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.List;

@Mapper(componentModel = "spring",
        imports = { LocalDate.class, Period.class },
        uses = { JsonNullableMapper.class, LocationMapper.class })
public abstract class UserMapper {

    // --- toEntity mappings ---

    //signup request creates user
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "username", source = "request.username")
    @Mapping(target = "password", source = "passwordHash")
    @Mapping(target = "email", source = "request.email")
    @Mapping(target = "lastSessionTime", source = "creationTime")
    public abstract User toEntity(AuthSignupRequest request, String passwordHash, OffsetDateTime creationTime);

    // --- updateEntity mappings ---

    //onboarding request updates user
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "name", source = "request.name")
    @Mapping(target = "birthDate", source = "request.birthDate")
    @Mapping(target = "locationPoint", source = "request.location") //automatically maps by calling LocationMapper method
    @Mapping(target = "locationApproximate", source = "locationApproximate")
    @Mapping(target = "publicContactInfo", source = "request.publicContactInfo")
    @Mapping(target = "genderMatched", source = "request.genderMatched")
    @Mapping(target = "showAge", source = "request.showAge")
    @Mapping(target = "showGenderDisplayed", source = "request.showGenderDisplayed")
    public abstract void updateEntity(UserOnboardingRequest request,
                                      String locationApproximate,
                                      @MappingTarget User user);

    //update request updates user
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "lastSessionTime", ignore = true)
    @Mapping(target = "onboardingComplete", ignore = true)
    @Mapping(target = "locationPoint", source = "request.location") //automatically maps by calling LocationMapper method
    @Mapping(target = "locationApproximate", source = "locationApproximate")
    public abstract void updateEntity(UserUpdateRequest request,
                                      String locationApproximate,
                                      @MappingTarget User user);

    // --- toResponse mappings ---

    //user maps to user response
    @Mapping(target = "locationPoint", source = "user.locationPoint") //automatically maps by calling LocationMapper method
    public abstract UserResponse toResponse(User user);

    //user + hobby info maps to current user profile response
    @Mapping(target = "age", expression = "java(mapAge(user))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGenderDisplayed(user))")
    public abstract CurrentUserProfileResponse toCurrentProfileResponse(
        User user, List<HobbyResponse> hobbies, List<HobbyPhotoResponse> hobbyPhotos);

    //user + hobby info + overlap info maps to other user profile response
    @Mapping(target = "age", expression = "java(mapAge(otherUser))")
    @Mapping(target = "genderDisplayed", expression = "java(mapGenderDisplayed(otherUser))")
    public abstract OtherUserProfileResponse toOtherProfileResponse(
            User otherUser, List<HobbyResponse> hobbies, List<HobbyPhotoResponse> hobbyPhotos,
            boolean isSavedMatch, List<HobbyOverlapResponse> overlappingHobbies,
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

}

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
