package io.github.csci499_group8.local_hobbies.backend.model;

import jakarta.persistence.Entity;

@Entity
public class SavedMatch {
    public Object getUserId() {
        return null;
    }

    public String getStatus() {
    }

    public void softDelete() {
        this.status = "Deleted";
    }

    public void restore() {
        this.status = "Active";
    }

}
