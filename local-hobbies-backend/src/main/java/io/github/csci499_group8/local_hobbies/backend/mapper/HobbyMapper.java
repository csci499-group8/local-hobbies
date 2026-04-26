package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.model.GlobalHobby;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring",
        uses = { JsonNullableMapper.class })
public abstract class HobbyMapper {

    @Autowired
    JsonNullableMapper jsonNullableMapper;

    // --- toEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hobbyName", source = "request.name")
    public abstract Hobby toEntity(HobbyCreationRequest request, Integer userId);

    @Mapping(target = "id", ignore = true)
    public abstract HobbyPhoto toPhotoEntity(HobbyPhotoCreationRequest request, Integer hobbyId);

    // --- updateEntity mappings ---

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "hobbyName", ignore = true)
    @Mapping(target = "experienceLevel", expression = "java(jsonNullableMapper.unwrap(request.experienceLevel(), hobby.getExperienceLevel()))")
    public abstract void updateEntity(HobbyUpdateRequest request, @MappingTarget Hobby hobby);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hobbyId", expression = "java(jsonNullableMapper.unwrap(request.hobbyId(), photo.getHobbyId()))")
    @Mapping(target = "photoUrl", ignore = true)
    @Mapping(target = "caption", expression = "java(jsonNullableMapper.unwrap(request.caption(), photo.getCaption()))")
    public abstract void updatePhotoEntity(HobbyPhotoUpdateRequest request, @MappingTarget HobbyPhoto photo);

    // --- toResponse mappings ---

    @Mapping(target = "name", source = "hobbyName")
    @Mapping(target = "category", source = "hobbyName.category")
    public abstract HobbyResponse toResponse(Hobby hobby);

    public abstract GlobalHobbyResponse toGlobalResponse(GlobalHobby globalHobby);

    public abstract HobbyPhotoResponse toPhotoResponse(HobbyPhoto hobbyPhoto);

}
