package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.Nullable;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "users")
public class User {

    private Point location;

    public @NotNull Integer getId() {
    }

    public @NotBlank String getName() {
    }

    public String getProfilePhotoUrl() {
    }

    public Object getBirthDate() {
    }

    public Object getLocationPoint() {
    }

    public String getPublicContactInfo() {
    }

    public Object getGenderMatched() {
    }

    public Object getShowAge() {
        return null;
    }

    public Object getShowGenderDisplayed() {
    }

    public void setOnboardingComplete(boolean b) {
    }

    public @Nullable String getPassword() {
        return null;
    }

    public @NotNull boolean isOnboardingComplete() {
        return false;
    }
}
