import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import availabilityService from '@/src/api/services/availability-service';
import {
    OneTimeAvailabilityUpdateRequest,
    RecurringAvailabilityCreationRequest,
    RecurringAvailabilityUpdateRequest,
    AvailabilityExceptionCreationRequest,
    AvailabilityExceptionUpdateRequest,
} from '@/src/types/availability';

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
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const updateOneTimeMutation = useMutation({
        mutationFn: ({oneTimeId, request}: {oneTimeId: string; request: OneTimeAvailabilityUpdateRequest}) =>
            availabilityService.updateOneTimeAvailability(oneTimeId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const deleteOneTimeMutation = useMutation({
        mutationFn: (oneTimeId: string) =>
            availabilityService.deleteOneTimeAvailability(oneTimeId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    //recurring availability mutations

    const addRecurringMutation = useMutation({
        mutationFn: (request: RecurringAvailabilityCreationRequest) =>
            availabilityService.addRecurringAvailability(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const updateRecurringMutation = useMutation({
        mutationFn: ({recurringId, request}: {recurringId: string; request: RecurringAvailabilityUpdateRequest}) =>
            availabilityService.updateRecurringAvailability(recurringId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const deleteRecurringMutation = useMutation({
        mutationFn: (recurringId: string) =>
            availabilityService.deleteRecurringAvailability(recurringId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    //availability exception mutations

    const addExceptionMutation = useMutation({
        mutationFn: (request: AvailabilityExceptionCreationRequest) =>
            availabilityService.addAvailabilityException(request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const updateExceptionMutation = useMutation({
        mutationFn: ({exceptionId, request}: {exceptionId: string; request: AvailabilityExceptionUpdateRequest}) =>
            availabilityService.updateAvailabilityException(exceptionId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
        },
    });

    const deleteExceptionMutation = useMutation({
        mutationFn: (exceptionId: string) => availabilityService.deleteAvailabilityException(exceptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: availabilityKeys.schedule()});
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