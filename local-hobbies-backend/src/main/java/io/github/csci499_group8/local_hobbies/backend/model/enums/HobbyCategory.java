package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum HobbyCategory {
    @JsonProperty("Arts and Crafts") ARTS_AND_CRAFTS,
    @JsonProperty("Cooking") COOKING,
    @JsonProperty("Education") EDUCATION,
    @JsonProperty("Fitness") FITNESS,
    @JsonProperty("Games") GAMES,
    @JsonProperty("Music") MUSIC,
    @JsonProperty("Reading") READING,
    @JsonProperty("Social") SOCIAL,
    @JsonProperty("Sports") SPORTS,
    @JsonProperty("Technology") TECHNOLOGY

    //TODO: link to hobby names
}