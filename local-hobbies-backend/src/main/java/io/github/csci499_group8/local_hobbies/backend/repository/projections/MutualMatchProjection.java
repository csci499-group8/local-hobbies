package io.github.csci499_group8.local_hobbies.backend.repository.projections;

import io.github.csci499_group8.local_hobbies.backend.model.SavedMatch;
import io.github.csci499_group8.local_hobbies.backend.model.User;

import java.time.OffsetDateTime;

public interface MutualMatchProjection {
    SavedMatch getCurrentUserSavedMatch();
    User getSavedUser();
    OffsetDateTime getMutualMatchTime();
}