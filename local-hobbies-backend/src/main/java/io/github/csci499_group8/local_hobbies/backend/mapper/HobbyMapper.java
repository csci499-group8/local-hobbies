package io.github.csci499_group8.local_hobbies.backend.mapper;

import io.github.csci499_group8.local_hobbies.backend.dto.hobby.*;
import io.github.csci499_group8.local_hobbies.backend.model.GlobalHobby;
import io.github.csci499_group8.local_hobbies.backend.model.Hobby;
import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface HobbyMapper {

    // --- toEntity mappings ---

    //TODO: fill out annotations

    Hobby toEntity(HobbyCreationRequest request, Integer userId);

    void updateEntity(HobbyUpdateRequest request, Hobby hobby);

    HobbyPhoto toPhotoEntity(HobbyPhotoCreationRequest request, Integer userId);

    void updatePhotoEntity(HobbyPhotoUpdateRequest request, HobbyPhoto photo);

    // --- toResponse mappings ---

    HobbyResponse toResponse(Hobby hobby);

    GlobalHobbyResponse toGlobalResponse(GlobalHobby globalHobby);

    HobbyPhotoResponse toPhotoResponse(HobbyPhoto hobbyPhoto);

}
