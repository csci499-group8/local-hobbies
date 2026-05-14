import {UserResponse, UserUpdateRequest} from '../user';

/**
 * UI-only data structure for UserProfileForm.
 * Birth date and location will be generalized to age and geographic area on the user's profile.
 */
export interface UserProfileUpdateRequest extends Pick<
    UserUpdateRequest,
    'name' |
    'birthDate' |
    'genderDisplayed' |
    'bio' |
    'location' |
    'publicContactInfo'
> {
    //profile photo metadata
    photo?: {
        uri: string;
        name: string;
        type: string;
    };
}

/**
 * UI-only data structure for UserSettingsForm.
 */
export interface UserSettingsUpdateRequest extends Pick<
    UserUpdateRequest,
    'email' |
    'genderMatched' |
    'showAge' |
    'showGenderDisplayed'
> {}