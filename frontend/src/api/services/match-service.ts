import apiClient from '../config';
import {
    MatchSearchRequest,
    MatchSearchResultResponse,
    SavedMatchCreationRequest,
    SavedMatchResponse,
    SavedMatchUpdateRequest,
    MutualMatchResponse
} from '../../types/match';
import { handleGeneralError } from "@/src/utils/error-helpers";

const matchService = {
    /**
     * Search for potential hobby matches based on hobby, location, availability, and other filters
     */
    searchForMatches: async (request: MatchSearchRequest): Promise<MatchSearchResultResponse[]> => {
        try {
            const { data } = await apiClient.post<MatchSearchResultResponse[]>('/matches/search', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.searchForMatches");
        }
    },

    /**
     * Retrieve list of matches the user has saved
     */
    getSavedMatches: async (): Promise<SavedMatchResponse[]> => {
        try {
            const { data } = await apiClient.get<SavedMatchResponse[]>('/matches/saved');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.getSavedMatches");
        }
    },

    /**
     * Save a user to the saved matches list
     */
    createSavedMatch: async (request: SavedMatchCreationRequest): Promise<SavedMatchResponse> => {
        try {
            const { data } = await apiClient.post<SavedMatchResponse>('/matches/saved', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.createSavedMatch");
        }
    },

    /**
     * Update notes on a saved match
     */
    updateSavedMatch: async (matchId: string, request: SavedMatchUpdateRequest): Promise<SavedMatchResponse> => {
        try {
            const { data } = await apiClient.put<SavedMatchResponse>(`/matches/saved/${matchId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.updateSavedMatch");
        }
    },

    /**
     * Remove a match from the saved list (soft delete)
     */
    deleteSavedMatch: async (matchId: string): Promise<void> => {
        try {
            await apiClient.delete(`/matches/saved/${matchId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.deleteSavedMatch");
        }
    },

    /**
     * Get list of recently deleted matches
     */
    getDeletedSavedMatches: async (): Promise<SavedMatchResponse[]> => {
        try {
            const { data } = await apiClient.get<SavedMatchResponse[]>('/matches/deleted');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.getDeletedSavedMatches");
        }
    },

    /**
     * Restore a soft-deleted match
     */
    restoreSavedMatch: async (matchId: string): Promise<SavedMatchResponse> => {
        try {
            const { data } = await apiClient.post<SavedMatchResponse>(`/matches/deleted/${matchId}`);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.restoreSavedMatch");
        }
    },

    /**
     * Get matches where both users have saved each other
     */
    getMutualMatches: async (): Promise<MutualMatchResponse[]> => {
        try {
            const { data } = await apiClient.get<MutualMatchResponse[]>('/matches/mutual');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "matchService.getMutualMatches");
        }
    },
};

export default matchService;