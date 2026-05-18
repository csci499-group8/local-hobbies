import { AvailabilityOverlapResponse } from './availability';
import {HobbyExperienceLevel, HobbyOverlapResponse} from './hobby';
import {UserGenderMatched} from "./user";

/**
 * Category of the calculated shortest distance between the users. 'Home' indicates
 * the shortest distance is between the users' default locations. 'Nearest overlapping
 * availability' indicates the distance is between the users' geographically closest
 * overlapping availabilities
 */
export enum MatchDistanceType {
    Home = 'Home',
    NearestOverlappingAvailability = 'Nearest overlapping availability',
}

/**
 * Match search request containing always-required and omittable filters
 */
export interface MatchSearchRequest {
    hobby: string; // HobbyName
    radiusKilometers: number;
    minimumOverlapMinutes: number;
    filters: MatchSearchFilter[];
}

/**
 * Polymorphic search filters; may be omitted from search or, if present,
 * may be required (hard) or used just for sorting results
 */

export type MatchSearchFilter =
    | GendersFilter
    | MinAgeFilter
    | MaxAgeFilter
    | ExperienceLevelFilter;

interface BaseFilter {
    isHard: boolean;
}

export interface GendersFilter extends BaseFilter {
    type: 'Genders';
    genders: UserGenderMatched[];
}

export interface MinAgeFilter extends BaseFilter {
    type: 'Minimum age';
    minAge: number;
}

export interface MaxAgeFilter extends BaseFilter {
    type: 'Maximum age';
    maxAge: number;
}

export interface ExperienceLevelFilter extends BaseFilter {
    type: 'Experience level';
    experienceLevel: HobbyExperienceLevel;
}

/**
 * Match search result carrying information about matched user and about how accessible the user is
 */
export interface MatchSearchResultResponse {
    matchedUser: MatchedUser;
    /** Boolean representing whether the matched user has already saved the current user as a match */
    hasSavedCurrentUser: boolean;
    distanceType: MatchDistanceType;
    distanceKilometers: number;
    overlappingAvailabilities: AvailabilityOverlapResponse[];
}

/**
 * Basic info for a user returned in search results or saved matches
 */
export interface MatchedUser {
    id: string;
    name: string;
    profilePhotoUrl: string | null;
    /** ISO 8601 UTC timestamp */
    lastSessionTime: string;
}

/**
 * SavedMatch types
 */

export interface SavedMatchCreationRequest {
    savedUserId: string;
    notes?: string | null;
}

export interface SavedMatchUpdateRequest {
    notes?: string | null;
}

export interface SavedMatchResponse {
    id: string;
    savedUser: MatchedUser;
    overlappingHobbies: HobbyOverlapResponse[];
    notes: string | null;
    /** ISO 8601 UTC timestamp */
    creationTime: string;
}

/**
 * Mutual match response; similar to SavedMatchResponse but contains mutual match time
 */
export interface MutualMatchResponse {
    currentUserMatchId: string;
    savedUser: MatchedUser;
    overlappingHobbies: HobbyOverlapResponse[];
    notes: string | null;
    /** ISO 8601 UTC timestamp */
    mutualMatchTime: string;
    contactInfo: string;
}