package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HobbyCategory {
    CREATIVE_ARTS("Creative Arts"),
    COOKING("Cooking"),
    EDUCATION("Education"),
    ENGINEERING("Engineering"),
    FITNESS("Fitness"),
    GAMES("Games"),
    MUSIC("Music"),
    OUTDOORS("Outdoors"),
    READING("Reading"),
    SOCIAL("Social"),
    SPORTS("Sports");

    @JsonValue
    private final String label;

}
