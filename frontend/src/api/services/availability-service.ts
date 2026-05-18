import apiClient from '../config';
import {
    ScheduleResponse,
    OneTimeAvailabilityCreationRequest,
    OneTimeAvailabilityUpdateRequest,
    OneTimeAvailabilityResponse,
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityUpdateRequest,
    RecurringAvailabilityResponse,
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
    AvailabilityExceptionResponse
} from '../../types/availability';
import {handleGeneralError} from "@/src/utils/error-helpers";

const availabilityService = {
    /**
     * Get the current user's full schedule in time intervals and in raw availabilities
     */
    getSchedule: async (): Promise<ScheduleResponse> => {
        try {
            const {data} = await apiClient.get<ScheduleResponse>('/availabilities');
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.getSchedule");
        }
    },

    /**
     * Add a one-time availability
     */
    addOneTimeAvailability: async (request: OneTimeAvailabilityCreationRequest): Promise<OneTimeAvailabilityResponse> => {
        try {
            const {data} = await apiClient.post<OneTimeAvailabilityResponse>('/availabilities/one-times', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.addOneTimeAvailability");
        }
    },

    /**
     * Update a one-time availability
     */
    updateOneTimeAvailability: async (oneTimeId: string, request: OneTimeAvailabilityUpdateRequest): Promise<OneTimeAvailabilityResponse> => {
        try {
            const {data} = await apiClient.put<OneTimeAvailabilityResponse>(`/availabilities/one-times/${oneTimeId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.updateOneTimeAvailability");
        }
    },

    /**
     * Delete a one-time availability
     */
    deleteOneTimeAvailability: async (oneTimeId: string): Promise<void> => {
        try {
            await apiClient.delete(`/availabilities/one-times/${oneTimeId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.deleteOneTimeAvailability");
        }
    },

    /**
     * Add a recurring availability
     */
    addRecurringAvailability: async (request: RecurringAvailabilityCreationRequest): Promise<RecurringAvailabilityResponse> => {
        try {
            const {data} = await apiClient.post<RecurringAvailabilityResponse>('/availabilities/recurrings', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.addRecurringAvailability");
        }
    },

    /**
     * Update a recurring availability
     */
    updateRecurringAvailability: async (recurringId: string, request: RecurringAvailabilityUpdateRequest): Promise<RecurringAvailabilityResponse> => {
        try {
            const {data} = await apiClient.put<RecurringAvailabilityResponse>(`/availabilities/recurrings/${recurringId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.updateRecurringAvailability");
        }
    },

    /**
     * Delete a recurring availability
     */
    deleteRecurringAvailability: async (recurringId: string): Promise<void> => {
        try {
            await apiClient.delete(`/availabilities/recurrings/${recurringId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.deleteRecurringAvailability");
        }
    },

    /**
     * Add an exception to a recurring availability
     */
    addAvailabilityException: async (request: AvailabilityExceptionCreationRequest): Promise<AvailabilityExceptionResponse> => {
        try {
            const {data} = await apiClient.post<AvailabilityExceptionResponse>('/availabilities/exceptions', request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.addAvailabilityException");
        }
    },

    /**
     * Update an availability exception
     */
    updateAvailabilityException: async (exceptionId: string, request: AvailabilityExceptionUpdateRequest): Promise<AvailabilityExceptionResponse> => {
        try {
            const {data} = await apiClient.put<AvailabilityExceptionResponse>(`/availabilities/exceptions/${exceptionId}`, request);
            return data;
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.updateAvailabilityException");
        }
    },

    /**
     * Delete an availability exception
     */
    deleteAvailabilityException: async (exceptionId: string): Promise<void> => {
        try {
            await apiClient.delete(`/availabilities/exceptions/${exceptionId}`);
        } catch (error: unknown) {
            return handleGeneralError(error, "availabilityService.deleteAvailabilityException");
        }
    },
};

export default availabilityService;
