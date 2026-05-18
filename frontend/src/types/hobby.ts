export enum HobbyExperienceLevel {
    Beginner = 'Beginner',
    Intermediate = 'Intermediate',
    Advanced = 'Advanced',
}

/**
 * Request for adding a new hobby to a user profile
 */
export interface HobbyCreationRequest {
    name: string; //TODO: HobbyName enum
    experienceLevel: HobbyExperienceLevel;
}

/**
 * Request for updating a hobby
 */
export interface HobbyUpdateRequest {
    experienceLevel?: HobbyExperienceLevel;
}

/**
 * Response representing a user's specific hobby
 */
export interface HobbyResponse {
    id: string;
    name: string;
    category: string; //TODO: make HobbyCategory enum
    experienceLevel: HobbyExperienceLevel;
}

/**
 * Request for uploading a new photo to a hobby
 */
export interface HobbyPhotoCreationRequest {
    /** Unique key/path returned from the storage service after upload */
    photoKey: string;
    caption?: string | null;
}

/**
 * Request for updating hobby photo metadata
 */
export interface HobbyPhotoUpdateRequest {
    /** Should only be changed if the photo was associated with the wrong hobby */
    hobbyId?: string;
    caption?: string | null;
}

/**
 * Response containing hobby photo details and the public URL
 */
export interface HobbyPhotoResponse {
    id: string;
    hobbyId: string;
    hobbyName: string;
    /** Full URL to view the image */
    photoUrl: string;
    caption: string | null;
}

/**
 * Response for a hobby available in the global system
 */
export interface GlobalHobbyResponse {
    name: string;
    category: string;
}

/**
 * Response for a shared hobby between two users
 */
export interface HobbyOverlapResponse {
    name: string;
    currentUserExperienceLevel: HobbyExperienceLevel;
    otherUserExperienceLevel: HobbyExperienceLevel;
}