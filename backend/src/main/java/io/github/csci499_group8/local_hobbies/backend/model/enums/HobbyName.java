package io.github.csci499_group8.local_hobbies.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HobbyName {

    //creative arts
    PAINTING("Painting", HobbyCategory.CREATIVE_ARTS),
    DRAWING("Drawing", HobbyCategory.CREATIVE_ARTS),
    KNITTING("Knitting", HobbyCategory.CREATIVE_ARTS),
    WOODWORKING("Woodworking", HobbyCategory.CREATIVE_ARTS),
    POTTERY("Pottery", HobbyCategory.CREATIVE_ARTS),
    WRITING("Writing", HobbyCategory.CREATIVE_ARTS),
    PHOTOGRAPHY("Photography", HobbyCategory.CREATIVE_ARTS),

    //cooking
    BAKING("Baking", HobbyCategory.COOKING),
    GRILLING("Grilling", HobbyCategory.COOKING),
    MEAL_PREPPING("Meal Prepping", HobbyCategory.COOKING),
    FERMENTING("Fermenting", HobbyCategory.COOKING),
    CAKE_DECORATING("Cake Decorating", HobbyCategory.COOKING),

    //education
    LANGUAGE_LEARNING("Language Learning", HobbyCategory.EDUCATION),
    HISTORY("History", HobbyCategory.EDUCATION),
    SCIENCE("Science", HobbyCategory.EDUCATION),
    MATHEMATICS("Mathematics", HobbyCategory.EDUCATION),
    STUDY_GROUPS("Study Groups", HobbyCategory.EDUCATION),
    RESEARCH("Research", HobbyCategory.EDUCATION),
    ESSAY_WRITING("Essay Writing", HobbyCategory.EDUCATION),

    //engineering
    PROGRAMMING("Programming", HobbyCategory.ENGINEERING),
    ROBOTICS("Robotics", HobbyCategory.ENGINEERING),
    ELECTRONICS("Electronics", HobbyCategory.ENGINEERING),
    DIGITAL_FABRICATION("Digital Fabrication", HobbyCategory.ENGINEERING),
    MODEL_BUILDING("Model Building", HobbyCategory.ENGINEERING),

    //fitness
    RUNNING("Running", HobbyCategory.FITNESS),
    WEIGHTLIFTING("Weightlifting", HobbyCategory.FITNESS),
    YOGA("Yoga", HobbyCategory.FITNESS),
    CYCLING("Cycling", HobbyCategory.FITNESS),
    PILATES("Pilates", HobbyCategory.FITNESS),

    //games
    BOARD_GAMES("Board Games", HobbyCategory.GAMES),
    VIDEO_GAMES("Video Games", HobbyCategory.GAMES),
    CARD_GAMES("Card Games", HobbyCategory.GAMES),
    PUZZLES("Puzzles", HobbyCategory.GAMES),
    ROLE_PLAYING_GAMES("Role-Playing Games", HobbyCategory.GAMES),

    //music
    GUITAR("Guitar", HobbyCategory.MUSIC),
    PIANO("Piano", HobbyCategory.MUSIC),
    SINGING("Singing", HobbyCategory.MUSIC),
    CONCERTS("Concerts", HobbyCategory.MUSIC),
    MUSIC_PRODUCTION("Music Production", HobbyCategory.MUSIC),

    //outdoors
    HIKING("Hiking", HobbyCategory.OUTDOORS),
    CAMPING("Camping", HobbyCategory.OUTDOORS),
    FISHING("Fishing", HobbyCategory.OUTDOORS),
    GARDENING("Gardening", HobbyCategory.OUTDOORS),
    BIRD_WATCHING("Bird-Watching", HobbyCategory.OUTDOORS),

    //reading
    READING_FICTION("Reading Fiction", HobbyCategory.READING),
    READING_NONFICTION("Reading Nonfiction", HobbyCategory.READING),
    READING_COMICS("Reading Comics", HobbyCategory.READING),
    READING_POETRY("Reading Poetry", HobbyCategory.READING),
    AUDIOBOOKS("Audiobooks", HobbyCategory.READING),

    //social
    VOLUNTEERING("Volunteering", HobbyCategory.SOCIAL),
    NETWORKING("Networking", HobbyCategory.SOCIAL),
    DANCING("Dancing", HobbyCategory.SOCIAL),
    TRAVELING("Traveling", HobbyCategory.SOCIAL),
    MEETUPS("Meetups", HobbyCategory.SOCIAL),

    //sports
    SOCCER("Soccer (Football)", HobbyCategory.SPORTS),
    BASKETBALL("Basketball", HobbyCategory.SPORTS),
    TENNIS("Tennis", HobbyCategory.SPORTS),
    SWIMMING("Swimming", HobbyCategory.SPORTS),
    CRICKET("Cricket", HobbyCategory.SPORTS);

    @JsonValue
    private final String label;

    private final HobbyCategory category;

}
