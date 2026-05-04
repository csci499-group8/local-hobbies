import apiClient from '../config';
import {
    HobbyResponse,
    HobbyCreationRequest,
    HobbyUpdateRequest,
    GlobalHobbyResponse,
    HobbyPhotoResponse,
    HobbyPhotoCreationRequest,
    HobbyPhotoUpdateRequest
} from '../../types/hobby';
import { UploadUrlRequest, UploadUrlResponse } from '../../types/common';
import {handleGeneralError} from "@/src/utils/error-helpers";

const hobbyService = {
    /**
     * Get all hobbies for the current user
     */
    getHobbies: async (): Promise<HobbyResponse[]> => {
        try {
            const { data } = await apiClient.get<HobbyResponse[]>('/hobbies');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.getHobbies");
        }
    },

    /**
     * Add a new hobby to the current user
     */
    addHobby: async (request: HobbyCreationRequest): Promise<HobbyResponse> => {
        try {
            const { data } = await apiClient.post<HobbyResponse>('/hobbies', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.addHobby");
        }
    },

    /**
     * Update a user's hobby
     */
    updateHobby: async (hobbyId: string, request: HobbyUpdateRequest): Promise<HobbyResponse> => {
        try {
            const { data } = await apiClient.put<HobbyResponse>(`/hobbies/${hobbyId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.updateHobby");
        }
    },

    /**
     * Delete a user's hobby
     */
    deleteHobby: async (hobbyId: string): Promise<void> => {
        try {
            await apiClient.delete(`/hobbies/${hobbyId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.deleteHobby");
        }
    },

    /**
     * Get all available global hobbies
     */
    getGlobalHobbies: async (): Promise<GlobalHobbyResponse[]> => {
        try {
            const {data} = await apiClient.get<GlobalHobbyResponse[]>('/hobbies/global');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.getGlobalHobbies");
        }
    },

    /**
     * Get presigned URL for hobby photo upload
     */
    getHobbyPhotoUploadUrl: async (hobbyId: string, request: UploadUrlRequest): Promise<UploadUrlResponse> => {
        try {
            const {data} = await apiClient.post<UploadUrlResponse>(`/hobbies/${hobbyId}/photos/upload-url`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.getHobbyPhotoUploadUrl");
        }
    },

    /**
     * Get all hobby photos for the current user
     */
    getHobbyPhotos: async (): Promise<HobbyPhotoResponse[]> => {
        try {
            const {data} = await apiClient.get<HobbyPhotoResponse[]>('/hobbies/photos');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.getHobbyPhotos");
        }
    },

    /**
     * Get hobby photos by hobby ID
     */
    getHobbyPhotosByHobbyId: async (hobbyId: string): Promise<HobbyPhotoResponse[]> => {
        try {
            const {data} = await apiClient.get<HobbyPhotoResponse[]>(`/hobbies/${hobbyId}/photos`);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.getHobbyPhotosByHobbyId");
        }
    },

    /**
     * Add a photo to a hobby
     */
    addHobbyPhoto: async (hobbyId: string, request: HobbyPhotoCreationRequest): Promise<HobbyPhotoResponse> => {
        try {
            const {data} = await apiClient.post<HobbyPhotoResponse>(`/hobbies/${hobbyId}/photos`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.addHobbyPhoto");
        }
    },

    /**
     * Update hobby photo metadata
     */
    updateHobbyPhoto: async (photoId: string, request: HobbyPhotoUpdateRequest): Promise<HobbyPhotoResponse> => {
        try {
            const {data} = await apiClient.put<HobbyPhotoResponse>(`/hobbies/photos/${photoId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.updateHobbyPhoto");
        }
    },

    /**
     * Delete a hobby photo
     */
    deleteHobbyPhoto: async (photoId: string): Promise<void> => {
        try {
            await apiClient.delete(`/hobbies/photos/${photoId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "hobbyService.deleteHobbyPhoto");
        }
    },
};

export default hobbyService;

// const fileKey = await performTwoStepUpload(
//     uri,
//     name,
//     type,
//     (n, t) => hobbyService.generatePresignedUploadUrl(hobbyId, n, t)
// );