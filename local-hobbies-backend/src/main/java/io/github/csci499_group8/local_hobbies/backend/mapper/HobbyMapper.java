package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.model.GlobalHobby;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;
import io.github.csci499_group8.local_hobbies.backend.repository.projections.HobbyPhotoProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@Mapper(componentModel = "spring",
        uses = { JsonNullableMapper.class })
public abstract class HobbyMapper {

    @Autowired
    JsonNullableMapper jsonNullableMapper;
    @Value("${application.hobby.hobby-photo-placeholder-url}")
    protected String photoPlaceholderUrl;

    // --- toEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", source = "request.name")
    public abstract Hobby toEntity(HobbyCreationRequest request, UUID userId);

    @Mapping(target = "id", ignore = true)
    public abstract HobbyPhoto toPhotoEntity(HobbyPhotoCreationRequest request, UUID hobbyId);

    // --- updateEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "experienceLevel", expression = "java(jsonNullableMapper.unwrap(request.experienceLevel(), hobby.getExperienceLevel()))")
    public abstract void updateEntity(HobbyUpdateRequest request, @MappingTarget Hobby hobby);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hobbyId", expression = "java(jsonNullableMapper.unwrap(request.hobbyId(), photo.getHobbyId()))")
    @Mapping(target = "photoKey", ignore = true)
    @Mapping(target = "caption", expression = "java(jsonNullableMapper.unwrap(request.caption(), photo.getCaption()))")
    public abstract void updatePhotoEntity(HobbyPhotoUpdateRequest request, @MappingTarget HobbyPhoto photo);

    // --- toResponse mappings ---

    @Mapping(target = "category", source = "name.category")
    public abstract HobbyResponse toResponse(Hobby hobby);

    public abstract GlobalHobbyResponse toGlobalResponse(GlobalHobby globalHobby);

    @Mapping(target = "id", source = "hobbyPhoto.id")
    @Mapping(target = "hobbyId", source = "hobbyPhoto.hobbyId")
    @Mapping(target = "photoUrl", source = "photoUrl", qualifiedByName = "useResolveUrl")
    @Mapping(target = "caption", source = "hobbyPhoto.caption")
    public abstract HobbyPhotoResponse toPhotoResponse(HobbyPhoto hobbyPhoto, HobbyName hobbyName, String photoUrl);

    @Mapping(target = "id", source = "projection.hobbyPhoto.id")
    @Mapping(target = "hobbyId", source = "projection.hobbyPhoto.hobbyId")
    @Mapping(target = "hobbyName", source = "projection.hobbyName")
    @Mapping(target = "photoUrl", source = "photoUrl", qualifiedByName = "useResolveUrl")
    @Mapping(target = "caption", source = "projection.hobbyPhoto.caption")
    public abstract HobbyPhotoResponse toPhotoResponse(HobbyPhotoProjection projection, String photoUrl);

    // --- private helper methods ---

    @Named("useResolveUrl")
    protected String resolveUrl(String photoUrl) {
        return (photoUrl != null && !photoUrl.isBlank())
                ? photoUrl
                : photoPlaceholderUrl;
    }

}
