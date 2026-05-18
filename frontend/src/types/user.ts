import { GeoJsonPoint } from './common';
import { HobbyCreationRequest, HobbyResponse, HobbyOverlapResponse, HobbyPhotoResponse } from './hobby';
import { AvailabilityOnboardingRequests, AvailabilityOverlapResponse } from './availability';

/**
 * Gender used for matching users (freeform gender description is available in user's profile)
 */
export enum UserGenderMatched {
    Man = 'Man',
    Nonbinary = 'Nonbinary',
    Woman = 'Woman',
}

/**
 * Name of onboarding section, used to indicate which sections are incomplete
 */
export enum OnboardingSectionName {
    Name = 'name',
    BirthDate = 'birthDate',
    Location = 'location',
    ContactInfo = 'contactInfo',
    GenderMatched = 'genderMatched',
    ShowAge = 'showAge',
    ShowGenderDisplayed = 'showGenderDisplayed',
    Hobbies = 'hobbies',
    Availabilities = 'availabilities',
}

/**
 * Way in which an onboarding section is incomplete
 */
export enum IncompleteReason {
    NoValue = 'No value',
    MinCountNotMet = 'Minimum number of entries not met',
}

/**
 * Onboarding types
 */

export interface UserOnboardingStatusResponse {
    incompleteSections: UserOnboardingIncompleteSection[];
}

export interface UserOnboardingIncompleteSection {
    name: OnboardingSectionName;
    reason: IncompleteReason;
}

export interface UserOnboardingRequest {
    name?: string;
    /** ISO 8601 date (YYYY-MM-DD) */
    birthDate?: string;
    location?: GeoJsonPoint;
    contactInfo?: string;
    genderMatched?: UserGenderMatched;
    showAge?: boolean;
    showGenderDisplayed?: boolean;
    hobbies?: HobbyCreationRequest[];
    availabilities?: AvailabilityOnboardingRequests;
}

/**
 * User types
 */

export interface UserUpdateRequest {
    email?: string;
    name?: string;
    /** ISO 8601 date */
    birthDate?: string;
    genderDisplayed?: string | null;
    bio?: string | null;
    location?: GeoJsonPoint;
    contactInfo?: string;
    /** Key for cloud storage, null if removing */
    profilePhotoKey?: string | null;
    genderMatched?: UserGenderMatched;
    showAge?: boolean;
    showGenderDisplayed?: boolean;
}

export interface UserResponse {
    username: string;
    email: string;
    name: string;
    /** ISO 8601 date */
    birthDate: string;
    genderDisplayed: string | null;
    bio: string | null;
    locationPoint: GeoJsonPoint;
    locationApproximate: string;
    contactInfo: string;
    profilePhotoUrl: string | null;
    genderMatched: UserGenderMatched;
    showAge: boolean;
    showGenderDisplayed: boolean;
}

/**
 * Profile types
 */

export interface CurrentUserProfileResponse {
    name: string;
    /** Null if showAge is false */
    age: number | null;
    /** Null if not set or if showGenderDisplayed is false */
    genderDisplayed: string | null;
    bio: string | null;
    locationApproximate: string;
    contactInfo: string;
    profilePhotoUrl: string | null;
    hobbies: HobbyResponse[];
    hobbyPhotos: HobbyPhotoResponse[];
}

export interface OtherUserProfileResponse {
    id: string;
    name: string;
    age: number | null;
    genderDisplayed: string | null;
    bio: string | null;
    locationApproximate: string;
    /** Null if not a mutual match */
    contactInfo: string | null;
    profilePhotoUrl: string | null;
    /** ISO 8601 UTC timestamp */
    lastSessionTime: string;
    hobbies: HobbyResponse[];
    hobbyPhotos: HobbyPhotoResponse[];
    isSavedMatch: boolean;
    isMutualMatch: boolean;
    overlappingHobbies: HobbyOverlapResponse[];
    overlappingAvailabilities: AvailabilityOverlapResponse[];
}

/**
 * Homepage response containing minimal user information for display, as well as
 * summaries of the user's hobbies, availabilities, and matches
 */
export interface UserHomepageResponse {
    user: {
        name: string;
        profilePhotoUrl: string | null;
    };
    hobbySummary: {
        count: number;
    };
    availabilitySummary: {
        // TODO: implement meetup bookings on backend
    };
    matchSummary: {
        /** Number of people who saved this user as a match */
        inboundMatchCount: number;
        /** Number of matches that are mutual */
        mutualMatchCount: number;
    };
}