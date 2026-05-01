package io.github.csci499_group8.local_hobbies.backend.repository.projections;

import io.github.csci499_group8.local_hobbies.backend.model.HobbyPhoto;
import io.github.csci499_group8.local_hobbies.backend.model.enums.HobbyName;

public interface HobbyPhotoProjection {
    HobbyPhoto getHobbyPhoto();
    HobbyName getHobbyName();
}
