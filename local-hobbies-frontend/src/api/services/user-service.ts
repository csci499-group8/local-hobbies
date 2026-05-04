import apiClient from '../config';
import {
    UserOnboardingRequest,
    UserOnboardingStatusResponse,
    UserUpdateRequest,
    UserResponse,
    UserHomepageResponse,
    CurrentUserProfileResponse,
    OtherUserProfileResponse
} from '../../types/user';
import { AuthResponse } from '../../types/auth';
import {UploadUrlRequest, UploadUrlResponse} from '../../types/common';
import {handleGeneralError} from "@/src/utils/error-helpers";

const userService = {
    /**
     * Get the onboarding status for the current user
     */
    getOnboardingStatus: async (): Promise<UserOnboardingStatusResponse> => {
        try {
            const {data} = await apiClient.get<UserOnboardingStatusResponse>('/users/onboarding');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getOnboardingStatus");
        }
    },

    /**
     * Complete onboarding and get a fresh token
     */
    completeOnboarding: async (request: UserOnboardingRequest): Promise<AuthResponse> => {
        try {
            const { data } = await apiClient.post<AuthResponse>('/users/onboarding', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.completeOnboarding");
        }
    },

    /**
     * Get current user details
     */
    getCurrentUser: async (): Promise<UserResponse> => {
        try {
            const { data } = await apiClient.get<UserResponse>('/users');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getCurrentUser");
        }
    },

    /**
     * Update current user profile
     */
    updateCurrentUser: async (request: UserUpdateRequest): Promise<UserResponse> => {
        try {
            const { data } = await apiClient.put<UserResponse>('/users', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.updateCurrentUser");
        }
    },

    /**
     * Delete current user account
     */
    deleteCurrentUser: async (): Promise<void> => {
        try {
            await apiClient.delete('/users');
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.deleteCurrentUser");
        }
    },

    /**
     * Get presigned URL for profile photo upload
     */
    getProfilePhotoUploadUrl: async (request: UploadUrlRequest): Promise<UploadUrlResponse> => {
        try {
            const {data} = await apiClient.post<UploadUrlResponse>('/users/profile-photo/upload-url', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getProfilePhotoUrl");
        }
    },

    /**
     * Get user homepage data
     */
    getHomepage: async (): Promise<UserHomepageResponse> => {
        try {
            const {data} = await apiClient.get<UserHomepageResponse>('/users/homepage');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getHomepage");
        }
    },

    /**
     * Get current user profile for profile tab
     */
    getCurrentUserProfile: async (): Promise<CurrentUserProfileResponse> => {
        try {
            const {data} = await apiClient.get<CurrentUserProfileResponse>('/users/profile');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getCurrentUserProfile");
        }
    },

    /**
     * Get another user's profile
     */
    getOtherUserProfile: async (otherUserId: string): Promise<OtherUserProfileResponse> => {
        try {
            const {data} = await apiClient.get<OtherUserProfileResponse>(`/users/${otherUserId}/profile`);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "userService.getOtherUserProfile");
        }
    },
};

export default userService;