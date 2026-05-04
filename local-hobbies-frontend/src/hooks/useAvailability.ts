import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import availabilityService from '@/src/api/services/availability-service';
import {
    OneTimeAvailabilityUpdateRequest,
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityUpdateRequest,
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
} from '@/src/types/availability';
import {
    addOneTimeToSchedule,
    updateOneTimeInSchedule,
    deleteOneTimeFromSchedule,
    deleteRecurringAndExceptionsFromSchedule,
    addExceptionToSchedule,
    updateExceptionInSchedule,
    deleteExceptionFromSchedule,
} from '@/src/utils/availability-helpers';

/**
 * Retrieving the entire flattened availability schedule is calculation-heavy on
 * the server side, so interval writes are performed client-side where possible.
 */

export const availabilityKeys = {
    all: ['availability'] as const,
    schedule: () => [...availabilityKeys.all, 'schedule'] as const,
};

export const useAvailability = () => {
    const queryClient = useQueryClient();

    //read query

    const scheduleQuery = useQuery({
        queryKey: availabilityKeys.schedule(),
        queryFn: availabilityService.getSchedule,
    });

    //one-time availability mutations

    const addOneTimeMutation = useMutation({
        mutationFn: availabilityService.addOneTimeAvailability,
        onSuccess: (newOneTime) => {
            queryClient.setQueryData(availabilityKeys.schedule(), addOneTimeToSchedule(newOneTime));
        },
    });

    const updateOneTimeMutation = useMutation({
        mutationFn: ({oneTimeId, request}: {oneTimeId: string; request: OneTimeAvailabilityUpdateRequest}) =>
            availabilityService.updateOneTimeAvailability(oneTimeId, request),
        onSuccess: (updatedOneTime) => {
            queryClient.setQueryData(availabilityKeys.schedule(), updateOneTimeInSchedule(updatedOneTime));
        },
    });

    const deleteOneTimeMutation = useMutation({
        mutationFn: (oneTimeId: string) =>
            availabilityService.deleteOneTimeAvailability(oneTimeId),
        onSuccess: (_, oneTimeId) => {
            queryClient.setQueryData(availabilityKeys.schedule(), deleteOneTimeFromSchedule(oneTimeId));
        },
    });

    //recurring availability mutations

    const addRecurringMutation = useMutation({
        mutationFn: (request: RecurringAvailabilityCreationRequest) =>
            availabilityService.addRecurringAvailability(request),
        onSuccess: () => {
            //too complicated to compute intervals client-side
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const updateRecurringMutation = useMutation({
        mutationFn: ({recurringId, request}: {recurringId: string; request: RecurringAvailabilityUpdateRequest}) =>
            availabilityService.updateRecurringAvailability(recurringId, request),
        onSuccess: () => {
            //too complicated to compute intervals client-side
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const deleteRecurringMutation = useMutation({
        mutationFn: (recurringId: string) =>
            availabilityService.deleteRecurringAvailability(recurringId),
        onSuccess: (_, recurringId) => {
            queryClient.setQueryData(availabilityKeys.schedule(), deleteRecurringAndExceptionsFromSchedule(recurringId));
        },
    });

    //availability exception mutations

    const addExceptionMutation = useMutation({
        mutationFn: (request: AvailabilityExceptionCreationRequest) =>
            availabilityService.addAvailabilityException(request),
        onSuccess: (newException) => {
            queryClient.setQueryData(availabilityKeys.schedule(), addExceptionToSchedule(newException));
        },
    });

    const updateExceptionMutation = useMutation({
        mutationFn: ({exceptionId, request}: {exceptionId: string; request: AvailabilityExceptionUpdateRequest}) =>
            availabilityService.updateAvailabilityException(exceptionId, request),
        onSuccess: (updatedException) => {
            queryClient.setQueryData(availabilityKeys.schedule(), updateExceptionInSchedule(updatedException));
        },
    });

    const deleteExceptionMutation = useMutation({
        mutationFn: (exceptionId: string) => availabilityService.deleteAvailabilityException(exceptionId),
        onSuccess: (_, exceptionId) => {
            queryClient.setQueryData(availabilityKeys.schedule(), deleteExceptionFromSchedule(exceptionId));
        },
    });

    return {
        //schedule
        schedule: scheduleQuery.data ?? null,
        scheduleLoading: scheduleQuery.isLoading,
        scheduleError: scheduleQuery.error?.message ?? null,

        //one-time availabilities
        addOneTimeAvailability: addOneTimeMutation.mutateAsync,
        updateOneTimeAvailability: updateOneTimeMutation.mutateAsync,
        deleteOneTimeAvailability: deleteOneTimeMutation.mutateAsync,

        //recurring availabilities
        addRecurringAvailability: addRecurringMutation.mutateAsync,
        updateRecurringAvailability: updateRecurringMutation.mutateAsync,
        deleteRecurringAvailability: deleteRecurringMutation.mutateAsync,

        //availability exceptions
        addAvailabilityException: addExceptionMutation.mutateAsync,
        updateAvailabilityException: updateExceptionMutation.mutateAsync,
        deleteAvailabilityException: deleteExceptionMutation.mutateAsync,
    };
};